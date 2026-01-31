from pydantic import BaseModel, Field, FilePath, FileUrl
from typing import Optional
from enum import Enum

# Defining Enums for predefined choices
class Season(str, Enum):
    WINTER = "winter"
    AUTUMN = "autumn"
    SPRING = "spring"
    SUMMER = "summer"

class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class StyleType(str, Enum):
    BOHEMIAN = "bohemian"
    CLASSIC = "classic"
    CLASSY = "classy"
    MINIMALIST = "minimalist"
    STREETWEAR = "streetwear"

class FitType(str, Enum):
    SLIM = "slim"
    OVERSIZED = "oversized"
    REGULAR = "regular"
    RELAXED = "relaxed"
    TAILORED = "tailored"

# Define journey schema
class JourneySchema(BaseModel):
    """Base Journey class containing gathered user preferences"""
    title: str = Field(description="User-friendly title of the journey")
    summary: str = Field(default=None, description="A one-sentence summary of captured user preference")
    time_of_day: Optional[TimeOfDay] = Field(default=None, description="Preferred time of day for the outfit style")
    season: Optional[Season] = Field(description="Seasonal vibe for the outfit")
    occasion: Optional[str] = Field(default=None, description="Occasion for the outfit (e.g., casual, formal, party)")
    location: Optional[str] = Field(default=None, description="Location or setting (e.g. indoors, beach, office)")
    style_preferences: Optional[list[StyleType]] = Field(default_factory=list, description="List of style preferences")
    fit_preferences: Optional[list[FitType]] = Field(default_factory=list, description="List of fit preferences")
    colour_preferences: Optional[list[str]] = Field(default_factory=list, description="List of colour preferences in hex (e.g., '#FF5733')")
    mood_board_path: Optional[FilePath | FileUrl] = Field(default_factory=list, description="File path to an image of a mood board encapsulating user preferences.")
    budget_rating: Optional[int] = Field(description="Budget rating for the outfit between 1-5", default=None, ge=1, le=5)
    other: Optional[str] = Field(default=None, description="Use this field for any other uncaptured preferences")

# Define style dna schema
class StyleDna(BaseModel):
    """Style DNA Pydantic model containing user-preferences based on long-term historical interactions"""
    title: str = Field(description="User-friendly title of the journey")
    description: str = Field(description="A one-sentence description of captured user preference")
    style_preferences: Optional[list[StyleType]] = Field(default_factory=list, description="List of style preferences (e.g., bohemian, classic, classy)")
    colour_preferences: Optional[list[str]] = Field(default_factory=list, description="List of colour preferences in hex (e.g., '#FF5733')")
    budget_rating: Optional[int] = Field(description="Budget rating for the outfit between 1-5", default=None, ge=1, le=5)
    mood_board_path: Optional[FilePath | FileUrl] = Field(default_factory=list, description="File path to an image of a mood board encapsulating user preferences.")
