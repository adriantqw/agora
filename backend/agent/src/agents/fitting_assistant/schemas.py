from pydantic import BaseModel, Field

class ProductSelected(BaseModel):
    """A product selected for fitting by the user."""
    id: str = Field(description="Product or catalogue id of the selected product")

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
