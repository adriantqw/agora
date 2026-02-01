from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class WishlistItem(Base):
    """Consumer wishlist items linking to products."""
    __tablename__ = "wishlist_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("product_inventory.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    consumer = relationship("Consumer", back_populates="wishlist_items")
    product = relationship("Product")

    # Prevent duplicate products per consumer
    __table_args__ = (
        UniqueConstraint('consumer_id', 'product_id', name='uix_consumer_product'),
    )


class SharedWishlist(Base):
    """Shareable wishlist links with tokens."""
    __tablename__ = "shared_wishlists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consumer_id = Column(String, ForeignKey("consumers.id", ondelete="CASCADE"), nullable=False, index=True)
    share_token = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    consumer = relationship("Consumer", back_populates="shared_wishlists")
