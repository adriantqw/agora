from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class CurateMyFitQuestion(Base):
    """Model for tracking questions sent to users in curate-my-fit flow."""
    __tablename__ = "curate_my_fit_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, nullable=False, index=True)  # Agent thread ID
    question_id = Column(String, nullable=False)  # Original agent question UUID
    question_signature = Column(String, nullable=False, index=True)  # type:question_text for deduplication
    question_data = Column(JSON, nullable=True)  # Full question object (for debugging)
    journey_id = Column(String, ForeignKey("journeys.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to Journey (optional, set when journey is created)
    journey = relationship("Journey", foreign_keys=[journey_id])
