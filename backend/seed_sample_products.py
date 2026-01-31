"""Seed sample products for testing."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.product import Product
from app.models.merchant import Merchant
import uuid


def seed_sample_products():
    db = SessionLocal()
    try:
        # Get demo merchant
        merchant = db.query(Merchant).filter(Merchant.email == "demo@merchant.com").first()
        if not merchant:
            print("❌ Demo merchant not found. Run seed_demo_users.py first.")
            return

        # Check if products already exist
        existing_count = db.query(Product).count()
        if existing_count > 0:
            print(f"ℹ️  {existing_count} products already exist")
            return

        # Sample products
        products = [
            {
                "name": "Classic White T-Shirt",
                "sku": "TSH-WHT-001",
                "price": 29.99,
                "quantity": 100,
                "tags": ["casual", "basic", "cotton"],
                "description": "Essential wardrobe staple made from 100% organic cotton"
            },
            {
                "name": "Slim Fit Denim Jeans",
                "sku": "JNS-DNM-002",
                "price": 79.99,
                "quantity": 50,
                "tags": ["denim", "casual", "pants"],
                "description": "Classic slim fit jeans in dark wash denim"
            },
            {
                "name": "Leather Crossbody Bag",
                "sku": "BAG-LTH-003",
                "price": 149.99,
                "quantity": 25,
                "tags": ["accessories", "leather", "bag"],
                "description": "Handcrafted genuine leather crossbody bag"
            },
            {
                "name": "Wool Blend Sweater",
                "sku": "SWT-WOL-004",
                "price": 89.99,
                "quantity": 40,
                "tags": ["knitwear", "winter", "wool"],
                "description": "Cozy wool blend crew neck sweater"
            },
            {
                "name": "Canvas Sneakers",
                "sku": "SHO-CNV-005",
                "price": 59.99,
                "quantity": 75,
                "tags": ["shoes", "casual", "canvas"],
                "description": "Classic low-top canvas sneakers"
            },
            {
                "name": "Silk Scarf",
                "sku": "ACC-SLK-006",
                "price": 45.00,
                "quantity": 30,
                "tags": ["accessories", "silk", "scarf"],
                "description": "Luxurious 100% silk square scarf with floral print"
            },
            {
                "name": "Denim Jacket",
                "sku": "JKT-DNM-007",
                "price": 119.99,
                "quantity": 20,
                "tags": ["outerwear", "denim", "jacket"],
                "description": "Vintage-inspired denim trucker jacket"
            },
            {
                "name": "Leather Belt",
                "sku": "BLT-LTH-008",
                "price": 39.99,
                "quantity": 60,
                "tags": ["accessories", "leather", "belt"],
                "description": "Full-grain leather belt with classic buckle"
            }
        ]

        for product_data in products:
            product = Product(
                id=str(uuid.uuid4()),
                merchant_id=merchant.id,
                **product_data
            )
            db.add(product)

        db.commit()
        print(f"✅ Created {len(products)} sample products")
        print("\n🎉 Sample products ready!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_products()
