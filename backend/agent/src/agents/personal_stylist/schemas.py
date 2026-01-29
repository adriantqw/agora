from typing import Literal, Optional
from pydantic import BaseModel, Field, FilePath, FileUrl

class UserResponse(BaseModel):
    question_id: str
    selected_values: list[str]  # IDs from image-choice or multi-select
    text_value: Optional[str]   # From free-text
    rating: Optional[float]     # From scale-rating

class ImageOption(BaseModel):
    """An option for an image choice input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    label: str = Field(description="Display label for this option")
    image_path: FilePath | FileUrl = Field(description="Path to the image file from batch generation")

class JourneySchema(BaseModel):
    """Base Journey class containing gathered user preferences"""
    title: str = Field(description="User-friendly title of the journey")
    summary: str = Field(default=None, description="A one-sentence summary of captured user preference")
    time_of_day: Optional[Literal["morning", "afternoon", "evening", "night"]] = Field(default=None, description="Preferred time of day for the outfit style")
    season: Optional[Literal["winter", "autumn", "spring", "summer"]] = Field(description="Seasonal vibe for the outfit")
    occasion: Optional[str] = Field(default=None, description="Occasion for the outfit (e.g., casual, formal, party)")
    location: Optional[str] = Field(default=None, description="Location or setting (e.g. indoors, beach, office)")
    style_preferences: Optional[list[str]] = Field(default_factory=list, description="List of style preferences (e.g., bohemian, classic, classy)")
    colour_preferences: Optional[list[str]] = Field(default_factory=list, description="List of colour preferences (e.g., black, brown, red)")
    mood_board_path: Optional[FilePath | FileUrl] = Field(default_factory=list, description="File path to an image of a mood board encapsulating user preferences.")
    budget_rating: Optional[int] = Field(description="Budget rating for the outfit between 1-5", default=None, ge=1, le=5)

class UIInputType(BaseModel):
    """Base class for UI input components."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["image-choice", "colour-palette", "multi-select", "scale-rating", "free-text", "single-select"] = Field(description="UI component type to show user")
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