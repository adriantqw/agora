import base64
import requests
from pathlib import Path

from app.database import SessionLocal
from app.models.product import Product
from app.models.catalogue import CatalogueItem


def fetch_product_details_batch(product_ids: list[str]) -> dict[str, dict]:
    """
    Fetch details for multiple products in a single DB session.

    Args:
        product_ids: List of product or catalogue item IDs

    Returns:
        dict mapping product_id -> product details
    """
    db = SessionLocal()
    results = {}
    try:
        for product_id in product_ids:
            # Try catalogue item first (prefixed IDs)
            if product_id.startswith("catalogue_"):
                actual_id = product_id.replace("catalogue_", "")
                item = db.query(CatalogueItem).filter(CatalogueItem.id == actual_id).first()
                if item:
                    results[product_id] = {
                        "id": f"catalogue_{item.id}",
                        "name": item.name,
                        "description": item.description,
                        "image_url": item.image_url,
                        "colours": item.colours,
                        "sizes": item.sizes
                    }
                    continue

            # Try product (with or without prefix)
            if product_id.startswith("product_"):
                actual_id = product_id.replace("product_", "")
            else:
                actual_id = product_id

            product = db.query(Product).filter(Product.id == actual_id).first()
            if product:
                results[product_id] = {
                    "id": f"product_{product.id}",
                    "name": product.name,
                    "description": product.description,
                    "image_url": product.image,
                    "price": product.price,
                    "tags": product.tags
                }
                continue

            # If no prefix matched, also try catalogue item without prefix
            item = db.query(CatalogueItem).filter(CatalogueItem.id == product_id).first()
            if item:
                results[product_id] = {
                    "id": f"catalogue_{item.id}",
                    "name": item.name,
                    "description": item.description,
                    "image_url": item.image_url,
                    "colours": item.colours,
                    "sizes": item.sizes
                }
                continue

            # Product not found
            results[product_id] = {"error": f"Product {product_id} not found"}

        return results
    finally:
        db.close()


def load_and_encode_image(image_url: str) -> str | None:
    """
    Load an image from URL or file path and encode as base64.

    Args:
        image_url: Image URL or local file path

    Returns:
        Base64 encoded image string, or None if failed
    """
    try:
        path = Path(image_url)
        if path.exists():
            with open(path, "rb") as f:
                image_data = f.read()
        else:
            response = requests.get(image_url, timeout=20)
            response.raise_for_status()
            image_data = response.content

        return base64.b64encode(image_data).decode('utf-8')
    except Exception:
        return None


def load_product_images_batch(product_details: dict[str, dict]) -> dict[str, str]:
    """
    Load and encode images for multiple products.

    Args:
        product_details: Dict mapping product_id -> product details (from fetch_product_details_batch)

    Returns:
        Dict mapping product_id -> base64 encoded image (only for successful loads)
    """
    images = {}
    for product_id, details in product_details.items():
        if "error" in details:
            continue
        image_url = details.get("image_url")
        if image_url:
            encoded = load_and_encode_image(image_url)
            if encoded:
                images[product_id] = encoded
    return images
