from typing import Annotated, Union, Literal, Optional
from pydantic import BaseModel, Field, field_validator

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

class ImageChoice(BaseModel):
    """An image choice input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["image-choice"] = Field(default="image-choice", description="Must be 'image-choice'")
    question: str = Field(description="Question to display to the user")
    options: list[ImageOption] = Field(description="2-3 image options from batch generation (max 3)")

    @field_validator('options')
    @classmethod
    def validate_options_length(cls, v):
        if len(v) > 3:
            raise ValueError('Maximum of 3 options allowed')
        return v

class ColourPaletteOption(BaseModel):
    """A colour palette choice input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["colour-palette"] = Field(default="colour-palette", description="Must be 'colour-palette'")
    question: str = Field(description="Question to display to the user")
    colour_hex_options: list[str] = Field(description="Hex codes of the colours, e.g., #FF5733")

class MultiSelectTextOption(BaseModel):
    """A multi-select input field with text options."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["multi-select"] = Field(default="multi-select", description="Must be 'multi-select'")
    question: str = Field(description="Question to display to the user")
    options: list[str] = Field(description="Text options to select from (max 5)")

    @field_validator('options')
    @classmethod
    def validate_options_length(cls, v):
        if len(v) > 5:
            raise ValueError('Maximum of 5 options allowed')
        return v

class ScaleRating(BaseModel):
    """A scale rating input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["scale-rating"] = Field(default="scale-rating", description="Must be 'scale-rating'")
    question: str = Field(description="Question to display to the user")
    min_label: str = Field(description="Label for the low end, e.g., 'Budget'")
    max_label: str = Field(description="Label for the high end, e.g., 'Luxury'")

class FreeTextResponse(BaseModel):
    """A free text input field."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["free-text"] = Field(default="free-text", description="Must be 'free-text'")
    question: str = Field(description="Question to display to the user")

class TextWithImageResponse(BaseModel):
    """A text input field with an image generation prompt."""
    id: Optional[str] = Field(default=None, description="Unique identifier (auto-generated if not provided)")
    type: Literal["text-with-image"] = Field(default="text-with-image", description="Must be 'text-with-image'")
    question: str = Field(description="Question to display to the user")
    image_path: str = Field(description="Path to the image file generated for context")

class JourneySchema(BaseModel):
    time_of_day: Literal["morning", "afternoon", "evening", "night"]
    occasion: str
    style_preferences: list[str] = Field(default_factory=list)
    budget_range: Optional[int] = None

UIInputType = Annotated[
    Union[
        ImageChoice,
        ColourPaletteOption,
        MultiSelectTextOption,
        ScaleRating,
        FreeTextResponse,
        TextWithImageResponse
    ],
    Field(discriminator="type") 
]