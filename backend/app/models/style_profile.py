from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class StyleProfile(Base):
    """Consumer style profile preferences."""
    __tablename__ = "style_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Aesthetic preferences (JSON arrays)
    vibes = Column(JSON, default=list, nullable=False)               # ["Minimalist", "Classic Chic", "Bohemian"]
    loved_colors = Column(JSON, default=list, nullable=False)        # ["#000000", "#F5F5F4", "#2563EB"]
    avoided_colors = Column(JSON, default=list, nullable=False)      # ["#FACC15", "#9333EA"]
    favorite_brands = Column(JSON, default=list, nullable=False)     # ["Zara", "Aritzia", "COS"]

    # Fit & Budget preferences
    fit_preference = Column(String(20), nullable=True)               # "Tight" | "Regular" | "Oversized"
    budget_tier = Column(Integer, default=2, nullable=False)         # 1-4 ($, $$, $$$, $$$$)

    # AI-generated insights (future enhancement)
    style_archetype = Column(String(100), nullable=True)             # "The Modern Minimalist"
    profile_strength = Column(Integer, default=0, nullable=False)    # 0-100 archetype alignment strength

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    consumer = relationship("Consumer", back_populates="style_profile")
