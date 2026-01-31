"""Seed wishlist items for demo consumer."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.consumer import Consumer
from app.models.product import Product
from app.models.wishlist import WishlistItem
import uuid


def seed_demo_wishlist():
    db = SessionLocal()
    try:
        # Get demo consumer
        consumer = db.query(Consumer).filter(Consumer.email == "demo@consumer.com").first()
        if not consumer:
            print("❌ Demo consumer not found. Run seed_demo_users.py first.")
            return

        # Get products to add to wishlist
        products = db.query(Product).limit(6).all()
        if not products:
            print("❌ No products found. Run seed_sample_products.py first.")
            return

        # Check if wishlist items already exist
        existing_count = db.query(WishlistItem).filter(
            WishlistItem.consumer_id == consumer.id
        ).count()
        if existing_count > 0:
            print(f"ℹ️  {existing_count} wishlist items already exist for demo consumer")
            return

        # Sample notes for wishlist items
        notes_list = [
            "Love this style!",
            "Perfect for summer",
            None,  # No notes
            "Need to check sizing",
            "Gift idea for friend",
            None
        ]

        # Create wishlist items
        created = 0
        for product, notes in zip(products, notes_list):
            wishlist_item = WishlistItem(
                id=str(uuid.uuid4()),
                consumer_id=consumer.id,
                product_id=product.id,
                notes=notes
            )
            db.add(wishlist_item)
            created += 1

        db.commit()
        print(f"✅ Created {created} wishlist items for demo consumer")
        print("\nWishlist items:")
        for item, product in zip(range(created), products[:created]):
            print(f"  - {products[product].name}")
        print("\n🎉 Demo wishlist ready!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_wishlist()
