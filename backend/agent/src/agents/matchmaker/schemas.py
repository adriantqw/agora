from typing import Optional
from pydantic import BaseModel, Field


class ProductMatch(BaseModel):
    """A matched product from vector search."""
    id: str = Field(description="Product or catalogue id from the vector search results")
    score: float = Field(default=None, description="Product or catalogue item match confidence score")
    reason: str = Field(description="One sentence reason to show the (user-facing)")

class ProductMatchSet(BaseModel):
    """Product Match Combinations"""
    title: str = Field(description="User-facing product set title")
    description: str = Field(description="User-facing product set description")
    product_set: list[ProductMatch] = Field(description="A set of items that go well together")

class MatchResult(BaseModel):
    """List of matched products."""
    matches: list[ProductMatch | ProductMatchSet] = Field(
        default_factory=list, 
        description="A list of product matches or product match sets to present to the user"
    )
