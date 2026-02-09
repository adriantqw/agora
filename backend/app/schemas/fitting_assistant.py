from pydantic import BaseModel, Field
from typing import Optional, List


class ProductSelectionItem(BaseModel):
    id: str = Field(..., description="Product or catalogue item ID")


class ProductSelectionSet(BaseModel):
    title: str = Field(..., description="Product set title")
    description: str = Field(..., description="Product set description")
    productSet: List[ProductSelectionItem] = Field(..., description="List of products in this set")


class FitRequest(BaseModel):
    journeyId: Optional[str] = Field(None, description="Journey ID for user preferences")
    stylistThreadId: Optional[str] = Field(None, description="Stylist thread ID — used to reconstruct journey when journeyId is not yet available")
    productSelections: List[ProductSelectionItem | ProductSelectionSet] = Field(..., description="Products or product sets to fit")
    threadId: Optional[str] = Field(None, description="Optional fitting assistant thread ID for multi-turn refinement")
    message: Optional[str] = Field(None, description="Optional message to refine the fit")
    personality: str = Field("friendly", description="Agent personality (default: 'friendly')")


class FittingSetData(BaseModel):
    title: str = Field(..., description="Fitting set title")
    description: str = Field(..., description="Fitting set description")
    productIds: List[str] = Field(default_factory=list, description="Product IDs used in this set")
    imagePaths: List[str] = Field(default_factory=list, description="Generated image URLs/paths")


class FitData(BaseModel):
    threadId: str = Field(..., description="Thread ID for this session")
    fittingSets: List[FittingSetData] = Field(default_factory=list, description="Generated fitting sets")
    message: str = Field(..., description="Message accompanying the fitting sets")


class FitResponse(BaseModel):
    success: bool = True
    data: FitData


class StreamProgressEvent(BaseModel):
    type: str = Field("progress", description="Event type")
    thinkingMessage: str = Field(..., description="Current thinking message")
    timestamp: str = Field(..., description="ISO timestamp")


class StreamCompleteEvent(BaseModel):
    type: str = Field("complete", description="Event type")
    threadId: str = Field(..., description="Thread ID")
    fittingSets: List[FittingSetData] = Field(..., description="Generated fitting sets")
    message: str = Field(..., description="Accompanying message")


class StreamErrorEvent(BaseModel):
    type: str = Field("error", description="Event type")
    message: str = Field(..., description="Error message")


class StateData(BaseModel):
    threadId: str = Field(..., description="Thread ID")
    fittingSets: List[FittingSetData] = Field(default_factory=list, description="Generated fitting sets")
    journey: Optional[dict] = Field(None, description="Journey data")


class StateResponse(BaseModel):
    success: bool = True
    data: StateData
