from typing import Literal, Optional
from pydantic import BaseModel, Field

class UserResponse(BaseModel):
    question_id: str
    selected_values: list[str]  # IDs from image-choice or multi-select
    text_value: Optional[str]   # From free-text
    rating: Optional[float]     # From scale-rating

class ImageOption(BaseModel):
    """An option for an image choice input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    label: str = Field(description="Display label for this option")
    image_path: str = Field(description="Path to the image file from batch generation")

class JourneySchema(BaseModel):
    time_of_day: Literal["morning", "afternoon", "evening", "night"]
    occasion: str
    style_preferences: list[str] = Field(default_factory=list)
    budget_range: Optional[int] = None

class UIInput(BaseModel):
    """Base class for UI input components."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["image-choice", "colour-palette", "multi-select", "scale-rating", "free-text"]
    question: str
    image_options: Optional[list[ImageOption]] = Field(description="2-3 image options from batch generation (max 3). Only for image-choice type.")
    colour_hex_options: Optional[list[str]] = Field(description="Hex codes of the colours, e.g., #FF5733. Only for colour-palette type.")
    text_options: Optional[list[str]] = Field(description="Text options to select from (max 5). Only for multi-select type.")
    min_label: Optional[str] = Field(description="Label for the low end, e.g., 'Budget'. For scale-rating type only.")
    max_label: Optional[str] = Field(description="Label for the high end, e.g., 'Luxury'. For scale-rating type only.")

class UIInputList(BaseModel):
    ui_inputs: list[UIInput] = Field(
        description="List of UI components to display. Each component has a 'type' field that determines its structure."
    )
