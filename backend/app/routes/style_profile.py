from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer
from app.services import style_profile_service
from app.schemas.style_profile import (
    StyleProfileCreate,
    StyleProfileUpdate,
    StyleProfileResponse
)

router = APIRouter(prefix="/api/style-profile", tags=["Style Profile"])


@router.get("/", response_model=StyleProfileResponse)
def get_style_profile(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Get consumer's style profile."""
    profile = style_profile_service.get_style_profile(db, current_consumer.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Style profile not found"
        )
    return profile


@router.post("/", response_model=StyleProfileResponse, status_code=status.HTTP_201_CREATED)
def create_style_profile(
    profile_in: StyleProfileCreate,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Create a new style profile."""
    try:
        profile = style_profile_service.create_style_profile(
            db, current_consumer.id, profile_in.dict()
        )
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/", response_model=StyleProfileResponse)
def update_style_profile(
    profile_in: StyleProfileUpdate,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Update existing style profile."""
    try:
        profile = style_profile_service.update_style_profile(
            db, current_consumer.id, profile_in.dict(exclude_unset=True)
        )
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_style_profile(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Delete style profile."""
    deleted = style_profile_service.delete_style_profile(db, current_consumer.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Style profile not found"
        )
