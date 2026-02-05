from typing import Annotated, TypedDict, Optional
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from .schemas import UserResponse, UIInputType
from ..schemas import JourneySchema, StyleDna


def append_batch(existing: list[list[UIInputType]], new: list[list[UIInputType]]) -> list[list[UIInputType]]:
    """Append new batch(es) to the list of batches.

    ui_inputs is structured as [[batch1_questions], [batch2_questions], ...]
    Each invocation adds a new batch as a sublist.
    """
    if existing is None:
        existing = []
    if new is None:
        return existing
    return existing + new


class PersonalStylistState(TypedDict):
    # Conversation
    messages: Annotated[list[BaseMessage], add_messages]

    # Canonical preferences
    journey: Optional[JourneySchema]

    # Style Dna (long-term preferences)
    style_dna: Optional[StyleDna]

    # UI - nested list: each batch is a sublist [[batch1_questions], [batch2_questions], ...]
    ui_inputs: Annotated[list[list[UIInputType]], append_batch]
    ui_answers: Annotated[list[UserResponse], operator.add]

    # Personality
    personality: Optional[str]