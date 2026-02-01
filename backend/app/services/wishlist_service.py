"""Service for managing consumer wishlists."""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from app.models.wishlist import WishlistItem, SharedWishlist
from app.models.product import Product
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List


def get_wishlist_items(db: Session, consumer_id: str, page: int = 1, limit: int = 20) -> Dict:
    """Get paginated wishlist items with product details."""
    query = db.query(WishlistItem).filter(WishlistItem.consumer_id == consumer_id)
    query = query.options(joinedload(WishlistItem.product))
    query = query.order_by(WishlistItem.added_at.desc())

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }


def add_wishlist_item(db: Session, consumer_id: str, product_id: str, notes: Optional[str] = None) -> Optional[WishlistItem]:
    """Add product to wishlist. Returns None if duplicate."""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")

    # Check for duplicate
    existing = db.query(WishlistItem).filter(
        WishlistItem.consumer_id == consumer_id,
        WishlistItem.product_id == product_id
    ).first()

    if existing:
        return None  # Already in wishlist

    item = WishlistItem(
        consumer_id=consumer_id,
        product_id=product_id,
        notes=notes
    )

    try:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except IntegrityError:
        db.rollback()
        return None


def remove_wishlist_item(db: Session, consumer_id: str, item_id: str) -> bool:
    """Remove item from wishlist. Returns True if deleted."""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.consumer_id == consumer_id
    ).first()

    if not item:
        return False

    db.delete(item)
    db.commit()
    return True


def create_share_link(db: Session, consumer_id: str, title: Optional[str] = None, expires_in_days: Optional[int] = None) -> SharedWishlist:
    """Generate shareable wishlist link."""
    token = secrets.token_urlsafe(32)
    expires_at = None
    if expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

    share = SharedWishlist(
        consumer_id=consumer_id,
        share_token=token,
        title=title,
        expires_at=expires_at
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


def get_shared_wishlist_by_token(db: Session, token: str) -> Optional[Dict]:
    """Get shared wishlist by token. Returns None if invalid/expired."""
    share = db.query(SharedWishlist).filter(
        SharedWishlist.share_token == token,
        SharedWishlist.is_active == True
    ).first()

    if not share:
        return None

    # Check expiration
    if share.expires_at and share.expires_at < datetime.utcnow():
        return None

    # Increment view count
    share.view_count += 1
    db.commit()

    # Get wishlist items
    items = db.query(WishlistItem).filter(
        WishlistItem.consumer_id == share.consumer_id
    ).options(joinedload(WishlistItem.product)).all()

    return {
        "share": share,
        "items": items
    }


def revoke_share_link(db: Session, consumer_id: str, share_id: str) -> bool:
    """Deactivate share link."""
    share = db.query(SharedWishlist).filter(
        SharedWishlist.id == share_id,
        SharedWishlist.consumer_id == consumer_id
    ).first()

    if not share:
        return False

    share.is_active = False
    db.commit()
    return True


def get_consumer_share_links(db: Session, consumer_id: str) -> List[SharedWishlist]:
    """Get all share links for a consumer."""
    return db.query(SharedWishlist).filter(
        SharedWishlist.consumer_id == consumer_id
    ).order_by(SharedWishlist.created_at.desc()).all()
