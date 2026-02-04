from typing import Annotated, TypedDict, Optional
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from .schemas import UserResponse, UIInputType
from ..schemas import JourneySchema, StyleDna


class PersonalStylistState(TypedDict):
    # Conversation
    messages: Annotated[list[BaseMessage], add_messages]

    # Canonical preferences
    journey: Optional[JourneySchema]

    # Style Dna (long-term preferences)
    style_dna: Optional[StyleDna]

    # UI
    ui_inputs: Annotated[list[UIInputType], operator.add]
    ui_answers: Annotated[list[UserResponse], operator.add]

    # Personality
    personality: Optional[str]