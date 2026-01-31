from typing import Annotated, TypedDict, Optional
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from .schemas import (
    UserResponse,
    JourneySchema,
    UIInputType,
)


class PersonalStylistState(TypedDict):
    # Conversation
    messages: Annotated[list[BaseMessage], add_messages]

    # Canonical preferences
    journey: Optional[JourneySchema]

    # UI
    ui_inputs: Annotated[list[UIInputType], operator.add]
    ui_answers: Annotated[list[UserResponse], operator.add]

    # Personality
    personality: Optional[str]