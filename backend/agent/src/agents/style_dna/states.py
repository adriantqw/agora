"""State definition for the Style DNA Agent."""
from typing import Annotated, TypedDict, Optional

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from ..schemas import StyleDna, JourneySchema


class StyleDnaState(TypedDict):
    """State for the Style DNA Agent.

    Supports two input scenarios:
    1. OOTD images: User uploads outfit-of-the-day photos
    2. Interaction state: Other agents send JourneySchema data
    """

    # Conversation history (for tool calls and reasoning)
    messages: Annotated[list[BaseMessage], add_messages]

    # User identifier for memory persistence
    user_id: str

    # Current Style DNA (loaded from memory at start)
    current_style_dna: Optional[StyleDna]

    # Input: OOTD images (Scenario 1) - list of URLs or file paths
    ootd_images: Optional[list[str]]

    # Input: Interaction state from other agents (Scenario 2)
    interaction_state: Optional[JourneySchema]

    # Output: Updated Style DNA
    updated_style_dna: Optional[StyleDna]
