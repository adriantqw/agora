from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer
from app.models.journey import Journey
from app.schemas.journey import JourneyResponse
from app.services import journey_service

router = APIRouter(prefix="/api/journeys", tags=["Journeys"])

@router.get("", response_model=List[JourneyResponse])
def get_journeys(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Get all journeys for current authenticated consumer.
    """
    journeys = journey_service.get_journeys_by_consumer(db, str(current_consumer.id))
    return journeys

@router.get("/{journey_id}", response_model=JourneyResponse)
def get_journey(
    journey_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Get a journey by ID for current authenticated consumer.
    """
    journey = journey_service.get_journey_by_id(db, journey_id)

    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    if str(journey.consumer_id) != str(current_consumer.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this journey")

    return journey

@router.delete("/{journey_id}")
def delete_journey(
    journey_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Delete a journey (and all associated outfits) for current consumer.
    """
    journey = journey_service.get_journey_by_id(db, journey_id)

    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    if str(journey.consumer_id) != str(current_consumer.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this journey")

    journey_service.delete_journey(db, journey_id)
    return {"success": True, "message": "Journey deleted successfully"}
