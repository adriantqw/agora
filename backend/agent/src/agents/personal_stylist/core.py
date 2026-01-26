import json
import mlflow

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

from .states import PersonalStylistState
from .tools import Txt2ImgGenerator, generate_ui_components
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

load_dotenv()

RECURSION_LIMIT = 50


@wrap_tool_call
async def capture_ui_components(request, handler):
    """
    Intercept generate_ui_components tool results and update ui_inputs state.
    """
    result = await handler(request)

    if isinstance(result, ToolMessage):
        try:
            content = result.content
            if isinstance(content, str):
                content = json.loads(content)

            if isinstance(content, dict) and "ui_components" in content:
                return Command(
                    update={
                        "ui_inputs": content["ui_components"],
                        "messages": [result]
                    }
                )
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    return result


class PersonalStylistAgent:
    """
    React-style Personal Stylist Agent with UI generation tools.

    Uses LangGraph's prebuilt react agent pattern with a checkpointer
    for session management via thread IDs.
    """

    def __init__(self):
        """Initialize the agent with model, tools, and checkpointer."""
        mlflow.langchain.autolog()
        self.agent_config = load_config("agent")["personal_stylist"]
        self.model = load_model_from_config(self.agent_config["model"])
        self.system_prompt = load_prompt_templates()["personal_stylist"]
        self.checkpointer = MemorySaver()

        # Define available tools
        image_generator = Txt2ImgGenerator()
        self.tools = image_generator.get_tools() + [generate_ui_components]

        # Create react agent with custom state schema and middleware
        self.agent = create_agent(
            model=self.model,
            tools=self.tools,
            checkpointer=self.checkpointer,
            middleware=[capture_ui_components],
            state_schema=PersonalStylistState,
            system_prompt=self.system_prompt
        )

    def invoke(self, message: str, thread_id: str) -> dict:
        """
        Invoke the agent with a message and thread_id for session continuity.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread

        Returns:
            dict: Agent state including messages, ui_inputs, ui_answers, journey
        """
        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": RECURSION_LIMIT}
        return self.agent.invoke(
            {"messages": [("user", message)]},
            config=config
        )

    async def stream(self, message: str, thread_id: str):
        """
        Stream agent responses for real-time updates.

        Args:
            message: User message to process
            thread_id: Unique identifier for the conversation thread

        Yields:
            Event dictionaries from the agent execution
        """
        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": RECURSION_LIMIT}
        async for event in self.agent.astream_events(
            {"messages": [("user", message)]},
            config=config,
            version="v2"
        ):
            yield event

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

    def get_state_values(self, thread_id: str) -> dict:
        """
        Get the state values (without metadata) for a thread.

        Args:
            thread_id: Unique identifier for the conversation thread

        Returns:
            dict: State values including ui_inputs, ui_answers, journey
        """
        state = self.get_state(thread_id)
        return state.values if state else {}
