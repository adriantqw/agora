"""Farfetch dataset importer for JSON format."""

import json
from typing import Iterator, Optional, Dict, Any

from .base import BaseImporter, ProductRecord
from .utils import (
    clean_html,
    generate_tags_from_attributes,
    safe_float,
)


class FarfetchImporter(BaseImporter):
    """Importer for Farfetch JSON dataset."""

    DEFAULT_QUANTITY = 25  # Luxury items - lower inventory

    def iterate_source(self) -> Iterator[Dict[str, Any]]:
        """Read from Farfetch JSON file."""
        with open(self.source_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                yield item

    def _extract_first_image(self, images_str: str) -> str:
        """Extract first image URL from comma-delimited string."""
        if not images_str:
            return ""

        # Farfetch uses ", " as delimiter
        images = images_str.split(", ")
        first_image = images[0].strip() if images else ""

        return first_image

    def _extract_category_from_breadcrumbs(self, breadcrumbs: str) -> tuple[str, str]:
        """Extract category and gender from breadcrumbs.

        Breadcrumbs format: "Women, PUCCI, Accessories"
        Returns: (category, gender)
        """
        if not breadcrumbs:
            return "Accessories", ""

        parts = [p.strip() for p in breadcrumbs.split(",")]

        # First part is usually gender
        gender = ""
        if parts and parts[0].lower() in ("men", "women", "kids", "unisex"):
            gender = parts[0]

        # Last part is usually category
        category = parts[-1] if len(parts) > 0 else "Accessories"

        # Map to standard categories
        category_lower = category.lower()
        if any(kw in category_lower for kw in ["shoe", "footwear", "sneaker", "boot"]):
            category = "Shoes"
        elif any(kw in category_lower for kw in ["bag", "accessori", "scarf", "belt", "jewelry", "watch"]):
            category = "Accessories"
        elif any(kw in category_lower for kw in ["cloth", "dress", "shirt", "pant", "jacket", "sweater"]):
            category = "Clothing"

        return category, gender

    def transform_record(self, raw: Dict[str, Any]) -> Optional[ProductRecord]:
        """Transform Farfetch record to standard format."""
        title = raw.get("title", "").strip()
        if not title:
            return None

        # Get price (already in USD)
        price = safe_float(raw.get("price"), 0.0)
        if price <= 0:
            return None

        # Extract first image from comma-delimited CDN URLs
        image_url = self._extract_first_image(raw.get("images", ""))

        # Extract category and gender from breadcrumbs
        breadcrumbs = raw.get("breadcrumbs", "")
        category, gender = self._extract_category_from_breadcrumbs(breadcrumbs)

        # Generate SKU
        sku = self.generate_sku(category)

        # Get brand
        brand = raw.get("brand", "").strip()

        # Generate tags
        tags = generate_tags_from_attributes(
            category=category,
            brand=brand,
            gender=gender,
            breadcrumbs=breadcrumbs,
        )

        # Clean HTML from description
        description = clean_html(raw.get("description", ""))
        if not description:
            description = f"{brand} {title}." if brand else f"{title}."

        # Prepend brand to name if not already present
        if brand and brand.lower() not in title.lower():
            full_name = f"{brand} {title}"
        else:
            full_name = title

        return ProductRecord(
            name=full_name,
            sku=sku,
            price=round(price, 2),
            quantity=self.DEFAULT_QUANTITY,
            tags=",".join(tags),
            image=image_url,
            description=description,
        )
