#!/usr/bin/env python3
"""
Seed database with demo merchant account, consumer account, and sample inventory.

Usage:
    python seed_database.py                    # Use default sample_products.csv
    python seed_database.py --dataset adidas   # Use output/adidas_products.csv
    python seed_database.py --dataset myntra   # Use output/myntra_products.csv
    python seed_database.py --dataset farfetch # Use output/farfetch_products.csv
    python seed_database.py --dataset all      # Use all CSVs from output folder
    python seed_database.py --limit 500        # Limit number of products

Note: Run import_dataset.py first to generate the CSV files in output folder.
"""
import sys
import csv
import argparse
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


def seed_sample_products(dataset: str = None, limit: int = None):
    """Create sample inventory products for John's Store.

    Args:
        dataset: Which dataset to use ('adidas', 'myntra', 'farfetch', 'all', or None for default CSV)
        limit: Maximum number of products to import per dataset
    """
    db = SessionLocal()

    merchant_id = "user_demo123"
    scripts_dir = Path(__file__).parent
    output_dir = scripts_dir / "output"

    # CSV files in output folder
    dataset_files = {
        "adidas": output_dir / "adidas_products.csv",
        "myntra": output_dir / "myntra_products.csv",
        "farfetch": output_dir / "farfetch_products.csv",
    }

    try:
        # Check if products already exist
        existing_count = db.query(Product).filter(Product.merchant_id == merchant_id).count()
        if existing_count > 0:
            print(f"Products already exist ({existing_count} items). Skipping seed.")
            return

        csv_files_to_process = []

        if dataset is None:
            # Use default sample_products.csv
            default_csv = scripts_dir / "sample_products.csv"
            if default_csv.exists():
                csv_files_to_process.append(("default", default_csv))
            else:
                print(f"Sample products CSV not found at {default_csv}. Skipping.")
                return
        elif dataset == "all":
            # Import from all dataset CSVs in output folder
            for name, csv_path in dataset_files.items():
                if csv_path.exists():
                    csv_files_to_process.append((name, csv_path))
                else:
                    print(f"  CSV not found: {csv_path}. Run import_dataset.py first.")
        elif dataset in dataset_files:
            # Import from specific dataset CSV
            csv_path = dataset_files[dataset]
            if csv_path.exists():
                csv_files_to_process.append((dataset, csv_path))
            else:
                print(f"CSV not found: {csv_path}. Run import_dataset.py --source {dataset} first.")
                return
        else:
            print(f"Unknown dataset: {dataset}. Use 'adidas', 'myntra', 'farfetch', or 'all'.")
            return

        total_count = 0
        # Add dataset prefix to SKUs when importing multiple datasets to avoid collisions
        use_prefix = len(csv_files_to_process) > 1
        for name, csv_path in csv_files_to_process:
            sku_prefix = f"{name.upper()}-" if use_prefix else ""
            count = _import_products_from_csv(db, merchant_id, csv_path, limit, sku_prefix)
            total_count += count
            print(f"  Imported {count} products from {name}")

        db.commit()
        print(f"✅ Sample products created successfully! ({total_count} items total)")

    except Exception as e:
        print(f"❌ Error seeding products: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def _import_products_from_csv(db, merchant_id: str, csv_path: Path, limit: int = None, sku_prefix: str = "") -> int:
    """Import products from a CSV file into the database.

    Args:
        db: Database session
        merchant_id: Merchant ID to associate products with
        csv_path: Path to CSV file
        limit: Maximum number of products to import
        sku_prefix: Prefix to add to SKUs (for avoiding collisions when importing multiple datasets)

    Returns count of products imported.
    """
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if limit and count >= limit:
                break

            # Parse tags from comma-separated string to list
            tags_str = row.get("tags", "")
            tags = [tag.strip() for tag in tags_str.split(",") if tag.strip()]

            # Add prefix to SKU if provided (for multi-dataset imports)
            sku = f"{sku_prefix}{row['sku']}" if sku_prefix else row["sku"]

            product = Product(
                id=str(uuid.uuid4()),
                merchant_id=merchant_id,
                name=row["name"],
                sku=sku,
                price=float(row["price"]),
                quantity=int(row["quantity"]),
                tags=tags,
                image=row.get("image", ""),
                description=row.get("description", "")
            )
            db.add(product)
            count += 1

    return count

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
            # return # Disabled return to allow updating existing data if needed, or delete and re-seed
            # For simplicity, we'll just delete existing for this user and re-seed
            db.query(Journey).filter(Journey.consumer_id == consumer_id).delete()
            db.commit()
            print("Deleted existing journeys to re-seed with new data.")

        journeys_data = [
          {
            "id": "office-essentials",
            "title": "Office Essentials",
            "status": "active",
            "status_color": "#4299e1",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Silk Button-Down", "subtext": "Cream tailored blouse", "price": 120, "icon_name": "Shirt", "icon_color": "#4A5568", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Tailored Trousers", "subtext": "High-waisted charcoal", "price": 150, "icon_name": "Shirt", "icon_color": "#2D3748", "background_color": "#EDF2F7", "is_ai_pick": True},
              {"label": "Leather Loafers", "subtext": "Classic black leather", "price": 180, "icon_name": "Watch", "icon_color": "#1A202C", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Structured Tote", "subtext": "Daily work carry-all", "price": 250, "icon_name": "Briefcase", "icon_color": "#718096", "background_color": "#F8FAFC", "is_ai_pick": False},
            ],
          },
          {
            "id": "corporate-chic",
            "title": "Corporate Chic",
            "status": "active",
            "status_color": "#4299e1",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Checkered Blazer", "subtext": "Professional layering", "price": 210, "icon_name": "Shirt", "icon_color": "#4A5568", "background_color": "#F7FAFC", "is_ai_pick": True},
              {"label": "Pencil Skirt", "subtext": "Navy wool blend", "price": 95, "icon_name": "Shirt", "icon_color": "#2C5282", "background_color": "#EBF8FF", "is_ai_pick": False},
              {"label": "Gold Hoop Earrings", "subtext": "Subtle office shimmer", "price": 45, "icon_name": "Gem", "icon_color": "#D69E2E", "background_color": "#FFFFF0", "is_ai_pick": False},
              {"label": "Pointed Heels", "subtext": "Midnight blue suede", "price": 165, "icon_name": "Wine", "icon_color": "#2A4365", "background_color": "#EBF8FF", "is_ai_pick": False},
            ],
          },
          {
            "id": "wedding-guest",
            "title": "Summer Wedding",
            "status": "active",
            "status_color": "#F5A5B8",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Floral Midi Dress", "subtext": "Wedding guest attire", "price": 245, "icon_name": "Flower", "icon_color": "#F5A5B8", "background_color": "#FFF5F7", "is_ai_pick": True},
              {"label": "Pearl Clutch", "subtext": "Evening evening bag", "price": 85, "icon_name": "ShoppingBag", "icon_color": "#CBD5E0", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Strappy Sandals", "subtext": "Nude block heels", "price": 120, "icon_name": "Heart", "icon_color": "#F5A5B8", "background_color": "#FFF5F7", "is_ai_pick": False},
              {"label": "Silk Scarf", "subtext": "Matching floral print", "price": 40, "icon_name": "Stars", "icon_color": "#ED64A6", "background_color": "#FFF5F7", "is_ai_pick": False},
            ],
          },
          {
            "id": "gala-dinner",
            "title": "Company Event Gala",
            "status": "active",
            "status_color": "#805ad5",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Silk Slip Dress", "subtext": "Formal dinner attire", "price": 280, "icon_name": "Sparkles", "icon_color": "#805ad5", "background_color": "#FAF5FF", "is_ai_pick": True},
              {"label": "Velvet Blazer", "subtext": "Structured evening layer", "price": 195, "icon_name": "Shirt", "icon_color": "#44337A", "background_color": "#F3E8FF", "is_ai_pick": False},
              {"label": "Silver Pumps", "subtext": "Metallic statement", "price": 155, "icon_name": "Crown", "icon_color": "#718096", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Crystal Drop Earrings", "subtext": "Gala-ready accessories", "price": 75, "icon_name": "Gem", "icon_color": "#805ad5", "background_color": "#FAF5FF", "is_ai_pick": False},
            ],
          },
          {
            "id": "midnight-out",
            "title": "Saturday Night Out",
            "status": "active",
            "status_color": "#ED64A6",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Sequin Mini Skirt", "subtext": "Party-ready sparkle", "price": 110, "icon_name": "Music", "icon_color": "#ED64A6", "background_color": "#FFF5F7", "is_ai_pick": True},
              {"label": "Lace Bodysuit", "subtext": "Midnight black layering", "price": 75, "icon_name": "Heart", "icon_color": "#1A202C", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Platform Boots", "subtext": "Dancing-all-night shoes", "price": 140, "icon_name": "Zap", "icon_color": "#ED64A6", "background_color": "#FFF5F7", "is_ai_pick": False},
              {"label": "Chain Belt", "subtext": "Silver accent piece", "price": 35, "icon_name": "Activity", "icon_color": "#718096", "background_color": "#F7FAFC", "is_ai_pick": False},
            ],
          },
          {
            "id": "club-luxe",
            "title": "After-Hours Edge",
            "status": "active",
            "status_color": "#1A202C",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Leather Trousers", "subtext": "Night out attire", "price": 195, "icon_name": "Flame", "icon_color": "#1A202C", "background_color": "#F7FAFC", "is_ai_pick": True},
              {"label": "Statement Choker", "subtext": "Bold metallic accessory", "price": 55, "icon_name": "Crown", "icon_color": "#D69E2E", "background_color": "#FFFFF0", "is_ai_pick": False},
              {"label": "Ankle Boots", "subtext": "Patent leather finish", "price": 130, "icon_name": "Zap", "icon_color": "#1A202C", "background_color": "#F7FAFC", "is_ai_pick": False},
              {"label": "Micro Bag", "subtext": "Club-ready essential", "price": 90, "icon_name": "ShoppingBag", "icon_color": "#1A202C", "background_color": "#F7FAFC", "is_ai_pick": False},
            ],
          },
          {
            "id": "summer-outing",
            "title": "Summer Outing",
            "status": "active",
            "status_color": "#F6E05E",
            "status_label": "In Closet",
            "closet_url": "/inventory",
            "outfits": [
              {"label": "Linen Sundress", "subtext": "Island-bound attire", "price": 110, "icon_name": "Sun", "icon_color": "#F6E05E", "background_color": "#FFFFF0", "is_ai_pick": True},
              {"label": "Woven Sun Hat", "subtext": "Beach day essential", "price": 45, "icon_name": "Camera", "icon_color": "#78350F", "background_color": "#FFF7ED", "is_ai_pick": False},
              {"label": "Espadrilles", "subtext": "Comfortable summer flats", "price": 85, "icon_name": "Map", "icon_color": "#F6E05E", "background_color": "#FFFFF0", "is_ai_pick": False},
              {"label": "Bamboo Handbag", "subtext": "Natural fiber clutch", "price": 65, "icon_name": "Coffee", "icon_color": "#78350F", "background_color": "#FFF7ED", "is_ai_pick": False},
            ],
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


def main():
    parser = argparse.ArgumentParser(
        description="Seed database with demo accounts and sample inventory",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python seed_database.py                    # Use default sample_products.csv
    python seed_database.py --dataset adidas   # Use output/adidas_products.csv
    python seed_database.py --dataset myntra   # Use output/myntra_products.csv
    python seed_database.py --dataset farfetch # Use output/farfetch_products.csv
    python seed_database.py --dataset all      # Use all CSVs from output folder
    python seed_database.py --limit 500        # Limit products imported

Note: Run import_dataset.py first to generate CSV files in the output folder.
        """
    )
    parser.add_argument(
        "--dataset", "-d",
        choices=["adidas", "myntra", "farfetch", "all"],
        help="Dataset to use for products (default: sample_products.csv)"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        help="Limit number of products to import per dataset"
    )
    parser.add_argument(
        "--skip-products",
        action="store_true",
        help="Skip seeding products"
    )
    parser.add_argument(
        "--skip-journeys",
        action="store_true",
        help="Skip seeding journeys"
    )

    args = parser.parse_args()

    print("Initializing database...")
    init_db()
    print("✅ Database initialized")

    print("\nSeeding demo merchant...")
    seed_demo_merchant()

    print("\nSeeding demo consumer...")
    seed_demo_consumer()

    if not args.skip_products:
        print("\nSeeding sample products...")
        seed_sample_products(dataset=args.dataset, limit=args.limit)
    else:
        print("\nSkipping product seeding (--skip-products)")

    if not args.skip_journeys:
        print("\nSeeding journeys...")
        seed_journeys()
    else:
        print("\nSkipping journey seeding (--skip-journeys)")

    print("\n🎉 Database seeding complete!")


if __name__ == "__main__":
    main()