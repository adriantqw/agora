#!/usr/bin/env python3
"""
Seed database with demo merchant account and sample inventory.
"""
import sys
import csv
from pathlib import Path
from datetime import datetime, timezone
import uuid

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal, init_db
from app.models.merchant import Merchant
from app.models.product import Product
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


def seed_sample_products():
    """Create sample inventory products for John's Store from CSV file."""
    db = SessionLocal()

    merchant_id = "user_demo123"
    csv_path = Path(__file__).parent / "sample_products.csv"

    try:
        # Check if products already exist
        existing_count = db.query(Product).filter(Product.merchant_id == merchant_id).count()
        if existing_count > 0:
            print(f"Products already exist ({existing_count} items). Skipping seed.")
            return

        # Read products from CSV
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # Parse tags from comma-separated string to list
                tags = [tag.strip() for tag in row["tags"].split(",")]

                product = Product(
                    id=str(uuid.uuid4()),
                    merchant_id=merchant_id,
                    name=row["name"],
                    sku=row["sku"],
                    price=float(row["price"]),
                    quantity=int(row["quantity"]),
                    tags=tags,
                    image=row["image"],
                    description=row["description"]
                )
                db.add(product)
                count += 1

        db.commit()
        print(f"✅ Sample products created successfully! ({count} items)")

    except Exception as e:
        print(f"❌ Error seeding products: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("✅ Database initialized")

    print("\nSeeding demo merchant...")
    seed_demo_merchant()

    print("\nSeeding sample products...")
    seed_sample_products()

    print("\n🎉 Database seeding complete!")
