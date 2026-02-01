"""API routes for consumer wishlist management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer
from app.services import wishlist_service
from app.schemas.wishlist import (
    WishlistResponse, WishlistItemCreate, WishlistItemResponse,
    CreateShareLinkRequest, SharedWishlistResponse, SharedWishlistPublicResponse
)

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("/", response_model=WishlistResponse)
def get_wishlist(
    page: int = 1,
    limit: int = 20,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Get all wishlist items for current consumer."""
    result = wishlist_service.get_wishlist_items(db, current_consumer.id, page, limit)
    return {
        "items": result["items"],
        "pagination": {
            "page": result["page"],
            "limit": result["limit"],
            "total": result["total"],
            "total_pages": result["total_pages"]
        }
    }


@router.post("/", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    item_in: WishlistItemCreate,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Add product to wishlist."""
    try:
        item = wishlist_service.add_wishlist_item(
            db, current_consumer.id, item_in.product_id, item_in.notes
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product already in wishlist"
            )
        return item
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    item_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Remove item from wishlist."""
    deleted = wishlist_service.remove_wishlist_item(db, current_consumer.id, item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


@router.post("/share", response_model=SharedWishlistResponse)
def create_share_link(
    share_in: CreateShareLinkRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Create shareable wishlist link."""
    share = wishlist_service.create_share_link(
        db, current_consumer.id, share_in.title, share_in.expires_in_days
    )
    return share


@router.get("/share/{token}", response_model=SharedWishlistPublicResponse)
def get_shared_wishlist(token: str, db: Session = Depends(get_db)):
    """Get shared wishlist (public endpoint - no authentication required)."""
    result = wishlist_service.get_shared_wishlist_by_token(db, token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared wishlist not found or expired"
        )
    return result


@router.delete("/share/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_share_link(
    share_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Revoke share link."""
    revoked = wishlist_service.revoke_share_link(db, current_consumer.id, share_id)
    if not revoked:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")
