from typing import Annotated, TypedDict, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from .schemas import ProductMatch, ProductMatchSet
from ..schemas import JourneySchema, StyleDna


def append_match_batch(
    existing: list[list[ProductMatch | ProductMatchSet]],
    new: list[list[ProductMatch | ProductMatchSet]],
) -> list[list[ProductMatch | ProductMatchSet]]:
    """Append new match batch(es) to the list of batches."""
    if existing is None:
        existing = []
    if new is None:
        return existing
    return existing + new


class MatchmakerState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    journey: Optional[JourneySchema]
    matches: Annotated[list[list[ProductMatch | ProductMatchSet]], append_match_batch]
    iteration_count: Optional[int]
    personality: Optional[str]
    style_dna: Optional[StyleDna]
