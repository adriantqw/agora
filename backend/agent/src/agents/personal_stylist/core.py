import json
import mlflow
import uuid
import logging

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, \
    HumanMessage, AIMessage, RemoveMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langgraph.graph import END

from .states import PersonalStylistState
from .tools import update_mood_board
from ..tools import Txt2ImgGenerator
from .schemas import UIInput, UIInputList, UserResponse
from ..tools import load_image, google_search
from ..schemas import JourneySchema
from ..memory_utils import AgoraMemory
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

logger = logging.getLogger(__name__)

load_dotenv()


class PersonalStylistAgent:
    """
    React-style Personal Stylist Agent with UI generation tools.

    Uses custom LangGraph's react agent pattern with prebuilt checkpointer
    for session management via thread IDs.
    """

    def __init__(self):
        """Initialize the agent with model, tools, and checkpointer."""
        # mlflow.langchain.autolog()
        self.agent_key = "personal_stylist"
        self.agent_config = load_config("agent")[ self.agent_key]
        self.model = load_model_from_config(self.agent_config["model"])
        self.recursion_limit = self.agent_config["recursion_limit"]
        self.max_context_msgs = self.agent_config["max_context_msgs"]

        # Load separate prompts for journey update and UI generation
        templates = load_prompt_templates()
        self.journey_update_prompt: str = templates[f"{self.agent_key}_journey_update"]
        self.ui_generation_prompt: str = templates[f"{self.agent_key}_ui_generation"]
        self.style_dna_prompt: str = templates["style_dna_prompt"]

        # Load personality configuration
        self.personality_config: dict = load_config("personality")

        # Define checkpointer
        self.checkpointer = MemorySaver()

        # Define memory store
        self.memory_store = AgoraMemory()

        # Define available tools
        image_generator = Txt2ImgGenerator()
        self.tools = image_generator.get_tools() + [load_image, update_mood_board]
        if self.agent_config["enable_google_search_tool"]:
            self.tools.append(google_search)
            
        # Create react agent with custom state schema and middleware
        self.agent = self._compile_graph()

    def chat(self, message: str, thread_id: str, user_id: str = None, personality: str = 'friendly') -> dict:
        """
        Invoke the agent with a message and thread_id for session continuity.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread
            user_id: Unique identifier for the user (used for memory retrieval)
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Agent state including messages, ui_inputs, ui_answers, journey
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        session_info = {"thread_id": thread_id}
        if user_id:
            session_info["user_id"] = user_id
        config = {"configurable": session_info, "recursion_limit": self.recursion_limit}

        return self.agent.invoke({"messages": [("user", message)], "personality": personality}, config=config)
    
    def submit_answers(self, thread_id: str, answers: list[UserResponse], user_id: str = None, personality: str = 'friendly') -> dict:
        """
        Submit UI answers to update the journey.

        Args:
            thread_id: Unique identifier for the conversation thread
            answers: List of UserResponse objects with answers to UI questions
            user_id: Unique identifier for the user (used for memory retrieval)
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Updated agent state
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        session_info = {"thread_id": thread_id}
        if user_id:
            session_info["user_id"] = user_id
        config = {"configurable": session_info, "recursion_limit": self.recursion_limit}

        return self.agent.invoke({"ui_answers": answers, "personality": personality}, config=config)

    async def chat_stream(self, message: str, thread_id: str, user_id: str = None, personality: str = 'friendly'):
        """
        Invoke the agent with a message and thread_id for session continuity. Streams event updates to the UI.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread
            user_id: Unique identifier for the user (used for memory retrieval)
            personality: Agent personality configuration (e.g. 'friendly')

        Yields:
            Event dictionaries from the agent execution
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")

        session_info = {"thread_id": thread_id}
        if user_id:
            session_info["user_id"] = user_id
        config = {"configurable": session_info, "recursion_limit": self.recursion_limit}
        logger.info(f"[chat_stream] Starting stream for thread {thread_id} with message: {message}")

        return self.agent.astream_events({"messages": [("user", message)], "personality": personality}, config=config, version="v2")
    
    async def submit_answers_stream(self, thread_id: str, answers: list[UserResponse], user_id: str = None, personality: str = 'friendly') -> dict:
        """
        Invoke the agent with a message and thread_id for session continuity. Streams event updates to the UI.

        Args:
            thread_id: Unique identifier for the conversation thread
            answers: List of UserResponse objects with answers to UI questions
            user_id: Unique identifier for the user (used for memory retrieval)
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Updated agent state
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(f"Personality '{personality}' not valid. Available personalities are: {list(self.personality_config.keys())}")
        
        session_info = {"thread_id": thread_id}
        if user_id:
            session_info["user_id"] = user_id
        config = {"configurable": session_info, "recursion_limit": self.recursion_limit}

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
        ui_inputs = state.get("ui_inputs")  # Now a nested list [[batch1], [batch2], ...]
        messages = state.get("messages", [])
        last_msg = messages[-1] if messages else None

        # Get the latest batch of questions for context
        latest_batch = ui_inputs[-1] if ui_inputs else []

        # Format the journey update prompt
        # Use mode='json' to properly serialize Path objects to strings
        # Handle both Pydantic models (UserResponse) and dicts (ui_inputs from state)
        def serialize_ui_input(ui):
            if hasattr(ui, 'model_dump'):
                return ui.model_dump(mode='json')
            return ui  # Already a dict

        def serialize_answer(ans):
            if hasattr(ans, 'model_dump'):
                return ans.model_dump(mode='json')
            return ans  # Already a dict

        prompt = self.journey_update_prompt.format(
            journey_state=journey.model_dump_json() if journey else "None",
            ui_inputs_history=json.dumps([serialize_ui_input(ui) for ui in latest_batch]) if latest_batch else "None",
            ui_answers=json.dumps([serialize_answer(ans) for ans in ui_answers]) if ui_answers else "None"
        )

        # Use structured output to get updated journey
        structured_model = self.model.with_structured_output(JourneySchema)
        if ui_answers:
            updated_journey = structured_model.invoke([HumanMessage(content=prompt)])
        elif isinstance(last_msg, HumanMessage):
            updated_journey = structured_model.invoke([SystemMessage(content=prompt)] + [last_msg])

        # Create a summary message of the user's answers for conversation history
        # This gives the LLM new context so it generates different questions next time
        answer_summary = self._format_answers_as_message(ui_answers, latest_batch)

        return {
            "journey": updated_journey,
            "ui_answers": [],  # Clear processed answers
            "messages": [HumanMessage(content=answer_summary)] if answer_summary else []
        }

    def _format_answers_as_message(self, ui_answers: list[UserResponse], ui_inputs: list[UIInput]) -> str:
        """Format user answers as a human-readable message for conversation history.

        This creates a HumanMessage that represents the user's answers,
        giving the LLM new context so it generates different questions next time.
        """
        if not ui_answers:
            return ""

        # Build a mapping of question_id to question text
        question_map = {}
        if ui_inputs:
            for ui in ui_inputs:
                q_id = ui.id if hasattr(ui, 'id') else ui.get('id')
                q_text = ui.question if hasattr(ui, 'question') else ui.get('question')
                if q_id and q_text:
                    question_map[q_id] = q_text

        # Format answers
        lines = []
        for answer in ui_answers:
            q_id = answer.question_id if hasattr(answer, 'question_id') else answer.get('question_id')
            question_text = question_map.get(q_id, f"Question {q_id}")

            # Extract answer value
            if hasattr(answer, 'selected_values') and answer.selected_values:
                value = ", ".join(str(val) for val in answer.selected_values)
            elif hasattr(answer, 'text_value') and answer.text_value:
                value = answer.text_value
            else:
                value = str(answer)

            lines.append(f"- {question_text}: {value}")

        return "My answers:\n" + "\n".join(lines)

    def _invoke_model(self, state: PersonalStylistState):
        """Invoke the model to generate UI components."""

        messages = []
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

        # Combine all system prompts into one to avoid multiple consecutive system messages
        combined_prompt = prompt
        if state.get("style_dna"):
            style_dna_prompt = self.style_dna_prompt.format(user_style_dna=state.get("style_dna"))
            combined_prompt = f"{prompt}\n\n{style_dna_prompt}"

        messages.append(SystemMessage(combined_prompt))

        # Filter state messages to ensure valid Gemini sequencing
        filtered_messages = self._filter_messages_for_gemini(state["messages"])
        messages.extend(filtered_messages)

        # Ensure last message is HumanMessage before invoking with tools
        if messages and not isinstance(messages[-1], HumanMessage):
            # If last message isn't HumanMessage, add a continuation prompt
            messages.append(HumanMessage(content="Please continue generating UI components based on the journey so far."))

        # Debug logging for message sequence
        logger.debug(f"Final message sequence before Gemini invoke: {[type(m).__name__ for m in messages]}")

        # Invoke model and return result
        response = self.model.bind_tools(self.tools).invoke(messages)
        return {"messages": [response]}

    def _should_agent_continue(self, state: PersonalStylistState):
        """Determine whether to continue processing."""
        last_message: AIMessage = state["messages"][-1]
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

        # Convert UIInput Pydantic models to dicts for msgpack serialization
        # LangGraph's MemorySaver can't serialize Pydantic models directly
        ui_inputs_dicts = [ui.model_dump(mode='json') for ui in final_response.ui_inputs]

        return {
            "messages": [AIMessage(final_response.message)],
            "ui_inputs": [ui_inputs_dicts]  # Wrap in list to maintain nested structure [[batch]]
        }
    
    def _retrieve_memory(self, state: PersonalStylistState, config: RunnableConfig):
        """Retrieve memory (StyleDna) for the user"""
        user_id = config.get("configurable", {}).get("user_id")
        if user_id:
            style_dna = self.memory_store.retrieve_memory(user_id)
            return {"style_dna": style_dna}
        
        else:
            return {}
        
    def _trim_messages(self, state: PersonalStylistState):
        """Trim message history"""
        messages = state.get("messages", [])

        if len(messages) <= self.max_context_msgs:
            return {}

        # Identify the oldest messages to drop
        number_to_delete = len(messages) - self.max_context_msgs

        # Create RemoveMessage objects for those IDs
        to_remove = [RemoveMessage(id=m.id) for m in messages[:number_to_delete]]

        return {"messages": to_remove}

    def _filter_messages_for_gemini(self, messages: list) -> list:
        """
        Filter messages to ensure valid Gemini API sequencing.

        Rules enforced:
        1. Remove SystemMessages from state (we already add fresh ones)
        2. Remove AIMessage with tool_calls if not followed by ToolMessage
        3. Ensure no consecutive AIMessages
        4. Keep valid User → AI → Tool → User flow

        Args:
            messages: Raw messages from state

        Returns:
            Filtered messages valid for Gemini API
        """
        if not messages:
            return []

        filtered = []

        for i, msg in enumerate(messages):
            # Skip SystemMessages from state (we add fresh ones)
            if isinstance(msg, SystemMessage):
                continue

            # Skip AIMessages with tool_calls that aren't followed by ToolMessage
            if isinstance(msg, AIMessage) and msg.tool_calls:
                # Check if next message is ToolMessage
                if i + 1 < len(messages) and isinstance(messages[i + 1], ToolMessage):
                    filtered.append(msg)
                else:
                    # Orphaned tool call - skip it
                    continue

            # Skip consecutive AIMessages (keep only the last one)
            elif isinstance(msg, AIMessage):
                # Check if previous filtered message is also AIMessage
                if filtered and isinstance(filtered[-1], AIMessage):
                    # Replace previous AIMessage with this one
                    filtered[-1] = msg
                else:
                    filtered.append(msg)

            # Keep HumanMessage and ToolMessage as-is
            else:
                filtered.append(msg)

        return filtered

    def _compile_graph(self):
        """Compile the agent's state graph."""
        # Define the state graph
        workflow = StateGraph(PersonalStylistState)

        # Bind tools
        self.model_with_tools = self.model.bind_tools(self.tools)
        tool_node = ToolNode(self.tools)

        # Define nodes
        workflow.add_node("update_journey", self._update_journey)
        workflow.add_node("retrieve_memory", self._retrieve_memory)
        workflow.add_node("trim_messages", self._trim_messages)
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
        workflow.add_edge("update_journey", "retrieve_memory")
        workflow.add_edge("retrieve_memory", "trim_messages")
        workflow.add_edge("trim_messages", "agent")

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
