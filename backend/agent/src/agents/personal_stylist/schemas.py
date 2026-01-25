from typing import Union, Literal, Optional
from pydantic import BaseModel, Field, field_validator

class UserResponse(BaseModel):
    question_id: str
    selected_values: list[str]  # IDs from image-choice or multi-select
    text_value: Optional[str]   # From free-text
    rating: Optional[float]     # From scale-rating

class ImageOption(BaseModel):
    """An option for an image choice input field."""
    id: str
    label: str
    image_path: str = Field(description="Path to the image file")

class ImageChoice(BaseModel):
    """An image choice input field."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["image-choice"] = "image-choice"
    question: str
    options: list[ImageOption] = Field(description="Maximum of 3 options allowed")

    @field_validator('options')
    @classmethod
    def validate_options_length(cls, v):
        if len(v) > 3:
            raise ValueError('Maximum of 3 options allowed')
        return v

class ColourPaletteOption(BaseModel):
    """A colour palette choice input field."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["colour-palette"] = "colour-palette"
    question: str
    colour_hex_options: list[str] = Field(description="Hex codes of the colours, e.g., #FF5733")

class MultiSelectTextOption(BaseModel):
    """A multi-select input field with text options."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["multi-select"] = "multi-select"
    question: str
    options: list[str] = Field(description="Maximum of 5 options allowed")

    @field_validator('options')
    @classmethod
    def validate_options_length(cls, v):
        if len(v) > 5:
            raise ValueError('Maximum of 5 options allowed')
        return v

class ScaleRating(BaseModel):
    """A scale rating input field."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["scale-rating"] = "scale-rating"
    question: str
    min_label: str = Field(description="Label for the low end, e.g., 'Budget'")
    max_label: str = Field(description="Label for the high end, e.g., 'Luxury'")

class FreeTextResponse(BaseModel):
    """A free text input field."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["free-text"] = "free-text"
    question: str

class TextWithImageResponse(BaseModel):
    """A text input field with an image generation prompt."""
    id: str = Field(description="Unique identifier for this question")
    type: Literal["text-with-image"] = "text-with-image"
    question: str
    image_path: str = Field(description="Path to the image file generated for context")

class JourneySchema(BaseModel):
    time_of_day: Literal["morning", "afternoon", "evening", "night"]
    occasion: str
    style_preferences: list[str] = Field(default_factory=list)
    budget_range: Optional[int] = None

UIInputType = Union[
    ImageChoice,
    ColourPaletteOption,
    MultiSelectTextOption,
    ScaleRating,
    FreeTextResponse,
    TextWithImageResponse
]
