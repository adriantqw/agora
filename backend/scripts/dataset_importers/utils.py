"""Utility functions for dataset importers."""

import re
from typing import List, Optional
from html.parser import HTMLParser


class HTMLStripper(HTMLParser):
    """Simple HTML tag stripper."""

    def __init__(self):
        super().__init__()
        self.reset()
        self.fed: List[str] = []

    def handle_data(self, data: str):
        self.fed.append(data)

    def get_data(self) -> str:
        return " ".join(self.fed)


def clean_html(text: str) -> str:
    """Remove HTML tags and clean up whitespace."""
    if not text:
        return ""

    stripper = HTMLStripper()
    try:
        stripper.feed(text)
        cleaned = stripper.get_data()
    except Exception:
        # Fallback: simple regex-based cleaning
        cleaned = re.sub(r"<[^>]+>", " ", text)

    # Normalize whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Truncate to reasonable length
    if len(cleaned) > 2000:
        cleaned = cleaned[:1997] + "..."

    return cleaned


def clean_description(text: str) -> str:
    """Clean product description - remove HTML and normalize."""
    return clean_html(text)


def extract_first_image(images_str: str, delimiter: str = "~") -> str:
    """Extract the first image URL from a delimited string."""
    if not images_str:
        return ""

    images = images_str.split(delimiter)
    first_image = images[0].strip() if images else ""

    # Clean up any whitespace or newlines
    first_image = first_image.strip().split("\n")[0].strip()

    return first_image


def generate_tags_from_attributes(
    category: Optional[str] = None,
    color: Optional[str] = None,
    brand: Optional[str] = None,
    gender: Optional[str] = None,
    breadcrumbs: Optional[str] = None,
    extra_tags: Optional[List[str]] = None,
) -> List[str]:
    """Generate product tags from various attributes."""
    tags = set()

    if category:
        # Clean and add category
        cat_clean = category.lower().strip()
        if cat_clean and cat_clean not in ("", "all", "none"):
            tags.add(cat_clean)

    if color:
        color_clean = color.lower().strip()
        if color_clean:
            tags.add(color_clean)

    if brand:
        brand_clean = brand.lower().strip()
        if brand_clean and brand_clean != "unknown":
            tags.add(brand_clean)

    if gender and gender.lower().strip() in ("men", "women", "kids", "unisex", "boys", "girls"):
        tags.add(gender.lower().strip())

    # Extract additional tags from breadcrumbs
    if breadcrumbs:
        # Handle various breadcrumb formats
        for sep in [",", "/", ">"]:
            if sep in breadcrumbs:
                parts = breadcrumbs.split(sep)
                for part in parts:
                    part = part.strip().lower()
                    if part and part not in ("", "all", "home"):
                        # Skip if it's the brand we already added
                        if brand and part == brand.lower():
                            continue
                        tags.add(part)
                break

    if extra_tags:
        for tag in extra_tags:
            if tag:
                tags.add(tag.lower().strip())

    # Remove empty tags
    tags.discard("")

    # Sort and limit to 10 tags
    return sorted(list(tags))[:10]


def infer_category_from_name(name: str) -> str:
    """Infer product category from product name."""
    name_lower = name.lower()

    # Footwear keywords
    footwear_keywords = [
        "shoe", "shoes", "sneaker", "sneakers", "sandal", "sandals",
        "boot", "boots", "loafer", "loafers", "heel", "heels",
        "slipper", "slippers", "flip", "flop", "flats", "mule", "mules",
        "oxford", "oxfords", "trainer", "trainers", "footwear"
    ]
    if any(kw in name_lower for kw in footwear_keywords):
        return "Shoes"

    # Accessories keywords
    accessories_keywords = [
        "bag", "bags", "handbag", "purse", "clutch", "tote",
        "watch", "watches", "belt", "belts", "wallet", "wallets",
        "sunglasses", "glasses", "eyewear",
        "ring", "rings", "necklace", "necklaces", "earring", "earrings",
        "bracelet", "bracelets", "jewelry", "jewellery",
        "scarf", "scarves", "hat", "hats", "cap", "caps",
        "tie", "ties", "bow tie", "cufflinks"
    ]
    if any(kw in name_lower for kw in accessories_keywords):
        return "Accessories"

    # Default to Clothing
    return "Clothing"


def generate_tags_from_name(name: str, seller: Optional[str] = None) -> List[str]:
    """Generate tags by parsing product name (primarily for Myntra)."""
    tags = set()
    name_lower = name.lower()

    # Gender detection
    if "men" in name_lower and "women" not in name_lower:
        tags.add("men")
    elif "women" in name_lower:
        tags.add("women")
    elif any(kw in name_lower for kw in ["kid", "kids", "boy", "boys", "girl", "girls", "children"]):
        tags.add("kids")

    # Material detection
    materials = [
        "cotton", "polyester", "silk", "wool", "linen", "denim",
        "leather", "suede", "velvet", "satin", "cashmere", "nylon",
        "rayon", "chiffon", "fleece", "corduroy"
    ]
    for material in materials:
        if material in name_lower:
            tags.add(material)

    # Style detection
    styles = [
        "casual", "formal", "ethnic", "sport", "sports", "sporty",
        "printed", "solid", "striped", "floral", "checked", "embroidered",
        "slim", "regular", "oversized", "fitted"
    ]
    for style in styles:
        if style in name_lower:
            tags.add(style)

    # Category
    category = infer_category_from_name(name)
    tags.add(category.lower())

    # Add seller as brand tag
    if seller:
        seller_clean = seller.strip()
        if seller_clean and len(seller_clean) < 50:  # Avoid very long seller names
            tags.add(seller_clean.lower())

    return sorted(list(tags))[:10]


def safe_float(value: any, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    if value is None:
        return default
    try:
        # Handle string values with commas
        if isinstance(value, str):
            value = value.replace(",", "").strip()
        return float(value)
    except (ValueError, TypeError):
        return default


def safe_int(value: any, default: int = 0) -> int:
    """Safely convert a value to int."""
    if value is None:
        return default
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return default
