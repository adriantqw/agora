import base64
import asyncio
import aiohttp
import requests
from pathlib import Path

from app.database import SessionLocal
from app.models.product import Product
from app.models.catalogue import CatalogueItem

# Cache directory for product images
CACHE_DIR = Path("data/cache/product_images")


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


# ─────────────────────────────────────────────────────────────────
# Async Image Loading with Caching
# ─────────────────────────────────────────────────────────────────

def get_cached_image_path(product_id: str) -> Path:
    """Get cache path for a product image."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    # Sanitize product_id for filesystem
    safe_id = product_id.replace("/", "_").replace(":", "_")
    return CACHE_DIR / f"{safe_id}.jpg"


def get_cached_image(product_id: str) -> str | None:
    """Get base64 image from cache if exists."""
    cache_path = get_cached_image_path(product_id)
    if cache_path.exists():
        with open(cache_path, "rb") as f:
            return base64.b64encode(f.read()).decode('utf-8')
    return None


def save_to_cache(product_id: str, image_data: bytes) -> None:
    """Save image data to cache."""
    cache_path = get_cached_image_path(product_id)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    with open(cache_path, "wb") as f:
        f.write(image_data)


async def fetch_image_async(
    session: aiohttp.ClientSession,
    product_id: str,
    image_url: str
) -> tuple[str, str | None]:
    """Fetch single image asynchronously, with cache check."""
    # Check cache first
    cached = get_cached_image(product_id)
    if cached:
        return (product_id, cached)

    # Check if it's a local file
    path = Path(image_url)
    if path.exists():
        with open(path, "rb") as f:
            image_data = f.read()
        save_to_cache(product_id, image_data)
        return (product_id, base64.b64encode(image_data).decode('utf-8'))

    # Fetch from URL
    try:
        async with session.get(image_url, timeout=aiohttp.ClientTimeout(total=20)) as response:
            if response.status == 200:
                image_data = await response.read()
                save_to_cache(product_id, image_data)
                return (product_id, base64.b64encode(image_data).decode('utf-8'))
    except Exception:
        pass
    return (product_id, None)


async def load_product_images_batch_async(product_details: dict[str, dict]) -> dict[str, str]:
    """
    Load and encode images for multiple products asynchronously with caching.

    Args:
        product_details: Dict mapping product_id -> product details

    Returns:
        Dict mapping product_id -> base64 encoded image (only for successful loads)
    """
    tasks = []
    async with aiohttp.ClientSession() as session:
        for product_id, details in product_details.items():
            if "error" in details:
                continue
            image_url = details.get("image_url")
            if image_url:
                tasks.append(fetch_image_async(session, product_id, image_url))

        if not tasks:
            return {}

        results = await asyncio.gather(*tasks)

    return {pid: img for pid, img in results if img is not None}
