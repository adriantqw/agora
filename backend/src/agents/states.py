from typing import Annotated, TypedDict
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from src.agents.schemas import CatalogueItem

class CatalogueIngestorState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    pdf_path: str
    pdf_page_paths: list[str]
    total_pages: int
    current_page_idx: int
    catalogue_items: Annotated[list[CatalogueItem], operator.add]
    error: str | None