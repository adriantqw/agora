from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.merchant import Merchant, RefreshToken
from app.utils.security import verify_password
from app.utils.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.config import settings


def authenticate_merchant(db: Session, email: str, password: str) -> Optional[Merchant]:
    """
    Authenticate a merchant by email and password.

    Args:
        db: Database session
        email: Merchant's email
        password: Plain text password

    Returns:
        Merchant object if authentication successful, None otherwise
    """
    merchant = db.query(Merchant).filter(Merchant.email == email).first()
    if not merchant:
        return None

    if not merchant.is_active:
        return None

    if not verify_password(password, merchant.hashed_password):
        return None

    return merchant


def create_tokens(db: Session, merchant_id: str) -> Tuple[str, str]:
    """
    Create access and refresh tokens for a merchant.

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier

    Returns:
        Tuple of (access_token, refresh_token)
    """
    access_token = create_access_token(merchant_id)
    refresh_token = create_refresh_token(merchant_id)

    # Store refresh token in database
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        merchant_id=merchant_id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(db_refresh_token)
    db.commit()

    return access_token, refresh_token


def validate_refresh_token_db(db: Session, token: str) -> Optional[str]:
    """
    Validate a refresh token from the database.

    Args:
        db: Database session
        token: Refresh token string

    Returns:
        Merchant ID if token is valid, None otherwise
    """
    # First verify the JWT signature and decode
    merchant_id = verify_refresh_token(token)
    if not merchant_id:
        return None

    # Check if token exists in database and is not revoked
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.is_revoked == False
    ).first()

    if not db_token:
        return None

    # Check if token is expired
    if db_token.expires_at < datetime.now(timezone.utc):
        return None

    return merchant_id


def revoke_refresh_token_db(db: Session, token: str) -> bool:
    """
    Revoke a refresh token in the database.

    Args:
        db: Database session
        token: Refresh token string

    Returns:
        True if token was revoked, False otherwise
    """
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if not db_token:
        return False

    db_token.is_revoked = True
    db.commit()
    return True
