from sqlalchemy.orm import Session
from app.models.journey import Journey
from typing import List, Optional

def get_journeys_by_consumer(db: Session, consumer_id: str) -> List[Journey]:
    """
    Get all journeys for a specific consumer.
    """
    return db.query(Journey).filter(Journey.consumer_id == consumer_id).all()

def get_public_journeys(db: Session) -> List[Journey]:
    """
    Get all public journeys (where consumer_id is NULL).
    """
    return db.query(Journey).filter(Journey.consumer_id == None).all()

def get_journey_by_id(db: Session, journey_id: str) -> Optional[Journey]:
    """
    Get a journey by ID.
    """
    return db.query(Journey).filter(Journey.id == journey_id).first()

def delete_journey(db: Session, journey_id: str) -> bool:
    """
    Delete a journey and all associated outfits (CASCADE handled by ORM).
    """
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if journey:
        db.delete(journey)
        db.commit()
        return True
    return False
