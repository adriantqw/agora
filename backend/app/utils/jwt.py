from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.config import settings


def create_access_token(merchant_id: str) -> str:
    """
    Create a JWT access token.

    Args:
        merchant_id: The merchant's unique identifier

    Returns:
        Encoded JWT token string
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {
        "sub": merchant_id,
        "type": "access",
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(merchant_id: str) -> str:
    """
    Create a JWT refresh token.

    Args:
        merchant_id: The merchant's unique identifier

    Returns:
        Encoded JWT token string
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": merchant_id,
        "type": "refresh",
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[str]:
    """
    Verify an access token and extract merchant_id.

    Args:
        token: JWT access token string

    Returns:
        Merchant ID if token is valid, None otherwise
    """
    payload = decode_token(token)
    if payload is None:
        return None

    if payload.get("type") != "access":
        return None

    merchant_id: str = payload.get("sub")
    if merchant_id is None:
        return None

    return merchant_id


def verify_refresh_token(token: str) -> Optional[str]:
    """
    Verify a refresh token and extract merchant_id.

    Args:
        token: JWT refresh token string

    Returns:
        Merchant ID if token is valid, None otherwise
    """
    payload = decode_token(token)
    if payload is None:
        return None

    if payload.get("type") != "refresh":
        return None

    merchant_id: str = payload.get("sub")
    if merchant_id is None:
        return None

    return merchant_id
