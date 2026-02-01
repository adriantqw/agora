from pydantic import BaseModel, Field, FilePath, FileUrl
from typing import Optional
from enum import Enum

# Defining Enums for predefined choices
class Season(str, Enum):
    WINTER = "winter"
    AUTUMN = "autumn"
    SPRING = "spring"
    SUMMER = "summer"
    TRANSITIONAL = "transitional"

class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class StyleType(str, Enum):
    BOHEMIAN = "bohemian"
    CLASSIC = "classic"
    MINIMALIST = "minimalist"
    STREETWEAR = "streetwear"
    GRUNGE = "grunge"
    PREPPY = "preppy"
    ATHLEISURE = "athleisure"
    DARK_ACADEMIA = "dark_academia"
    OLD_MONEY = "old_money"    # Also known as Quiet Luxury
    GORPCORE = "gorpcore"      # Functional outdoorsy chic
    Y2K = "y2k"
    VINTAGE = "vintage"
    CYBERPUNK = "cyberpunk"
    COTTAGECORE = "cottagecore"

class FitType(str, Enum):
    SLIM = "slim"
    COMPRESSION = "compression"
    OVERSIZED = "oversized"
    REGULAR = "regular"
    RELAXED = "relaxed"
    TAILORED = "tailored"
    CROPPED = "cropped"

class LocationType(str, Enum):
    INDOORS = "indoors"
    OUTDOORS = "outdoors"
    BEACH = "beach"
    OFFICE = "office"
    GYM = "gym"
    RESTAURANT = "restaurant"
    NIGHTCLUB = "nightclub"
    MOUNTAINS = "mountains"
    AIRPORT = "airport"
    URBAN = "urban"
    RESORT = "resort"

class OccasionType(str, Enum):
    CASUAL = "casual"
    FORMAL = "formal"
    SEMI_FORMAL = "semi_formal"
    BUSINESS_CASUAL = "business_casual"
    PARTY = "party"
    DATE_NIGHT = "date_night"
    WEDDING = "wedding"
    BLACK_TIE = "black_tie"
    WORKOUT = "workout"
    LOUNGING = "lounging"
    FESTIVAL = "festival"

# Define journey schema
class JourneySchema(BaseModel):
    """Base Journey class containing gathered user preferences"""
    title: str = Field(description="User-friendly title of the journey")
    summary: str = Field(default=None, description="A one-sentence summary of captured user preference")
    time_of_day: Optional[TimeOfDay] = Field(default=None, description="Preferred time of day for the outfit style")
    season: Optional[Season] = Field(description="Seasonal vibe for the outfit")
    occasion: Optional[OccasionType] = Field(default=None, description="Occasion for the outfit")
    location: Optional[LocationType] = Field(default=None, description="Location or setting")
    fit_preference: Optional[FitType] = Field(default_factory=list, description="User fit preference")
    style_preferences: Optional[list[StyleType]] = Field(default_factory=list, description="List of style preferences")
    colour_palette: Optional[list[str]] = Field(default_factory=list, description="Colour palette in hex (e.g., '#FF5733')", max_length=5)
    mood_board_path: Optional[FilePath | FileUrl] = Field(default_factory=list, description="File path to an image of a mood board encapsulating user preferences.")
    budget_rating: Optional[int] = Field(description="Budget rating for the outfit between 1-5", default=None, ge=1, le=5)
    other: Optional[str] = Field(default=None, description="Use this field for any other uncaptured preferences")

# Define style dna schema
class StyleDna(BaseModel):
    """Style DNA pydantic model containing user-preferences based on long-term historical interactions"""
    title: str = Field(description="User-friendly title of their long-term style archetype")
    description: str = Field(description="A one-sentence description of captured style archetype")
    style_preferences: Optional[list[StyleType]] = Field(default_factory=list, description="List of style preferences including primary and secondary ones")
    colour_palette: Optional[list[str]] = Field(default_factory=list, description="Primary colour palette in hex (e.g., '#FF5733')", max_length=5)
    brand_preferences: Optional[list[str]] = Field(default_factory=list, description="List of brand preferences")
    primary_silhoutte: Optional[FitType] = Field(default=None, description="Primary silhoutte preference")
    budget_rating: Optional[int] = Field(description="Budget rating for the outfit between 1-5", default=None, ge=1, le=5)
    celebrity_style_twin: str = Field(..., description="Name of celebrity with identical aesthetic logic.")
    celebrity_twin_reasoning: str = Field(..., description="User-facing reason for celebrity style DNA choice.")
    celebrity_twin_images: Optional[list[FilePath | FileUrl]] = Field(default_factory=list, description="Image URLs or files for celebrity twin (for post-processing purposes ONLY)")
    mood_board_path: Optional[FilePath | FileUrl] = Field(default_factory=list, description="File path to an image of a mood board encapsulating user preferences.")
    reasoning: str = Field(description="Internal reasoning for Style DNA attributes chosen.")
