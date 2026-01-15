from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Product(Base):
    """Product model for storing inventory items."""

    __tablename__ = "product_inventory"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    merchant_id = Column(String, ForeignKey("merchant_info.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    tags = Column(JSON, nullable=False, default=list)
    image = Column(String(2000), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('merchant_id', 'sku', name='uix_merchant_sku'),
    )
