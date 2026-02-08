from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.merchant import Merchant
from app.models.consumer import Consumer
from app.utils.jwt import verify_access_token

# HTTP Bearer token security scheme
security = HTTPBearer()

# Optional HTTP Bearer token security scheme for guest mode
optional_security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Merchant:
    """
    Dependency to get the current authenticated merchant from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        Merchant object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Verify and decode token
    merchant_id = verify_access_token(token)
    if merchant_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get merchant from database
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if merchant is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not merchant.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
        
    return merchant

def get_current_consumer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Consumer:
    """
    Dependency to get the current authenticated consumer from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        Consumer object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Verify and decode token
    consumer_id = verify_access_token(token)
    if consumer_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get consumer from database
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if consumer is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not consumer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return consumer


def get_current_consumer_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db)
) -> Optional[Consumer]:
    """
    Optional dependency to get current authenticated consumer from JWT token.
    Returns None if no token is provided or token is invalid (guest mode support).

    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session

    Returns:
        Consumer object or None if not authenticated
    """
    if credentials is None or credentials.credentials is None:
        return None

    token = credentials.credentials

    # Verify and decode token
    consumer_id = verify_access_token(token)
    if consumer_id is None:
        return None

    # Get consumer from database
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if consumer is None:
        return None

    if not consumer.is_active:
        return None

    return consumer
