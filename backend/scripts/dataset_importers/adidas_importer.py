"""Adidas dataset importer."""

import csv
from typing import Iterator, Optional, Dict, Any

from .base import BaseImporter, ProductRecord
from .utils import (
    clean_description,
    extract_first_image,
    generate_tags_from_attributes,
    safe_float,
)


class AdidasImporter(BaseImporter):
    """Importer for Adidas USA dataset (CSV format)."""

    DEFAULT_QUANTITY = 50

    def iterate_source(self) -> Iterator[Dict[str, Any]]:
        """Read from Adidas CSV file."""
        with open(self.source_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield row

    def transform_record(self, raw: Dict[str, Any]) -> Optional[ProductRecord]:
        """Transform Adidas record to standard format."""
        name = raw.get("name", "").strip()
        if not name:
            return None

        # Get price (already in USD)
        price = safe_float(raw.get("selling_price"), 0.0)
        if price <= 0:
            return None

        # Extract first image from ~ delimited list
        image_url = extract_first_image(raw.get("images", ""), delimiter="~")

        # Get category for SKU generation
        category = raw.get("category", "Clothing")

        # Generate SKU
        sku = self.generate_sku(category)

        # Extract gender from breadcrumbs (e.g., "Women/Clothing" -> "Women")
        breadcrumbs = raw.get("breadcrumbs", "")
        gender = None
        if breadcrumbs:
            first_part = breadcrumbs.split("/")[0].strip()
            if first_part.lower() in ("men", "women", "kids", "boys", "girls", "unisex"):
                gender = first_part

        # Generate tags
        tags = generate_tags_from_attributes(
            category=category,
            color=raw.get("color"),
            brand=raw.get("brand"),
            gender=gender,
            breadcrumbs=breadcrumbs,
        )

        # Clean description
        description = clean_description(raw.get("description", ""))

        return ProductRecord(
            name=name,
            sku=sku,
            price=round(price, 2),
            quantity=self.DEFAULT_QUANTITY,
            tags=",".join(tags),
            image=image_url,
            description=description,
        )
