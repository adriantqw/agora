from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Merchant(Base):
    """Merchant model for storing merchant account information."""

    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    merchant_name = Column(String, nullable=False)
    store_name = Column(String, nullable=False)
    store_id = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, default="merchant", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    member_since = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class RefreshToken(Base):
    """Refresh token model for storing and managing refresh tokens."""

    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    merchant_id = Column(String, ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
