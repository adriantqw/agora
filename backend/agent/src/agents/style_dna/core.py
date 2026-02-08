"""Style DNA Agent for maintaining long-term user style profiles."""
import mlflow
from pydantic import FileUrl, FilePath
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, AIMessage, HumanMessage, RemoveMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from langgraph.prebuilt.tool_node import ToolNode

from .states import StyleDnaState
from .schemas import GoogleImageSearchQuery
from ..tools import load_image, google_search
from ..schemas import StyleDna, JourneySchema
from ...utils.google_img_search import search_images
from ..memory_utils import AgoraMemory
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

load_dotenv()

class StyleDnaAgent:
    """
    Style DNA Agent for maintaining long-term user style profiles.

    Supports two input scenarios:
    1. OOTD images: User uploads outfit-of-the-day photos
    2. Interaction state: Other agents send JourneySchema data

    Uses a stability protocol (85%/15% weighting) to prevent single
    outliers from overwriting established preferences.
    """

    def __init__(self):
        """Initialize the agent with model, tools, memory, and checkpointer."""
        # mlflow.langchain.autolog()
        self.agent_key = "style_dna"
        self.agent_config: dict = load_config("agent")[self.agent_key]
        self.model = load_model_from_config(self.agent_config["model"])
        self.recursion_limit = self.agent_config["recursion_limit"]
        self.max_context_msgs = self.agent_config["max_context_msgs"]

        # Load prompts
        templates = load_prompt_templates()
        self.system_prompt: str = templates[self.agent_key]
        self.system_prompt_celebrity_img_search: str = templates["celebrity_img_search"]

        # Initialize memory
        self.memory = AgoraMemory()

        # Define checkpointer
        self.checkpointer = MemorySaver()

        # Define available tools
        self.tools = [load_image]
        if self.agent_config.get("enable_google_search_tool", True):
            self.tools.append(google_search)

        # Compile graph
        self.agent = self._compile_graph()

    def update_from_ootd(
        self, user_id: str, ootd_images: list[FileUrl | FilePath], thread_id: str
    ) -> dict:
        """
        Update Style DNA based on OOTD images.

        Args:
            user_id: Unique user identifier for memory lookup
            ootd_images: List of image URLs or file paths
            thread_id: Conversation thread identifier

        Returns:
            dict: Agent state including updated_style_dna
        """
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }
        return self.agent.invoke({
            "user_id": user_id,
            "ootd_images": ootd_images,
            "messages": []
        }, config=config)

    def update_from_interaction(
        self, user_id: str, interaction_state: JourneySchema, thread_id: str
    ) -> dict:
        """
        Update Style DNA based on interaction state from another agent.

        Args:
            user_id: Unique user identifier for memory lookup
            interaction_state: JourneySchema from PersonalStylist or other agents
            thread_id: Conversation thread identifier

        Returns:
            dict: Agent state including updated_style_dna
        """
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }
        return self.agent.invoke({
            "user_id": user_id,
            "interaction_state": interaction_state,
            "messages": []
        }, config=config)

    async def update_from_ootd_stream(
        self, user_id: str, ootd_images: list[str], thread_id: str
    ):
        """
        Streaming version of update_from_ootd.

        Args:
            user_id: Unique user identifier for memory lookup
            ootd_images: List of image URLs or file paths
            thread_id: Conversation thread identifier

        Yields:
            Event dictionaries from the agent execution
        """
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }
        return self.agent.astream_events({
            "user_id": user_id,
            "ootd_images": ootd_images,
            "messages": []
        }, config=config, version="v2")

    async def update_from_interaction_stream(
        self, user_id: str, interaction_state: JourneySchema, thread_id: str
    ):
        """
        Streaming version of update_from_interaction.

        Args:
            user_id: Unique user identifier for memory lookup
            interaction_state: JourneySchema from PersonalStylist or other agents
            thread_id: Conversation thread identifier

        Yields:
            Event dictionaries from the agent execution
        """
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }
        return self.agent.astream_events({
            "user_id": user_id,
            "interaction_state": interaction_state,
            "messages": []
        }, config=config, version="v2")

    def get_style_dna(self, user_id: str) -> StyleDna | None:
        """
        Retrieve current Style DNA for a user.

        Args:
            user_id: Unique user identifier

        Returns:
            StyleDna: Current style profile or None if not exists
        """
        try:
            dna_dict = self.memory.retrieve_memory(user_id)
            return StyleDna(**dna_dict)
        except (IndexError, Exception):
            return None

    def get_state(self, thread_id: str):
        """
        Get the current state for a thread.

        Args:
            thread_id: Unique identifier for the conversation thread

        Returns:
            StateSnapshot: Current state of the agent for this thread
        """
        config = {"configurable": {"thread_id": thread_id}}
        return self.agent.get_state(config)

    # ─────────────────────────────────────────────────────────────────
    # Private Node Methods
    # ─────────────────────────────────────────────────────────────────

    def _load_memory(self, state: StyleDnaState):
        """Load current StyleDna from memory."""
        user_id = state.get("user_id")
        try:
            current_dna_dict = self.memory.retrieve_memory(user_id)
            current_dna = StyleDna(**current_dna_dict)
        except (IndexError, Exception):
            # No existing DNA, start fresh
            current_dna = None

        return {"current_style_dna": current_dna}

    def _trim_messages(self, state: StyleDnaState):
        """Trim message history"""
        messages = state.get("messages", [])

        if len(messages) <= self.max_context_msgs:
            return {}

        # Identify the oldest messages to drop
        number_to_delete = len(messages) - self.max_context_msgs

        # Create RemoveMessage objects for those IDs
        to_remove = [RemoveMessage(id=m.id) for m in messages[:number_to_delete]]

        return {"messages": to_remove}

    def _analyze_ootd(self, state: StyleDnaState):
        """Pre-process OOTD images into multimodal messages."""
        ootd_images = state.get("ootd_images", [])
        content = [{"type": "text", "text": "Analyze the following outfit-of-the-day images:"}]

        for img_path in ootd_images:
            img_content = load_image.invoke({"image_url": img_path})
            content.extend(img_content)

        return {"messages": [HumanMessage(content=content)]}

    def _analyze_interaction(self, state: StyleDnaState):
        """Format interaction state for LLM analysis."""
        message_content = f"Analyze new interaction data from user journey"
        return {"messages": [HumanMessage(content=message_content)]}

    def _invoke_model(self, state: StyleDnaState):
        """Invoke the LLM with style DNA context."""
        current_dna = state.get("current_style_dna")
        interaction = state.get("interaction_state")

        prompt = self.system_prompt.format(
            current_style_dna=current_dna.model_dump_json() if current_dna else "No existing Style DNA - this is the user's first interaction.",
            interaction_state=interaction.model_dump_json() if interaction else "OOTD image analysis mode - analyze the uploaded images.",
            style_dna_schema=StyleDna.model_json_schema()
        )

        messages = [SystemMessage(content=prompt)] + state["messages"]
        response = self.model.bind_tools(self.tools).invoke(messages)

        return {"messages": [response]}

    def _should_continue(self, state: StyleDnaState):
        """Determine whether to continue processing."""
        last_message: AIMessage = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return "parse_dna"

    def _parse_dna(self, state: StyleDnaState):
        """Parse StyleDna from LLM response."""
        structured_model = self.model.with_structured_output(StyleDna)
        updated_dna: StyleDna = structured_model.invoke(state["messages"])
        return {"updated_style_dna": updated_dna}

    def _save_memory(self, state: StyleDnaState):
        """Persist updated StyleDna to memory."""
        user_id = state.get("user_id")
        updated_dna = state.get("updated_style_dna")

        if updated_dna and user_id:
            self.memory.update_memory(user_id, updated_dna)

        return {}

    def _route_after_load(self, state: StyleDnaState) -> str:
        """Route to appropriate analysis node after loading memory."""
        if state.get("ootd_images"):
            return "analyze_ootd"
        elif state.get("interaction_state"):
            return "analyze_interaction"
        else:
            return "agent"
        
    def _find_celebrity_image(self, state: StyleDnaState):
        """Find celebrity images using google image search"""
        # Get latest StyleDna
        updated_dna: StyleDna = state.get("updated_style_dna")

        prompt = self.system_prompt_celebrity_img_search.format(
            cebrity_twin_name=updated_dna.celebrity_style_twin,
            celebrity_twin_reasoning=updated_dna.celebrity_twin_reasoning
        )
        structured_model = self.model.with_structured_output(GoogleImageSearchQuery)
        query = structured_model.invoke([HumanMessage(prompt)]).query

        # Search celebrity images if no existing images
        if updated_dna.celebrity_style_twin and not updated_dna.celebrity_twin_images:
            search_results = search_images(query)
            
            if search_results:
                updated_dna = updated_dna.model_copy(update={"celebrity_twin_images": search_results})
        
        return {"updated_style_dna": updated_dna}

    # ─────────────────────────────────────────────────────────────────
    # Graph Compilation
    # ─────────────────────────────────────────────────────────────────

    def _compile_graph(self):
        """Compile the agent's state graph."""
        workflow = StateGraph(StyleDnaState)
        tool_node = ToolNode(self.tools)

        # Define nodes
        workflow.add_node("load_memory", self._load_memory)
        workflow.add_node("trim_messages", self._trim_messages)
        workflow.add_node("analyze_ootd", self._analyze_ootd)
        workflow.add_node("analyze_interaction", self._analyze_interaction)
        workflow.add_node("agent", self._invoke_model)
        workflow.add_node("tools", tool_node)
        workflow.add_node("parse_dna", self._parse_dna)
        workflow.add_node("find_celebrity_image", self._find_celebrity_image)
        workflow.add_node("save_memory", self._save_memory)

        # Entry point - always load memory first
        workflow.set_entry_point("load_memory")

        # After loading memory, trim messages
        workflow.add_edge("load_memory", "trim_messages")

        # After trimming, route based on input type
        workflow.add_conditional_edges(
            "trim_messages",
            self._route_after_load,
            {
                "analyze_ootd": "analyze_ootd",
                "analyze_interaction": "analyze_interaction",
                "agent": "agent"
            }
        )

        # Analysis nodes lead to agent
        workflow.add_edge("analyze_ootd", "agent")
        workflow.add_edge("analyze_interaction", "agent")

        # Agent routing - either call tools or parse DNA
        workflow.add_conditional_edges(
            "agent",
            self._should_continue,
            {"tools": "tools", "parse_dna": "parse_dna"}
        )

        # Tools loop back to agent
        workflow.add_edge("tools", "agent")

        # Parse DNA leads to find celeb image
        workflow.add_edge("parse_dna", "find_celebrity_image")

        # Find celeb image leads to save memory
        workflow.add_edge("find_celebrity_image", "save_memory")

        # Save memory ends the flow
        workflow.add_edge("save_memory", END)

        return workflow.compile(checkpointer=self.checkpointer, name=self.agent_key)
