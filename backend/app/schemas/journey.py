from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OutfitBase(BaseModel):
    label: str
    subtext: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    icon_name: Optional[str] = None
    icon_color: Optional[str] = None
    background_color: Optional[str] = None
    is_ai_pick: bool = False

class OutfitCreate(OutfitBase):
    pass

class OutfitResponse(OutfitBase):
    id: str
    journey_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JourneyBase(BaseModel):
    title: str
    status: str
    status_color: str
    status_label: str
    closet_url: Optional[str] = None

class JourneyCreate(JourneyBase):
    outfits: List[OutfitCreate] = []

class JourneyResponse(JourneyBase):
    id: str
    consumer_id: Optional[str] = None
    outfits: List[OutfitResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
