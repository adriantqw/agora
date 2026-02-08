from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# Question Option Schema
class OptionSchema(BaseModel):
    """Schema for a question option."""
    label: str
    value: str
    imageUrl: Optional[str] = None
    imageType: Optional[str] = None
    iconName: Optional[str] = None
    description: Optional[str] = None


# Question Schema
class QuestionSchema(BaseModel):
    """Schema for a single question in a batch."""
    id: str
    type: str  # multi-select, single-choice, hybrid-select, free-text, image-choice, etc.
    question: str
    rowLabel: str
    required: bool
    options: List[OptionSchema] = []
    placeholder: Optional[str] = None
    minValue: Optional[int] = None
    maxValue: Optional[int] = None
    unit: Optional[str] = None
    multiSelect: Optional[bool] = None


# Summary Updates Schema
class SummaryFoundations(BaseModel):
    """Schema for summary foundation pills."""
    location: Optional[str] = None
    style: Optional[str] = None
    age: Optional[str] = None
    sizing: Optional[str] = None
    occasion: Optional[str] = None


class SummaryUpdates(BaseModel):
    """Schema for summary panel updates."""
    title: Optional[str] = None
    foundations: Optional[SummaryFoundations] = None
    narrative: Optional[str] = None


# Batch Response Schema (3-component response)
class BatchResponse(BaseModel):
    """Schema for the 3-component response from PersonalStylist agent."""
    blurb: str  # AI response to user query
    questions: List[QuestionSchema]  # Batch of questions
    summaryUpdates: SummaryUpdates  # Summary panel updates


# Start Request Schema
class StartBatchRequest(BaseModel):
    """Request schema for starting a new batch session."""
    searchQuery: str
    # images will be handled via multipart/form-data


class StartBatchStreamRequest(BaseModel):
    """Request schema for streaming start batch (images pre-uploaded)."""
    searchQuery: str
    imageUrls: List[str] = []
    imageTypes: List[str] = []


# Start Response Schema
class StartBatchResponse(BaseModel):
    """Response schema for POST /api/curate-my-fit/start."""
    success: bool = True
    data: Dict[str, Any]  # Contains: threadId, blurb, questions, summaryUpdates, imageUrls


# Submit Answers Request Schema
class AnswerData(BaseModel):
    """Schema for a single answer."""
    selectedOptions: Optional[List[str]] = None
    freeText: Optional[str] = None
    minValue: Optional[int] = None
    maxValue: Optional[int] = None
    timestamp: Optional[int] = None


class SubmitBatchAnswersRequest(BaseModel):
    """Request schema for submitting batch answers."""
    threadId: str
    answers: Dict[str, AnswerData]  # questionId -> AnswerData


# Submit Response Schema (Next Batch)
class NextBatchData(BaseModel):
    """Response data for next batch."""
    hasMore: bool
    blurb: Optional[str] = None
    questions: Optional[List[QuestionSchema]] = None
    summaryUpdates: Optional[SummaryUpdates] = None


# Submit Response Schema (Final)
class FinalBatchData(BaseModel):
    """Response data for final batch (journey created)."""
    hasMore: bool = False
    journeyId: str
    journey: Dict[str, Any]  # Journey object


class SubmitBatchAnswersResponse(BaseModel):
    """Response schema for POST /api/curate-my-fit/submit."""
    success: bool = True
    data: Any  # Either NextBatchData or FinalBatchData


# State Response Schema (Placeholder for future autosave)
class StateData(BaseModel):
    """Response data for session state."""
    threadId: str
    answers: Dict[str, AnswerData]
    lastUpdated: str
    expiresAt: str


class StateResponse(BaseModel):
    """Response schema for GET /api/curate-my-fit/state/{thread_id}."""
    success: bool = True
    data: StateData
