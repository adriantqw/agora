from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MatchRequest(BaseModel):
    journeyId: str = Field(..., description="Journey ID to match products for")
    threadId: Optional[str] = Field(None, description="Optional thread ID for multi-turn refinement")
    message: Optional[str] = Field(None, description="Optional message to refine the match")
    personality: str = Field("friendly", description="Agent personality (default: 'friendly')")


class ProductMatchData(BaseModel):
    id: str = Field(..., description="Product or catalogue item ID")
    name: Optional[str] = Field(None, description="Product name")
    description: Optional[str] = Field(None, description="Product description")
    imageUrl: Optional[str] = Field(None, description="Product image URL")
    price: Optional[float] = Field(None, description="Product price (null for catalogue items)")
    score: Optional[float] = Field(None, description="Match confidence score")
    reason: str = Field(..., description="Reason for this match")


class ProductSetData(BaseModel):
    title: str = Field(..., description="Product set title")
    description: str = Field(..., description="Product set description")
    productSet: List[ProductMatchData] = Field(..., description="List of products in this set")


class MatchData(BaseModel):
    threadId: str = Field(..., description="Thread ID for this session")
    matches: List[ProductMatchData | ProductSetData] = Field(default_factory=list, description="List of matches or product sets")
    message: str = Field(..., description="Message accompanying the matches")
    iterationCount: int = Field(1, description="Number of iterations in this session")


class MatchResponse(BaseModel):
    success: bool = True
    data: MatchData


class StreamProgressEvent(BaseModel):
    type: str = Field("progress", description="Event type")
    thinkingMessage: str = Field(..., description="Current thinking message")
    timestamp: str = Field(..., description="ISO timestamp")


class StreamCompleteEvent(BaseModel):
    type: str = Field("complete", description="Event type")
    threadId: str = Field(..., description="Thread ID")
    matches: List[ProductMatchData | ProductSetData] = Field(..., description="List of matches")
    message: str = Field(..., description="Accompanying message")
    iterationCount: int = Field(..., description="Iteration count")


class StreamErrorEvent(BaseModel):
    type: str = Field("error", description="Event type")
    message: str = Field(..., description="Error message")


class StateData(BaseModel):
    threadId: str = Field(..., description="Thread ID")
    matches: List[ProductMatchData | ProductSetData] = Field(default_factory=list, description="List of matches")
    journey: Optional[dict] = Field(None, description="Journey data")
    iterationCount: int = Field(1, description="Iteration count")


class StateResponse(BaseModel):
    success: bool = True
    data: StateData
