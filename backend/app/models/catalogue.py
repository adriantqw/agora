from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Catalogue(Base):
    """Catalogue model for storing uploaded PDF catalogues."""

    __tablename__ = "catalogues"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    merchant_id = Column(String, ForeignKey("merchant_info.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    file_url = Column(String(2000), nullable=False)  # R2 URL for uploaded PDF
    status = Column(String, nullable=False, default="processing", index=True)  # "processing" | "completed" | "failed"
    items_extracted = Column(Integer, nullable=False, default=0)
    processing_time = Column(Float, nullable=True)  # Time in seconds
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class CatalogueItem(Base):
    """CatalogueItem model for storing extracted items from catalogues."""

    __tablename__ = "catalogue_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    catalogue_id = Column(String, ForeignKey("catalogues.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_id = Column(String, ForeignKey("merchant_info.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    sizes = Column(JSON, nullable=False, default=list)  # Array of size strings
    colours = Column(JSON, nullable=False, default=list)  # Array of colour strings
    page = Column(Integer, nullable=False)
    image_url = Column(String(2000), nullable=False)  # R2 URL for cropped item image
    bbox_data = Column(JSON, nullable=False)  # {ymin, xmin, ymax, xmax}
    product_id = Column(String, ForeignKey("product_inventory.id", ondelete="SET NULL"), nullable=True)
    is_converted = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('merchant_id', 'catalogue_id', 'name', 'page', name='uix_merchant_catalogue_name_page'),
    )
