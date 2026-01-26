from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.consumer import ConsumerCreate, ConsumerLogin, ConsumerTokenResponse, ConsumerResponse, ConsumerRefreshRequest
from app.services import consumer_auth_service
from app.dependencies import get_current_consumer
from app.models.consumer import Consumer

router = APIRouter(prefix="/api/consumer/auth", tags=["Consumer Auth"])

@router.post("/register", response_model=ConsumerResponse, status_code=status.HTTP_201_CREATED)
def register(consumer_in: ConsumerCreate, db: Session = Depends(get_db)):
    """Register a new consumer."""
    existing_consumer = consumer_auth_service.get_consumer_by_email(db, consumer_in.email)
    if existing_consumer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return consumer_auth_service.create_consumer(db, consumer_in)

@router.post("/login", response_model=ConsumerTokenResponse)
def login(login_data: ConsumerLogin, db: Session = Depends(get_db)):
    """Authenticate consumer and return tokens."""
    consumer = consumer_auth_service.authenticate_consumer(db, login_data.email, login_data.password)
    if not consumer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token, refresh_token = consumer_auth_service.create_consumer_tokens(db, consumer.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": consumer
    }

@router.post("/refresh", response_model=ConsumerTokenResponse)
def refresh_token(refresh_data: ConsumerRefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using a refresh token."""
    consumer_id = consumer_auth_service.validate_consumer_refresh_token_db(db, refresh_data.refresh_token)
    if not consumer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Revoke old refresh token (rotate)
    consumer_auth_service.revoke_consumer_refresh_token_db(db, refresh_data.refresh_token)
    
    # Create new tokens
    access_token, new_refresh_token = consumer_auth_service.create_consumer_tokens(db, consumer_id)
    
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": consumer
    }

@router.get("/me", response_model=ConsumerResponse)
def read_users_me(current_consumer: Consumer = Depends(get_current_consumer)):
    """Get current authenticated consumer."""
    return current_consumer

@router.post("/logout")
def logout(
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Logout (revoke refresh token)."""
    # Note: In a real implementation we might pass the refresh token in the body to revoke specific one.
    # For now, we rely on client clearing tokens.
    # To fully implement, we'd need to extract refresh token from request or revoke all for user.
    # Since dependencies.py verifies access token, we know who the user is.
    return {"message": "Logged out successfully"}
