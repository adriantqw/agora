from pydantic import BaseModel, Field
from typing import Optional
from ..schemas import BBox

class CatalogueItem(BaseModel):
    """Information about a single item in a catalogue."""
    name: str = Field(description="The name of the item")
    description: str = Field(description="A brief description of the item")
    sizes: Optional[list[str]] = Field(description="The available sizes of the item", default=[])
    colours: Optional[list[str]] = Field(description="The available colours of the item", default=[])
    bbox: Optional[BBox] = Field(description="The bounding box of the item", default=None)
    page: Optional[int] = Field(description="The page number of the item", default=None)

class CatalogueItemList(BaseModel):
    items: Optional[list[CatalogueItem]] = Field(description="The list of items in the catalogue", default=[])  