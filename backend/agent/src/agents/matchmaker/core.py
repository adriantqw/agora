import mlflow
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langgraph.graph import END

from .states import MatchmakerState
from .schemas import MatchResult
from .tools import search_products
from ..tools import load_image, google_search
from ..personal_stylist.schemas import JourneySchema
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

load_dotenv()


class MatchMakerAgent:
    """
    React-style Matchmaker Agent with catalogue and product searching capabilities.

    Uses custom LangGraph's react agent pattern with prebuilt checkpointer
    for session management via thread IDs.
    """

    def __init__(self):
        """Initialize the agent with model, tools, and checkpointer."""
        mlflow.langchain.autolog()
        self.agent_key = "matchmaker"
        self.agent_config = load_config("agent")[self.agent_key]
        self.model = load_model_from_config(self.agent_config["model"])
        self.recursion_limit = self.agent_config["recursion_limit"]

        templates = load_prompt_templates()
        self.system_prompt: str = templates[self.agent_key]
        self.system_prompt_best_effort: str = templates[f"{self.agent_key}_best_match"]

        self.personality_config: dict = load_config("personality")

        self.checkpointer = MemorySaver()
        self.tools = [search_products, load_image]
        if self.agent_config["enable_google_search_tool"]:
            self.tools.append(google_search)
        self.agent = self._compile_graph()

    def match(self, journey: JourneySchema, thread_id: str, personality: str = 'friendly') -> dict:
        """
        Find products matching journey preferences.

        Args:
            journey: JourneySchema with user preferences
            thread_id: Unique identifier for the conversation thread
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Agent state including messages and matches
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        # Invoke agent
        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.invoke({
            "journey": journey,
            "messages": [("user", f"Find products matching: {journey.model_dump_json()}")],
            "personality": personality
        }, config=config)
    
    def match_stream(self, journey: JourneySchema, thread_id: str, personality: str = 'friendly') -> dict:
        """
        Find products matching journey preferences in streaming mode.

        Args:
            journey: JourneySchema with user preferences
            thread_id: Unique identifier for the conversation thread
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Agent state including messages and matches
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.astream_events({
            "journey": journey,
            "messages": [("user", f"Find products matching: {journey.model_dump_json()}")],
            "personality": personality
        }, config=config, version="v2")

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
    
    def _invoke_model(self, state: MatchmakerState):
        """Invoke the model to generate search queries."""
        journey = state.get("journey")
        iteration_count = state.get("iteration_count", 0)

        # Get personality instructions from state
        personality = state.get("personality", "friendly")
        personality_instructions = self.personality_config.get(personality, self.personality_config["friendly"])

        # If approaching recursion limit use best effort system prompt
        if iteration_count >= (self.recursion_limit - 1):
            prompt = self.system_prompt_best_effort.format(
                personality_instructions=personality_instructions,
                journey=journey.model_dump_json() if journey else "No preferences",
                journey_schema=JourneySchema.model_json_schema(),
                match_results_schema=MatchResult.model_json_schema()
            )
            messages = [SystemMessage(content=prompt)] + state["messages"]
            response = self.model.invoke(messages)
        else:
            prompt = self.system_prompt.format(
                personality_instructions=personality_instructions,
                journey=journey.model_dump_json() if journey else "No preferences",
                journey_schema=JourneySchema.model_json_schema(),
                match_results_schema=MatchResult.model_json_schema()
            )
            messages = [SystemMessage(content=prompt)] + state["messages"]
            response = self.model.bind_tools(self.tools).invoke(messages)

        return {"messages": [response], "iteration_count": iteration_count + 1}

    def _should_continue(self, state: MatchmakerState):
        """Determine whether to continue processing."""
        last_message: AIMessage = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return "parse_matches"

    def _parse_matches(self, state: MatchmakerState):
        """Extract matches from tool results in messages."""
        structured_model = self.model.with_structured_output(MatchResult)
        response: MatchResult = structured_model.invoke(state["messages"])
        return {
            "messages": [AIMessage(response.message)],
            "matches": response.matches
        }

    def _compile_graph(self):
        """Compile the agent's state graph."""
        workflow = StateGraph(MatchmakerState)
        tool_node = ToolNode(self.tools)

        workflow.add_node("agent", self._invoke_model)
        workflow.add_node("tools", tool_node)
        workflow.add_node("parse_matches", self._parse_matches)

        workflow.set_entry_point("agent")
        workflow.add_conditional_edges("agent", self._should_continue, {
            "tools": "tools",
            "parse_matches": "parse_matches"
        })
        workflow.add_edge("tools", "agent")
        workflow.add_edge("parse_matches", END)

        return workflow.compile(checkpointer=self.checkpointer, name=self.agent_key)
