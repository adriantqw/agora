from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Journey(Base):
    """Journey model for storing consumer shopping journeys."""
    __tablename__ = "journeys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String, nullable=False)
    status = Column(String, nullable=False) # 'active', 'in-progress', 'ideation'
    status_color = Column(String, nullable=False)
    status_label = Column(String, nullable=False)
    closet_url = Column(String, nullable=True)

    # New field for curate-my-fit integration
    thread_id = Column(String, nullable=True, index=True, unique=True)  # Agent thread ID for question tracking

    # New fields for curate-my-fit integration
    summary = Column(Text, nullable=True)  # AI-generated summary
    search_query = Column(Text, nullable=True)  # Initial user query
    image_urls = Column(JSON, nullable=True)  # R2 URLs of uploaded images

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    outfits = relationship("Outfit", back_populates="journey", cascade="all, delete-orphan")


class Outfit(Base):
    """Outfit model for items within a journey."""
    __tablename__ = "outfits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    journey_id = Column(String, ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String, nullable=False)
    subtext = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    
    # Icon properties
    icon_name = Column(String, nullable=True) # Name of Lucide icon
    icon_color = Column(String, nullable=True)
    background_color = Column(String, nullable=True)
    
    is_ai_pick = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    journey = relationship("Journey", back_populates="outfits")
