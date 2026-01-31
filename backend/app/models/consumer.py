from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Consumer(Base):
    """Consumer model for storing consumer account information."""

    __tablename__ = "consumers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Profile fields
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(2000), nullable=True)
    ai_personality = Column(String(50), default='Friendly', nullable=False)  # 'Friendly', 'Professional', 'Sassy'

    # Relationships
    wishlist_items = relationship("WishlistItem", back_populates="consumer", cascade="all, delete-orphan")
    fitting_room_photos = relationship("FittingRoomPhoto", back_populates="consumer", cascade="all, delete-orphan")
    shared_wishlists = relationship("SharedWishlist", back_populates="consumer", cascade="all, delete-orphan")


class ConsumerRefreshToken(Base):
    """Refresh token model for storing and managing consumer refresh tokens."""

    __tablename__ = "consumer_refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
