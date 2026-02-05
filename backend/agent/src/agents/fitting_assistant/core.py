import asyncio
import mlflow
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, AIMessage, HumanMessage, RemoveMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.prebuilt.tool_node import ToolNode
from langgraph.graph import END

from .states import FittingAssistantState
from .schemas import ProductSelections, ProductSelectedSet, FittingSets
from .tools import get_product_details
from .utils import fetch_product_details_batch, load_product_images_batch_async, get_cached_image_path
from ..tools import load_image, Txt2ImgGenerator, google_search
from ..schemas import JourneySchema
from ..memory_utils import AgoraMemory
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
        self.max_context_msgs = self.agent_config["max_context_msgs"]

        # Load prompts
        self.system_prompt: str = load_prompt_templates()[self.agent_key]

        # Load personality configuration
        self.personality_config: dict = load_config("personality")

        # Define checkpointer
        self.checkpointer = MemorySaver()

        # Define memory store
        self.memory_store = AgoraMemory()

        # Define available tools
        image_generator = Txt2ImgGenerator()
        self.tools = image_generator.get_tools() + [load_image, get_product_details]
        if self.agent_config["enable_google_search_tool"]:
            self.tools.append(google_search)

        # Create react agent with custom state schema and middleware
        self.agent = self._compile_graph()

    def _extract_product_ids(self, selections: ProductSelections) -> list[str]:
        """Extract all product IDs from selections."""
        ids = []
        for match in selections.matches:
            if hasattr(match, 'id'):
                ids.append(match.id)
            if isinstance(match, ProductSelectedSet):
                for item in match.product_set:
                    ids.append(item.id)
        return ids

    def _populate_product_details(self, product_selections: ProductSelections, product_details: dict) -> ProductSelections:
        """Populate product detail fields in ProductSelections from fetched details."""
        for match in product_selections.matches:
            if isinstance(match, ProductSelectedSet):
                for product in match.product_set:
                    details = product_details.get(product.id, {})
                    product.name = details.get("name")
                    product.description = details.get("description")
                    product.price = details.get("price")
                    product.tags = details.get("tags")
                    # Set cached image path (images already fetched by load_product_images_batch_async)
                    cache_path = get_cached_image_path(product.id)
                    if cache_path.exists():
                        product.cached_image_path = str(cache_path)
            else:
                details = product_details.get(match.id, {})
                match.name = details.get("name")
                match.description = details.get("description")
                match.price = details.get("price")
                match.tags = details.get("tags")
                # Set cached image path
                cache_path = get_cached_image_path(match.id)
                if cache_path.exists():
                    match.cached_image_path = str(cache_path)
        return product_selections

    def _build_multimodal_message(
        self,
        user_request: str,
        product_details: dict[str, dict],
        product_images: dict[str, str]
    ) -> HumanMessage:
        """
        Build a multimodal HumanMessage with product images embedded.

        Args:
            user_request: The user's request text
            product_details: Dict of product details from DB
            product_images: Dict of product_id -> base64 encoded image

        Returns:
            HumanMessage with text and images
        """
        content = []

        # Add intro text
        content.append({
            "type": "text",
            "text": "Here are the product images for reference:"
        })

        # Add each product image with label
        for product_id, base64_image in product_images.items():
            details = product_details.get(product_id, {})
            product_name = details.get('name', product_id)

            content.append({
                "type": "text",
                "text": f"\n{product_name} (ID: {product_id}):"
            })
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
            })

        # Add the user request
        content.append({
            "type": "text",
            "text": f"\n\nUser Request: {user_request}"
        })

        return HumanMessage(content=content)

    def fit(
        self, journey: JourneySchema, product_selections: ProductSelections,
        thread_id: str, message: str = None, personality: str = 'friendly'
    ) -> dict:
        """
        Invoke fitting room assistant graph.

        Args:
            journey: JourneySchema with user preferences
            product_selections: ProductSelections with user's selected products
            thread_id: Unique identifier for the conversation thread
            message: Optional user refinement message
            personality: Agent personality configuration (e.g. 'friendly')

        Returns:
            dict: Agent state including messages and fitting_sets
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(
                f"Personality '{personality}' not valid. "
                f"Available personalities are: {list(self.personality_config.keys())}"
            )

        # Pre-query: Fetch all product details from database
        product_ids = self._extract_product_ids(product_selections)
        product_details = fetch_product_details_batch(product_ids)

        # Load and encode product images (async with caching)
        product_images = asyncio.run(load_product_images_batch_async(product_details))

        # Populate product details into selections
        product_selections = self._populate_product_details(product_selections, product_details)

        # Build user request text
        user_request = f"Create lookbooks for these selections: {product_selections.model_dump_json()}"
        if message:
            user_request += f"\n\nAdditional instructions: {message}"

        # Build multimodal message with images
        if product_images:
            first_message = self._build_multimodal_message(
                user_request, product_details, product_images
            )
            message_list = [first_message]
        else:
            # Fallback to text-only if no images loaded
            message_list = [("user", user_request)]

        # Compile the config
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }

        # Invoke the agent
        return self.agent.invoke({
            "journey": journey,
            "messages": message_list,
            "personality": personality
        }, config=config)

    async def fit_stream(
        self, journey: JourneySchema, product_selections: ProductSelections,
        thread_id: str, message: str = None, personality: str = 'friendly'
    ):
        """
        Stream invoke fitting room assistant graph.

        Args:
            journey: JourneySchema with user preferences
            product_selections: ProductSelections with user's selected products
            thread_id: Unique identifier for the conversation thread
            message: Optional user refinement message
            personality: Agent personality configuration (e.g. 'friendly')

        Yields:
            Stream events from the agent execution
        """
        # Validate personality
        if personality not in self.personality_config:
            raise ValueError(
                f"Personality '{personality}' not valid. "
                f"Available personalities are: {list(self.personality_config.keys())}"
            )

        # Pre-query: Fetch all product details from database
        product_ids = self._extract_product_ids(product_selections)
        product_details = fetch_product_details_batch(product_ids)

        # Load and encode product images (async with caching)
        product_images = await load_product_images_batch_async(product_details)

        # Populate product details into selections
        product_selections = self._populate_product_details(product_selections, product_details)

        # Build user request text
        user_request = f"Create lookbooks for these selections: {product_selections.model_dump_json()}"
        if message:
            user_request += f"\n\nAdditional instructions: {message}"

        # Build multimodal message with images
        if product_images:
            first_message = self._build_multimodal_message(
                user_request, product_details, product_images
            )
            message_list = [first_message]
        else:
            # Fallback to text-only if no images loaded
            message_list = [("user", user_request)]

        # Compile the config
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": self.recursion_limit
        }

        # Stream the agent events
        return self.agent.astream_events({
            "journey": journey,
            "messages": message_list,
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

    def _invoke_model(self, state: FittingAssistantState):
        """Invoke the model with product context (metadata only, images already in messages)."""
        journey = state.get("journey")

        # Get personality instructions from state
        personality = state.get("personality", "friendly")
        personality_instructions = self.personality_config.get(
            personality,
            self.personality_config["friendly"]
        )

        # Format the system prompt with all placeholders
        prompt = self.system_prompt.format(
            personality_instructions=personality_instructions,
            journey=journey.model_dump_json() if journey else "No preferences",
            journey_schema=JourneySchema.model_json_schema()
        )

        messages = [SystemMessage(content=prompt)] + state["messages"]

        # Bind tools and invoke model
        response = self.model.bind_tools(self.tools).invoke(messages)

        return {"messages": [response]}

    def _should_continue(self, state: FittingAssistantState):
        """Determine whether to continue processing."""
        last_message: AIMessage = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return "parse_fit_images"

    def _parse_fit_images(self, state: FittingAssistantState):
        """Extract fitting sets from tool results in messages."""
        structured_model = self.model.with_structured_output(FittingSets)
        response: FittingSets = structured_model.invoke(state["messages"])
        return {
            "messages": [AIMessage(content=response.message)],
            "fitting_sets": response.fitting_sets
        }

    def _retrieve_memory(self, state: FittingAssistantState, config: RunnableConfig):
        """Retrieve memory (StyleDna) for the user"""
        user_id = config.get("configurable", {}).get("user_id")
        if user_id:
            style_dna = self.memory_store.retrieve_memory(user_id)
            return {"style_dna": style_dna}
        else:
            return {}

    def _trim_messages(self, state: FittingAssistantState):
        """Trim message history"""
        messages = state.get("messages", [])

        if len(messages) <= self.max_context_msgs:
            return {}

        # Identify the oldest messages to drop
        number_to_delete = len(messages) - self.max_context_msgs

        # Create RemoveMessage objects for those IDs
        to_remove = [RemoveMessage(id=m.id) for m in messages[:number_to_delete]]

        return {"messages": to_remove}

    def _compile_graph(self):
        """Compile the agent's state graph."""
        workflow = StateGraph(FittingAssistantState)
        tool_node = ToolNode(self.tools)

        workflow.add_node("retrieve_memory", self._retrieve_memory)
        workflow.add_node("trim_messages", self._trim_messages)
        workflow.add_node("agent", self._invoke_model)
        workflow.add_node("tools", tool_node)
        workflow.add_node("parse_fit_images", self._parse_fit_images)

        workflow.set_entry_point("retrieve_memory")
        workflow.add_edge("retrieve_memory", "trim_messages")
        workflow.add_edge("trim_messages", "agent")
        workflow.add_conditional_edges("agent", self._should_continue, {
            "tools": "tools",
            "parse_fit_images": "parse_fit_images"
        })
        workflow.add_edge("tools", "agent")
        workflow.add_edge("parse_fit_images", END)

        return workflow.compile(checkpointer=self.checkpointer, name=self.agent_key)
