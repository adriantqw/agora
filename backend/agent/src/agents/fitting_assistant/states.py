from typing import Annotated, TypedDict, Optional
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from .schemas import FittingSetObject
from ..schemas import JourneySchema


class FittingAssistantState(TypedDict):
    """State for the Fitting Assistant Agent."""
    # Conversation history
    messages: Annotated[list[BaseMessage], add_messages]

    # User preferences from stylist journey
    journey: Optional[JourneySchema]

    # Pre-fetched product details (name, description, image_url, etc.)
    product_details: Optional[dict]

    # Generated lookbook images (accumulator)
    fitting_sets: Annotated[list[FittingSetObject], operator.add]

    # Agent personality mode
    personality: Optional[str]
