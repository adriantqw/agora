from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.consumer import Consumer, ConsumerRefreshToken
from app.utils.security import verify_password, hash_password
from app.utils.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.config import settings
from app.schemas.consumer import ConsumerCreate

def get_consumer_by_email(db: Session, email: str) -> Optional[Consumer]:
    return db.query(Consumer).filter(Consumer.email == email).first()

def create_consumer(db: Session, consumer_in: ConsumerCreate) -> Consumer:
    hashed_password = hash_password(consumer_in.password)
    db_consumer = Consumer(
        email=consumer_in.email,
        hashed_password=hashed_password,
        full_name=consumer_in.full_name
    )
    db.add(db_consumer)
    db.commit()
    db.refresh(db_consumer)
    return db_consumer

def authenticate_consumer(db: Session, email: str, password: str) -> Optional[Consumer]:
    consumer = get_consumer_by_email(db, email)
    if not consumer:
        return None
    
    if not consumer.is_active:
        return None
    
    if not verify_password(password, consumer.hashed_password):
        return None
    
    return consumer

def create_consumer_tokens(db: Session, consumer_id: str) -> Tuple[str, str]:
    access_token = create_access_token(consumer_id)
    refresh_token = create_refresh_token(consumer_id)
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = ConsumerRefreshToken(
        consumer_id=consumer_id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(db_refresh_token)
    db.commit()
    
    return access_token, refresh_token

def validate_consumer_refresh_token_db(db: Session, token: str) -> Optional[str]:
    consumer_id = verify_refresh_token(token)
    if not consumer_id:
        return None
    
    db_token = db.query(ConsumerRefreshToken).filter(
        ConsumerRefreshToken.token == token,
        ConsumerRefreshToken.is_revoked == False
    ).first()
    
    if not db_token:
        return None
    
    if db_token.expires_at < datetime.now(timezone.utc):
        return None
    
    return consumer_id

def revoke_consumer_refresh_token_db(db: Session, token: str) -> bool:
    db_token = db.query(ConsumerRefreshToken).filter(ConsumerRefreshToken.token == token).first()
    if not db_token:
        return False
    
    db_token.is_revoked = True
    db.commit()
    return True
