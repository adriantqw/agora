"""Update products with brand names and better product names."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.product import Product


def update_products():
    db = SessionLocal()
    try:
        # Updated product data with brands as first tag
        updates = {
            "TSH-WHT-001": {
                "name": "Essential Crew Neck Tee",
                "tags": ["Everlane", "basics", "cotton", "casual"]
            },
            "JNS-DNM-002": {
                "name": "High-Rise Skinny Jeans",
                "tags": ["Levi's", "denim", "pants", "casual"]
            },
            "BAG-LTH-003": {
                "name": "Mini Crossbody Bag",
                "tags": ["Cuyana", "leather", "accessories", "bag"]
            },
            "SWT-WOL-004": {
                "name": "Cashmere Crew Sweater",
                "tags": ["Everlane", "knitwear", "wool", "winter"]
            },
            "SHO-CNV-005": {
                "name": "Classic Canvas Sneakers",
                "tags": ["Veja", "shoes", "sneakers", "casual"]
            },
            "ACC-SLK-006": {
                "name": "Silk Square Scarf",
                "tags": ["Hermès", "silk", "accessories", "scarf"]
            },
            "JKT-DNM-007": {
                "name": "Vintage Denim Jacket",
                "tags": ["Levi's", "outerwear", "denim", "jacket"]
            },
            "BLT-LTH-008": {
                "name": "Italian Leather Belt",
                "tags": ["Gucci", "leather", "accessories", "belt"]
            }
        }

        updated_count = 0
        for sku, data in updates.items():
            product = db.query(Product).filter(Product.sku == sku).first()
            if product:
                product.name = data["name"]
                product.tags = data["tags"]
                updated_count += 1
                print(f"✅ Updated {sku}: {data['name']} by {data['tags'][0]}")

        db.commit()
        print(f"\n🎉 Updated {updated_count} products with brand names!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    update_products()
