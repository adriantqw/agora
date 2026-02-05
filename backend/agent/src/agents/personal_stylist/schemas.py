from typing import Optional
from pydantic import BaseModel, Field, FilePath, HttpUrl
from enum import Enum

class UserResponse(BaseModel):
    question_id: str = Field(description="Question ID of the original UI input")
    selected_values: Optional[list[str]] = Field(default_factory=list, description="User answer on field selections (could be IDs or text)")
    text_value: Optional[str] = Field(default=None, description="User answer on free text field")

class ImageOption(BaseModel):
    """An option for an image choice input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    label: str = Field(description="Display label for this option")
    image_path: FilePath | HttpUrl = Field(description="Path to the image file (local path or HTTP/HTTPS URL)")

class UIInputType(str, Enum):
    IMAGE_CHOICE = "image_choice"
    COLOUR_PALETTE = "colour_palette"
    MULTI_SELECT = "multi_select"
    SINGLE_SELECT = "single_select"
    SCALE_RATING = "scale_rating"
    FREE_TEXT = "free_text"

class UIInput(BaseModel):
    """Base class for UI input components."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: UIInputType = Field(description="UI component type to show user")
    question: str = Field(description="Question to ask the user in the UI component")
    image_options: Optional[list[ImageOption]] = Field(default_factory=list,description="2-3 image options from batch generation (max 3). Only for image-choice type.")
    colour_hex_options: Optional[list[str]] = Field(default_factory=list, description="Hex codes of the colours, e.g., #FF5733. Only for colour-palette type.")
    text_options: Optional[list[str]] = Field(default_factory=list, description="Text options to select from (max 5). Only for multi-select type.")
    min_label: Optional[str] = Field(default=None, description="Label for the low end, e.g., 'Budget'. For scale-rating type only.")
    max_label: Optional[str] = Field(default=None, description="Label for the high end, e.g., 'Luxury'. For scale-rating type only.")

class UIInputList(BaseModel):
    message: str = Field(description="Message in response to the user, accompanying the UI components")
    ui_inputs: list[UIInput] = Field(
        description="List of UI components to display. Each component has a 'type' field that determines its structure."
    )