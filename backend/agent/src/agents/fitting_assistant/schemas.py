from typing import Optional
from pydantic import BaseModel, Field, FilePath

# User input schemas
class ProductSelected(BaseModel):
    """A product selected for fitting by the user."""
    id: str = Field(description="Product or catalogue id of the selected product")
    # Optional detail fields (populated after fetching)
    name: Optional[str] = Field(default=None, description="Product name")
    description: Optional[str] = Field(default=None, description="Product description")
    price: Optional[float] = Field(default=None, description="Product price")
    tags: Optional[list[str]] = Field(default=None, description="Product tags")
    cached_image_path: Optional[FilePath] = Field(default=None, description="Local file path to cached product image")

class ProductSelectedSet(BaseModel):
    """Product set combination selected by the user."""
    title: str = Field(description="User-facing product set title")
    description: str = Field(description="User-facing product set description")
    product_set: list[ProductSelected] = Field(description="A set of items that go well together")

class ProductSelections(BaseModel):
    """List of products selected for fitting."""
    matches: list[ProductSelected | ProductSelectedSet] = Field(
        default_factory=list, 
        description="A list of product or product sets selected for fitting by the user."
    )

# Agent response schemas
class FittingSetObject(BaseModel):
    title: str = Field(description="User-facing fitted image title")
    description: str = Field(description="User-facing fitted image set description")
    product_ids: list[str] = Field(description="List of product or catalogue ids of the products used to generate the image")
    image_path: list[str] = Field(description="Path to the image files (local path or HTTP/HTTPS URL)")

class FittingSets(BaseModel):
    message: str = Field(description="Message in response to the user, accompanying the fitting room images")
    fitting_sets: list[FittingSetObject] = Field(default_factory=list, description="List of fitting room images")
