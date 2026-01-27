from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer
from app.schemas.journey import JourneyResponse
from app.services import journey_service

router = APIRouter(prefix="/api/journeys", tags=["Journeys"])

@router.get("", response_model=List[JourneyResponse])
def get_journeys(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Get all journeys for the current authenticated consumer.
    """
    journeys = journey_service.get_journeys_by_consumer(db, current_consumer.id)
    return journeys
