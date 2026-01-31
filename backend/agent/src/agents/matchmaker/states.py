from typing import Annotated, TypedDict, Optional
import operator
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from .schemas import ProductMatch
from ..schemas import JourneySchema


class MatchmakerState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    journey: Optional[JourneySchema]
    matches: Annotated[list[ProductMatch], operator.add]
    iteration_count: Optional[int]
    personality: Optional[str]
