from pydantic import BaseModel
from typing import Optional, List

# Import existing schema from agent
from agent.src.agents.personal_stylist.schemas import UserResponse


# Request Models
class ChatRequest(BaseModel):
    message: str
    threadId: str


class SubmitAnswersRequest(BaseModel):
    threadId: str
    answers: List[UserResponse]


# Response Models
class StylistData(BaseModel):
    threadId: str
    journey: Optional[dict] = None
    uiInputs: List[dict] = []


class StylistResponse(BaseModel):
    success: bool = True
    data: StylistData
