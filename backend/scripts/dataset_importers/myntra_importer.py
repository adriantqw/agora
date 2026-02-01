"""Myntra dataset importer with streaming support for large files."""

import csv
import random
from typing import Iterator, Optional, Dict, Any

from .base import BaseImporter, ProductRecord
from .utils import (
    infer_category_from_name,
    generate_tags_from_name,
    safe_float,
)


# INR to USD conversion rate (approximate)
INR_TO_USD = 0.012


class MyntraImporter(BaseImporter):
    """Importer for Myntra dataset (large CSV format with streaming)."""

    DEFAULT_LIMIT = 1000  # Default limit for large dataset

    def __init__(
        self,
        source_path: str,
        output_path: str,
        limit: Optional[int] = None,
        sample_rate: float = 1.0,
    ):
        # Use default limit if not specified
        effective_limit = limit if limit is not None else self.DEFAULT_LIMIT
        super().__init__(source_path, output_path, effective_limit)
        self.sample_rate = sample_rate

    def iterate_source(self) -> Iterator[Dict[str, Any]]:
        """Stream CSV with optional random sampling."""
        with open(self.source_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Random sampling for large dataset
                if self.sample_rate < 1.0 and random.random() > self.sample_rate:
                    continue
                yield row

    def _extract_first_image(self, img_field: str) -> str:
        """Extract first image URL from Myntra's image field.

        Myntra images can be delimited by semicolons or newlines.
        """
        if not img_field:
            return ""

        # Try semicolon first
        if ";" in img_field:
            parts = img_field.split(";")
        else:
            parts = img_field.split("\n")

        first_image = parts[0].strip() if parts else ""

        # Clean up the URL
        first_image = first_image.strip().strip('"').strip("'")

        return first_image

    def transform_record(self, raw: Dict[str, Any]) -> Optional[ProductRecord]:
        """Transform Myntra record to standard format."""
        name = raw.get("name", "").strip()
        if not name:
            return None

        # Convert INR price to USD
        price_inr = safe_float(raw.get("price"), 0.0)
        if price_inr <= 0:
            return None
        price_usd = price_inr * INR_TO_USD

        # Extract first image
        image_url = self._extract_first_image(raw.get("img", ""))

        # Infer category from product name
        category = infer_category_from_name(name)

        # Generate SKU
        sku = self.generate_sku(category)

        # Generate tags from name and seller
        seller = raw.get("seller", "").strip()
        tags = generate_tags_from_name(name, seller)

        # Generate description from name and seller (Myntra has no description field)
        description = f"{name}."
        if seller:
            description += f" From {seller}."

        # Random quantity for variety
        quantity = random.randint(10, 100)

        return ProductRecord(
            name=name,
            sku=sku,
            price=round(price_usd, 2),
            quantity=quantity,
            tags=",".join(tags),
            image=image_url,
            description=description,
        )
