#!/usr/bin/env python3
"""
Seed database with demo merchant account.
"""
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal, init_db
from app.models.merchant import Merchant
from app.utils.security import hash_password


def seed_demo_merchant():
    """Create demo merchant account."""
    db = SessionLocal()

    try:
        # Check if demo merchant already exists
        existing_merchant = db.query(Merchant).filter(Merchant.email == "demo@merchant.com").first()
        if existing_merchant:
            print("Demo merchant already exists. Skipping seed.")
            return

        # Create demo merchant
        demo_merchant = Merchant(
            id="user_demo123",
            email="demo@merchant.com",
            hashed_password=hash_password("password123"),
            merchant_name="John Doe",
            store_name="John's Store",
            store_id="STORE001",
            role="merchant",
            is_active=True,
            member_since=datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        )

        db.add(demo_merchant)
        db.commit()

        print("✅ Demo merchant created successfully!")
        print(f"   Email: {demo_merchant.email}")
        print(f"   Password: password123")
        print(f"   Store: {demo_merchant.store_name}")
        print(f"   Store ID: {demo_merchant.store_id}")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("✅ Database initialized")

    print("\nSeeding demo merchant...")
    seed_demo_merchant()

    print("\n🎉 Database seeding complete!")
