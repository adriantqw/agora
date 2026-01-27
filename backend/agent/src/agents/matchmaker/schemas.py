from typing import Optional
from pydantic import BaseModel, Field


class ProductMatch(BaseModel):
    """A matched product from vector search."""
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    source: str  # "product" or "catalogue"
    score: Optional[float] = None


class MatchResult(BaseModel):
    """List of matched products."""
    matches: list[ProductMatch] = Field(default_factory=list)
