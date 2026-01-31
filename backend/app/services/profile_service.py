"""Service for managing consumer profiles."""
from sqlalchemy.orm import Session
from app.models.consumer import Consumer
from app.models.fitting_room import FittingRoomPhoto
from app.services.storage_service import storage_service
from fastapi import UploadFile
from typing import Dict, List, Optional
import uuid


def update_consumer_profile(db: Session, consumer_id: str, profile_data: Dict) -> Consumer:
    """Update consumer profile fields."""
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if not consumer:
        raise ValueError("Consumer not found")

    # Update allowed fields
    if 'first_name' in profile_data and profile_data['first_name'] is not None:
        consumer.first_name = profile_data['first_name']
    if 'last_name' in profile_data and profile_data['last_name'] is not None:
        consumer.last_name = profile_data['last_name']
    if 'ai_personality' in profile_data and profile_data['ai_personality'] is not None:
        # Validate personality
        valid_personalities = ['Friendly', 'Professional', 'Sassy']
        if profile_data['ai_personality'] in valid_personalities:
            consumer.ai_personality = profile_data['ai_personality']
        else:
            raise ValueError(f"Invalid personality. Must be one of: {', '.join(valid_personalities)}")

    db.commit()
    db.refresh(consumer)
    return consumer


async def upload_avatar(db: Session, consumer_id: str, file: UploadFile) -> Consumer:
    """Upload avatar to R2 and update consumer."""
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if not consumer:
        raise ValueError("Consumer not found")

    # Delete old avatar if exists
    if consumer.avatar_url:
        # Extract filename from URL
        old_filename = consumer.avatar_url.split('/')[-1]
        storage_service.delete_image(old_filename)

    # Upload new avatar
    result = await storage_service.upload_image(file)

    if 'error' in result:
        raise ValueError(result['error'])

    consumer.avatar_url = result['url']
    db.commit()
    db.refresh(consumer)
    return consumer


async def upload_fitting_photo(db: Session, consumer_id: str, file: UploadFile, angle: str) -> FittingRoomPhoto:
    """Upload fitting room photo to R2."""
    # Validate angle
    valid_angles = ['front', 'side', 'back']
    if angle not in valid_angles:
        raise ValueError(f"Invalid angle. Must be one of: {', '.join(valid_angles)}")

    # Upload to R2
    result = await storage_service.upload_image(file)

    if 'error' in result:
        raise ValueError(result['error'])

    # Create photo record
    photo = FittingRoomPhoto(
        consumer_id=consumer_id,
        image_url=result['url'],
        angle=angle
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def get_fitting_photos(db: Session, consumer_id: str) -> List[FittingRoomPhoto]:
    """Get all fitting room photos for consumer."""
    photos = db.query(FittingRoomPhoto).filter(
        FittingRoomPhoto.consumer_id == consumer_id
    ).order_by(FittingRoomPhoto.uploaded_at.desc()).all()
    return photos


async def delete_fitting_photo(db: Session, consumer_id: str, photo_id: str) -> bool:
    """Delete fitting room photo."""
    photo = db.query(FittingRoomPhoto).filter(
        FittingRoomPhoto.id == photo_id,
        FittingRoomPhoto.consumer_id == consumer_id
    ).first()

    if not photo:
        return False

    # Delete from R2
    filename = photo.image_url.split('/')[-1]
    storage_service.delete_image(filename)

    # Delete from database
    db.delete(photo)
    db.commit()
    return True
