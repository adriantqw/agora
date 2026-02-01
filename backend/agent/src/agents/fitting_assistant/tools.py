"""Tools for the Fitting Assistant Agent."""
from langchain_core.tools import tool

from app.database import SessionLocal
from app.models.product import Product
from app.models.catalogue import CatalogueItem


@tool
def get_product_details(product_id: str) -> dict:
    """
    Fetch product details including image URL by ID.
    Use this when you need product information not provided in context.

    Args:
        product_id: Product or catalogue item ID (may be prefixed with 'product_' or 'catalogue_')

    Returns:
        dict with id, name, description, image_url, and other metadata
    """
    db = SessionLocal()
    try:
        # Try catalogue item first (prefixed IDs)
        if product_id.startswith("catalogue_"):
            actual_id = product_id.replace("catalogue_", "")
            item = db.query(CatalogueItem).filter(CatalogueItem.id == actual_id).first()
            if item:
                return {
                    "id": f"catalogue_{item.id}",
                    "name": item.name,
                    "description": item.description,
                    "image_url": item.image_url,
                    "colours": item.colours,
                    "sizes": item.sizes
                }

        # Try product (with or without prefix)
        if product_id.startswith("product_"):
            actual_id = product_id.replace("product_", "")
        else:
            actual_id = product_id

        product = db.query(Product).filter(Product.id == actual_id).first()
        if product:
            return {
                "id": f"product_{product.id}",
                "name": product.name,
                "description": product.description,
                "image_url": product.image,
                "price": product.price,
                "tags": product.tags
            }

        # If no prefix matched, also try catalogue item without prefix
        item = db.query(CatalogueItem).filter(CatalogueItem.id == product_id).first()
        if item:
            return {
                "id": f"catalogue_{item.id}",
                "name": item.name,
                "description": item.description,
                "image_url": item.image_url,
                "colours": item.colours,
                "sizes": item.sizes
            }

        return {"error": f"Product {product_id} not found"}
    finally:
        db.close()