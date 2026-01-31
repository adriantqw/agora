import json
import mlflow
import uuid

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langgraph.graph import END

from .states import PersonalStylistState
from .tools import update_mood_board
from ..tools import Txt2ImgGenerator
from .schemas import UIInputList, UserResponse
from ..tools import load_image, google_search
from ..schemas import JourneySchema
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

load_dotenv()


class PersonalStylistAgent:
    """
    React-style Personal Stylist Agent with UI generation tools.

    Uses custom LangGraph's react agent pattern with prebuilt checkpointer
    for session management via thread IDs.
    """

    def __init__(self):
        """Initialize the agent with model, tools, and checkpointer."""
        mlflow.langchain.autolog()
        self.agent_key = "personal_stylist"
        self.agent_config = load_config("agent")[ self.agent_key]
        self.model = load_model_from_config(self.agent_config["model"])
        self.recursion_limit = self.agent_config["recursion_limit"]

        # Load separate prompts for journey update and UI generation
        templates = load_prompt_templates()
        self.journey_update_prompt: str = templates[f"{self.agent_key}_journey_update"]
        self.ui_generation_prompt: str = templates[f"{self.agent_key}_ui_generation"]

        # Load personality configuration
        self.personality_config: dict = load_config("personality")

        self.checkpointer = MemorySaver()

        # Define available tools
        image_generator = Txt2ImgGenerator()
        self.tools = image_generator.get_tools() + [load_image, update_mood_board]
        if self.agent_config["enable_google_search_tool"]:
            self.tools.append(google_search)
            
        # Create react agent with custom state schema and middleware
        self.agent = self._compile_graph()

    def chat(self, message: str, thread_id: str, personality: str = 'friendly') -> dict:
        """
        Invoke the agent with a message and thread_id for session continuity.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Agent state including messages, ui_inputs, ui_answers, journey
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.invoke({"messages": [("user", message)], "personality": personality}, config=config)
    
    def submit_answers(self, thread_id: str, answers: list[UserResponse], personality: str = 'friendly') -> dict:
        """
        Submit UI answers to update the journey.

        Args:
            thread_id: Unique identifier for the conversation thread
            answers: List of UserResponse objects with answers to UI questions
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Updated agent state
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.invoke({"ui_answers": answers, "personality": personality}, config=config)

    async def chat_stream(self, message: str, thread_id: str, personality: str = 'friendly'):
        """
        Invoke the agent with a message and thread_id for session continuity. Streams event updates to the UI.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread
            personality: Agent personality configuration (e.g. 'friendly')

        Yields:
            Event dictionaries from the agent execution
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.astream_events({"messages": [("user", message)], "personality": personality}, config=config, version="v2")
    
    async def submit_answers_stream(self, thread_id: str, answers: list[UserResponse], personality: str = 'friendly') -> dict:
        """
        Invoke the agent with a message and thread_id for session continuity. Streams event updates to the UI.

        Args:
            thread_id: Unique identifier for the conversation thread
            answers: List of UserResponse objects with answers to UI questions
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Updated agent state
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": self.recursion_limit}
        return self.agent.astream_events({"ui_answers": answers, "personality": personality}, config=config, version="v2")

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
    
    def _has_pending_user_input(self, state: PersonalStylistState) -> str:
        """Check if there are pending answers or user messages to process."""
        ui_answers = state.get("ui_answers", [])
        last_message = state.get("messages", [])[-1] if state.get("messages") else None
        if ui_answers or isinstance(last_message, HumanMessage):
            return "update_journey"
        return "agent"

    def _update_journey(self, state: PersonalStylistState):
        """Use LLM to correlate answers and update journey."""
        ui_answers = state.get("ui_answers")
        journey = state.get("journey")
        ui_inputs = state.get("ui_inputs")
        last_msg = state.get("messages", [])[-1]

        # Format the journey update prompt
        prompt = self.journey_update_prompt.format(
            journey_state=journey.model_dump_json() if journey else "None",
            ui_inputs_history=json.dumps([ui.model_dump() for ui in ui_inputs]) if ui_inputs else "None",
            ui_answers=json.dumps([ans.model_dump() for ans in ui_answers]) if ui_answers else "None"
        )

        # Use structured output to get updated journey
        structured_model = self.model.with_structured_output(JourneySchema)
        if ui_answers:
            updated_journey = structured_model.invoke([HumanMessage(content=prompt)])
        elif isinstance(last_msg, HumanMessage):
            updated_journey = structured_model.invoke([SystemMessage(content=prompt)] + [last_msg])

        return {
            "journey": updated_journey,
            "ui_answers": []  # Clear processed answers
        }

    def _invoke_model(self, state: PersonalStylistState):
        """Invoke the model to generate UI components."""
        journey: JourneySchema = state.get("journey")

        # Get personality instructions from state
        personality = state.get("personality", "friendly")
        personality_instructions = self.personality_config.get(personality, self.personality_config["friendly"])

        # Format prompt with journey context and personality
        prompt = self.ui_generation_prompt.format(
            personality_instructions=personality_instructions,
            journey_state=journey.model_dump_json() if journey else "No preferences yet",
            journey_schema=JourneySchema.model_json_schema(),
            ui_component_schema=UIInputList.model_json_schema(),
        )

        messages = [SystemMessage(content=prompt)] + state["messages"]
        response = self.model.bind_tools(self.tools).invoke(messages)
        return {"messages": [response]}

    def _should_agent_continue(self, state: PersonalStylistState):
        """Determine whether to continue processing."""
        last_message = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return "parse_ui"

    def _parse_ui_from_response(self, state: PersonalStylistState):
        """Parse UI components from agent's final response using structured output."""
        # Use structured output to get UI components
        structured_model = self.model.with_structured_output(UIInputList)
        final_response: UIInputList = structured_model.invoke(state["messages"])

        # Assign unique IDs to UI inputs and their image options if not provided
        for ui_input in final_response.ui_inputs:
            if ui_input.id is None:
                ui_input.id = str(uuid.uuid4().hex)
            if ui_input.image_options:
                for image_option in ui_input.image_options:
                    if image_option.id is None:
                        image_option.id = str(uuid.uuid4().hex)

        return {
            "messages": [AIMessage(final_response.message)],
            "ui_inputs": final_response.ui_inputs
        }

    def _compile_graph(self):
        """Compile the agent's state graph."""
        # Define the state graph
        workflow = StateGraph(PersonalStylistState)

        # Bind tools
        self.model_with_tools = self.model.bind_tools(self.tools)
        tool_node = ToolNode(self.tools)

        # Define nodes
        workflow.add_node("update_journey", self._update_journey)
        workflow.add_node("agent", self._invoke_model)
        workflow.add_node("tools", tool_node)
        workflow.add_node("parse_ui", self._parse_ui_from_response)

        # Entry point - check for pending answers first
        workflow.set_conditional_entry_point(
            self._has_pending_user_input,
            {
                "update_journey": "update_journey",
                "agent": "agent"
            }
        )

        # After journey update, go to agent
        workflow.add_edge("update_journey", "agent")

        # Agent routing - either call tools or parse UI output
        workflow.add_conditional_edges(
            "agent",
            self._should_agent_continue,
            {
                "tools": "tools",
                "parse_ui": "parse_ui"
            }
        )

        # Tools loop back to agent
        workflow.add_edge("tools", "agent")

        # Parse UI ends the flow
        workflow.add_edge("parse_ui", END)

        return workflow.compile(checkpointer=self.checkpointer, name=self.agent_key)
