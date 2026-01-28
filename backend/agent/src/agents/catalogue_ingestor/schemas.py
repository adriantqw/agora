from pydantic import BaseModel, Field
from typing import Optional

class BBox(BaseModel):
    """Bounding box coordinates [ymin, xmin, ymax, xmax]"""
    ymin: int = Field(description="The y coordinate of the top of the bounding box")
    xmin: int = Field(description="The x coordinate of the left of the bounding box")
    ymax: int = Field(description="The y coordinate of the bottom of the bounding box")
    xmax: int = Field(description="The x coordinate of the right of the bounding box")

class CatalogueItem(BaseModel):
    """Information about a single item in a catalogue."""
    name: str = Field(description="The name of the item")
    description: str = Field(description="A brief description of the item")
    sizes: Optional[list[str]] = Field(description="The available sizes of the item", default=[])
    colours: Optional[list[str]] = Field(description="The available hex code colours of the item, e.g. '#ff9999'", default=[])
    bbox: Optional[BBox] = Field(description="The bounding box of the item", default=None)
    page: Optional[int] = Field(description="The page number of the item", default=None)

class CatalogueItemList(BaseModel):
    items: Optional[list[CatalogueItem]] = Field(description="The list of items in the catalogue", default=[])  