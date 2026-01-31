from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class FittingRoomPhoto(Base):
    """Fitting room body profile photos."""
    __tablename__ = "fitting_room_photos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(2000), nullable=False)  # R2 URL
    angle = Column(String(50), nullable=False)  # 'front', 'side', 'back'
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    consumer = relationship("Consumer", back_populates="fitting_room_photos")
