"""Seed demo users for testing."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models.merchant import Merchant
from app.models.consumer import Consumer
from app.utils.security import hash_password
from datetime import datetime
import uuid


def seed_demo_users():
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    try:
        # Check if demo merchant exists
        merchant = db.query(Merchant).filter(Merchant.email == "demo@merchant.com").first()
        if not merchant:
            merchant = Merchant(
                id=str(uuid.uuid4()),
                email="demo@merchant.com",
                hashed_password=hash_password("password123"),
                merchant_name="Demo Merchant",
                store_name="Demo Store",
                store_id="demo-store",
                role="merchant",
                is_active=True,
                member_since=datetime.utcnow()
            )
            db.add(merchant)
            print("✅ Created demo merchant: demo@merchant.com / password123")
        else:
            print("ℹ️  Demo merchant already exists")

        # Check if demo consumer exists
        consumer = db.query(Consumer).filter(Consumer.email == "demo@consumer.com").first()
        if not consumer:
            consumer = Consumer(
                email="demo@consumer.com",
                hashed_password=hash_password("password123"),
                full_name="Demo Consumer",
                first_name="Demo",
                last_name="Consumer",
                ai_personality="Friendly",
                is_active=True
            )
            db.add(consumer)
            print("✅ Created demo consumer: demo@consumer.com / password123")
        else:
            print("ℹ️  Demo consumer already exists")

        db.commit()
        print("\n🎉 Demo users ready!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
