import mlflow
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langgraph.graph import END

from .schemas import ProductSelections
from ..tools import load_image, Txt2ImgGenerator, google_search
from ..schemas import JourneySchema
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config

load_dotenv()


class FittingAssistantAgent:
    """
    React-style Fitting Assistant Agent.

    Uses custom LangGraph's react agent pattern with prebuilt checkpointer
    for session management via thread IDs.
    """
    def __init__(self):
        """Initialize the agent with model, tools and checkpointer"""
        mlflow.langchain.autolog()
        self.agent_key = "fitting_assistant"
        self.agent_config = load_config("agent")[self.agent_key]
        self.model = load_model_from_config(self.agent_config["model"])
        self.recursion_limit = self.agent_config["recursion_limit"]
        
        # Load prompts
        self.system_prompt: str = load_prompt_templates()[self.agent_key]

        # Load personality configuration
        self.personality_config: dict = load_config("personality")

        # Define checkpointer
        self.checkpointer = MemorySaver()

        # Define available tools
        image_generator = Txt2ImgGenerator()
        self.tools = image_generator.get_tools() + [load_image]
        if self.agent_config["enable_google_search_tool"]:
            self.tools.append(google_search)

        # Create react agent with custom state schema and middleware
        self.agent = self._compile_graph()

    def fit(self, journey: JourneySchema, product_selections: ProductSelections):
        """
        Invoke fitting room assistant graph
        
        Args:
            journey:
            product_selections:
        """

    def _compile_graph(self):
        pass
