"""Common schemas shared across all agents."""
from pydantic import BaseModel, Field


class BBox(BaseModel):
    """Bounding box coordinates [ymin, xmin, ymax, xmax]"""
    ymin: int = Field(description="The y coordinate of the top of the bounding box")
    xmin: int = Field(description="The x coordinate of the left of the bounding box")
    ymax: int = Field(description="The y coordinate of the bottom of the bounding box")
    xmax: int = Field(description="The x coordinate of the right of the bounding box")
