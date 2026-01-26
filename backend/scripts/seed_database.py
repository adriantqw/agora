#!/usr/bin/env python3
"""
Seed database with demo merchant account, consumer account, and sample inventory.
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
from app.models.consumer import Consumer
from app.models.product import Product
from app.models.journey import Journey, Outfit
from app.utils.security import hash_password


def seed_demo_merchant():
    """Create demo merchant account."""
    db = SessionLocal()

    try:
        # Check if demo merchant already exists
        existing_merchant = db.query(Merchant).filter(Merchant.email == "demo@merchant.com").first()
        if existing_merchant:
            print("Demo merchant already exists. Skipping seed.")
        else:
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
        print(f"❌ Error seeding merchant: {e}")
        db.rollback()
    finally:
        db.close()


def seed_demo_consumer():
    """Create demo consumer account."""
    db = SessionLocal()

    try:
        # Check if demo consumer already exists
        existing_consumer = db.query(Consumer).filter(Consumer.email == "demo@consumer.com").first()
        if existing_consumer:
            print("Demo consumer already exists. Skipping seed.")
        else:
            # Create demo consumer
            demo_consumer = Consumer(
                id="user_consumer123",
                email="demo@consumer.com",
                hashed_password=hash_password("password123"),
                full_name="Jane Shopper",
                is_active=True
            )

            db.add(demo_consumer)
            db.commit()

            print("✅ Demo consumer created successfully!")
            print(f"   Email: {demo_consumer.email}")
            print(f"   Password: password123")
            print(f"   Name: {demo_consumer.full_name}")

    except Exception as e:
        print(f"❌ Error seeding consumer: {e}")
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
        if not csv_path.exists():
             print(f"Sample products CSV not found at {csv_path}. Skipping.")
             return

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

def seed_journeys():
    """Seed journeys for the demo consumer."""
    db = SessionLocal()
    consumer_id = "user_consumer123"

    try:
        # Check if consumer exists (should be seeded by seed_demo_consumer)
        consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
        if not consumer:
            print("Demo consumer not found. Cannot seed journeys.")
            return

        # Check if journeys already exist
        existing_count = db.query(Journey).filter(Journey.consumer_id == consumer_id).count()
        if existing_count > 0:
            print(f"Journeys already exist ({existing_count} items). Skipping seed.")
            return

        journeys_data = [
            {
                "id": "valentines-day",
                "title": "Valentine's Day Date",
                "status": "active",
                "status_color": "#F5A5B8",
                "status_label": "Ongoing Journey",
                "closet_url": "/browse",
                "outfits": [
                    {"label": "Candlelight Elegance", "subtext": "Romantic dinner dress", "price": 145, "icon_name": "Heart", "icon_color": "#F5A5B8", "background_color": "#FFF5F7", "is_ai_pick": True},
                    {"label": "Gallery Night Out", "subtext": "Art exhibition chic", "price": 210, "icon_name": "GlassWater", "icon_color": "#4299e1", "background_color": "#EBF8FF", "is_ai_pick": False},
                    {"label": "Soft Romance", "subtext": "Casual brunch outfit", "price": 120, "icon_name": "Flower", "icon_color": "#F5A5B8", "background_color": "#FFF5F7", "is_ai_pick": False},
                    {"label": "Modern Minimalist", "subtext": "Evening cocktails", "price": 165, "icon_name": "Moon", "icon_color": "#805ad5", "background_color": "#FAF5FF", "is_ai_pick": False},
                ]
            },
            {
                "id": "office-edit",
                "title": "The Office Edit",
                "status": "in-progress",
                "status_color": "#F5A5B8",
                "status_label": "Ongoing Journey",
                "closet_url": "/browse",
                "outfits": [
                    {"label": "The Power Suit", "subtext": "Executive meeting", "price": 285, "icon_name": "Briefcase", "icon_color": "#1a202c", "background_color": "#F7FAFC", "is_ai_pick": False},
                    {"label": "Creative Agency Look", "subtext": "Startup casual Friday", "price": 110, "icon_name": "PenTool", "icon_color": "#667eea", "background_color": "#EBF4FF", "is_ai_pick": True},
                    {"label": "Polished Essential", "subtext": "Daily office staple", "price": 150, "icon_name": "Shirt", "icon_color": "#4299e1", "background_color": "#EBF8FF", "is_ai_pick": False},
                    {"label": "Business Casual Midi", "subtext": "Client presentation", "price": 195, "icon_name": "Calendar", "icon_color": "#718096", "background_color": "#F7FAFC", "is_ai_pick": False},
                ]
            },
            {
                "id": "girls-night",
                "title": "Girls' Night Out",
                "status": "ideation",
                "status_color": "#4299e1",
                "status_label": "Ideation Stage",
                "closet_url": "/browse",
                "outfits": [
                    {"label": "Cocktail Hour Sparkle", "subtext": "Rooftop bar glam", "price": 175, "icon_name": "Music", "icon_color": "#F5A5B8", "background_color": "#FFF5F7", "is_ai_pick": True},
                    {"label": "Urban Edge Set", "subtext": "Club-ready outfit", "price": 130, "icon_name": "PartyPopper", "icon_color": "#805ad5", "background_color": "#FAF5FF", "is_ai_pick": False},
                    {"label": "The 'It' Girl Midi", "subtext": "Dinner & dancing", "price": 95, "icon_name": "Stars", "icon_color": "#F59E0B", "background_color": "#FFFBEB", "is_ai_pick": False},
                    {"label": "After-Hours Chic", "subtext": "Late night lounge", "price": 155, "icon_name": "Wine", "icon_color": "#DC2626", "background_color": "#FEF2F2", "is_ai_pick": False},
                ]
            }
        ]

        count = 0
        for j_data in journeys_data:
            journey = Journey(
                id=j_data["id"],
                consumer_id=consumer_id,
                title=j_data["title"],
                status=j_data["status"],
                status_color=j_data["status_color"],
                status_label=j_data["status_label"],
                closet_url=j_data["closet_url"]
            )
            db.add(journey)
            db.commit() # Commit to get ID (though we set it manually)

            for o_data in j_data["outfits"]:
                outfit = Outfit(
                    id=str(uuid.uuid4()),
                    journey_id=journey.id,
                    label=o_data["label"],
                    subtext=o_data["subtext"],
                    price=o_data["price"],
                    icon_name=o_data["icon_name"],
                    icon_color=o_data["icon_color"],
                    background_color=o_data["background_color"],
                    is_ai_pick=o_data["is_ai_pick"]
                )
                db.add(outfit)
            count += 1
        
        db.commit()
        print(f"✅ seeded {count} journeys for demo consumer!")

    except Exception as e:
        print(f"❌ Error seeding journeys: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("✅ Database initialized")

    print("\nSeeding demo merchant...")
    seed_demo_merchant()
    
    print("\nSeeding demo consumer...")
    seed_demo_consumer()

    print("\nSeeding sample products...")
    seed_sample_products()

    print("\nSeeding journeys...")
    seed_journeys()

    print("\n🎉 Database seeding complete!")
