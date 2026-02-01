"""API routes for consumer profile management."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer
from app.services import profile_service
from app.schemas.profile import (
    ProfileUpdateRequest, AvatarUploadResponse, FittingRoomPhotoResponse
)
from app.schemas.consumer import ConsumerResponse
from typing import List

router = APIRouter(prefix="/api/profile", tags=["Consumer Profile"])


@router.put("/", response_model=ConsumerResponse)
def update_profile(
    profile_in: ProfileUpdateRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Update consumer profile."""
    try:
        updated = profile_service.update_consumer_profile(
            db, current_consumer.id, profile_in.dict(exclude_unset=True)
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Upload avatar image."""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        updated = await profile_service.upload_avatar(db, current_consumer.id, file)
        return {"avatar_url": updated.avatar_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fitting-room", response_model=FittingRoomPhotoResponse)
async def upload_fitting_photo(
    file: UploadFile = File(...),
    angle: str = Form(...),
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Upload fitting room photo."""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        photo = await profile_service.upload_fitting_photo(db, current_consumer.id, file, angle)
        return photo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/fitting-room", response_model=List[FittingRoomPhotoResponse])
def get_fitting_photos(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Get all fitting room photos."""
    return profile_service.get_fitting_photos(db, current_consumer.id)


@router.delete("/fitting-room/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fitting_photo(
    photo_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Delete fitting room photo."""
    deleted = await profile_service.delete_fitting_photo(db, current_consumer.id, photo_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Photo not found")
