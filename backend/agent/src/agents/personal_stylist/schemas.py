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
    title: str = Field(description="Title of the journey")
    time_of_day: Optional[Literal["morning", "afternoon", "evening", "night"]] = Field(default=None, description="Preferred time of day for the outfit style")
    occasion: Optional[str] = Field(default=None,description="Occasion for the outfit (e.g., casual, formal, party)")
    style_preferences: Optional[list[str]] = Field(default_factory=list, description="List of style preferences (e.g., bohemian, classic, edgy)")
    budget_range: Optional[int] = Field(description="Budget range for the outfit", default=None)

class UIInputType(BaseModel):
    """Base class for UI input components."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["image-choice", "colour-palette", "multi-select", "scale-rating", "free-text"]
    question: str
    image_options: Optional[list[ImageOption]] = Field(default_factory=list,description="2-3 image options from batch generation (max 3). Only for image-choice type.")
    colour_hex_options: Optional[list[str]] = Field(default_factory=list, description="Hex codes of the colours, e.g., #FF5733. Only for colour-palette type.")
    text_options: Optional[list[str]] = Field(default_factory=list, description="Text options to select from (max 5). Only for multi-select type.")
    min_label: Optional[str] = Field(default=None, description="Label for the low end, e.g., 'Budget'. For scale-rating type only.")
    max_label: Optional[str] = Field(default=None, description="Label for the high end, e.g., 'Luxury'. For scale-rating type only.")

class UIInputList(BaseModel):
    ui_inputs: list[UIInputType] = Field(
        description="List of UI components to display. Each component has a 'type' field that determines its structure."
    )