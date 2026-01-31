from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class StyleProfileCreate(BaseModel):
    """Schema for creating a style profile."""
    vibes: List[str] = Field(default_factory=list, max_length=4)
    loved_colors: List[str] = Field(default_factory=list, max_length=10)
    avoided_colors: List[str] = Field(default_factory=list, max_length=10)
    favorite_brands: List[str] = Field(default_factory=list, max_length=20)
    fit_preference: Optional[str] = Field(None, pattern="^(Tight|Regular|Oversized)$")
    budget_tier: int = Field(default=2, ge=1, le=4)

    @field_validator('loved_colors', 'avoided_colors')
    @classmethod
    def validate_hex_colors(cls, v):
        """Ensure all colors are valid hex codes."""
        for color in v:
            if not color.startswith('#') or len(color) != 7:
                raise ValueError(f"Invalid hex color: {color}")
        return v


class StyleProfileUpdate(BaseModel):
    """Schema for updating a style profile (all fields optional)."""
    vibes: Optional[List[str]] = Field(None, max_length=4)
    loved_colors: Optional[List[str]] = Field(None, max_length=10)
    avoided_colors: Optional[List[str]] = Field(None, max_length=10)
    favorite_brands: Optional[List[str]] = Field(None, max_length=20)
    fit_preference: Optional[str] = Field(None, pattern="^(Tight|Regular|Oversized)$")
    budget_tier: Optional[int] = Field(None, ge=1, le=4)

    @field_validator('loved_colors', 'avoided_colors')
    @classmethod
    def validate_hex_colors(cls, v):
        if v is not None:
            for color in v:
                if not color.startswith('#') or len(color) != 7:
                    raise ValueError(f"Invalid hex color: {color}")
        return v


class StyleProfileResponse(BaseModel):
    """Schema for style profile response."""
    id: str
    consumer_id: str
    vibes: List[str]
    loved_colors: List[str]
    avoided_colors: List[str]
    favorite_brands: List[str]
    fit_preference: Optional[str]
    budget_tier: int
    style_archetype: Optional[str]
    profile_strength: int  # Archetype alignment strength (0-100)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
