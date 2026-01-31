from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ProfileUpdateRequest(BaseModel):
    """Schema for updating consumer profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    ai_personality: Optional[str] = None


class AvatarUploadResponse(BaseModel):
    """Schema for avatar upload response."""
    avatar_url: str


class FittingRoomPhotoResponse(BaseModel):
    """Schema for fitting room photo response."""
    id: str
    consumer_id: str
    image_url: str
    angle: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
