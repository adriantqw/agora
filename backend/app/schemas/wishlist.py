from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.product import ProductResponse


class WishlistItemCreate(BaseModel):
    """Schema for creating a wishlist item."""
    product_id: str
    notes: Optional[str] = None


class WishlistItemResponse(BaseModel):
    """Schema for wishlist item response."""
    id: str
    consumer_id: str
    product_id: str
    notes: Optional[str]
    added_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    total_pages: int


class WishlistResponse(BaseModel):
    """Schema for paginated wishlist response."""
    items: List[WishlistItemResponse]
    pagination: PaginationMeta


class CreateShareLinkRequest(BaseModel):
    """Schema for creating a share link."""
    title: Optional[str] = None
    expires_in_days: Optional[int] = None


class SharedWishlistResponse(BaseModel):
    """Schema for shared wishlist response."""
    id: str
    consumer_id: str
    share_token: str
    title: Optional[str]
    is_active: bool
    expires_at: Optional[datetime]
    view_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SharedWishlistPublicResponse(BaseModel):
    """Schema for public shared wishlist view."""
    share: SharedWishlistResponse
    items: List[WishlistItemResponse]
