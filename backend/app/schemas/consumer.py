from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ConsumerBase(BaseModel):
    email: EmailStr
    full_name: str

class ConsumerCreate(ConsumerBase):
    password: str

class ConsumerLogin(BaseModel):
    email: EmailStr
    password: str

class ConsumerResponse(ConsumerBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    ai_personality: str = 'Friendly'

    class Config:
        from_attributes = True

class ConsumerTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: ConsumerResponse

class ConsumerRefreshRequest(BaseModel):
    refresh_token: str
