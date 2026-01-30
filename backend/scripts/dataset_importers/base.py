"""Base importer class for dataset transformations."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, Optional, Dict, Any
import csv
import logging


@dataclass
class ProductRecord:
    """Standardized product record matching sample_products.csv schema."""
    name: str
    sku: str
    price: float
    quantity: int
    tags: str  # Comma-separated
    image: str
    description: str


class BaseImporter(ABC):
    """Abstract base class for dataset importers."""

    SKU_PREFIXES = {
        "shoes": "SHOE",
        "footwear": "SHOE",
        "sneakers": "SHOE",
        "boots": "SHOE",
        "sandals": "SHOE",
        "clothing": "APP",
        "apparel": "APP",
        "accessories": "ACC",
        "bags": "ACC",
        "jewelry": "ACC",
        "watches": "ACC",
        "belts": "ACC",
        "scarves": "ACC",
        "hats": "ACC",
    }

    def __init__(
        self,
        source_path: str,
        output_path: str,
        limit: Optional[int] = None,
    ):
        self.source_path = source_path
        self.output_path = output_path
        self.limit = limit
        self.logger = logging.getLogger(self.__class__.__name__)
        self._sku_counters: Dict[str, int] = {}

    @abstractmethod
    def iterate_source(self) -> Iterator[Dict[str, Any]]:
        """Yield raw records from the source dataset."""
        pass

    @abstractmethod
    def transform_record(self, raw: Dict[str, Any]) -> Optional[ProductRecord]:
        """Transform a raw record into a ProductRecord."""
        pass

    def get_sku_prefix(self, category: str) -> str:
        """Get SKU prefix based on category."""
        category_lower = category.lower().strip()

        for keyword, prefix in self.SKU_PREFIXES.items():
            if keyword in category_lower:
                return prefix

        return "PROD"

    def generate_sku(self, category: str) -> str:
        """Generate unique SKU with appropriate prefix based on category."""
        prefix = self.get_sku_prefix(category)

        if prefix not in self._sku_counters:
            self._sku_counters[prefix] = 0
        self._sku_counters[prefix] += 1

        return f"{prefix}-{self._sku_counters[prefix]:05d}"

    def run(self) -> Dict[str, int]:
        """Execute the import and return statistics."""
        stats = {"processed": 0, "written": 0, "errors": 0}

        with open(self.output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(
                ["name", "sku", "price", "quantity", "tags", "image", "description"]
            )

            for raw in self.iterate_source():
                if self.limit and stats["processed"] >= self.limit:
                    break

                stats["processed"] += 1

                try:
                    record = self.transform_record(raw)
                    if record:
                        writer.writerow(
                            [
                                record.name,
                                record.sku,
                                record.price,
                                record.quantity,
                                record.tags,
                                record.image,
                                record.description,
                            ]
                        )
                        stats["written"] += 1
                except Exception as e:
                    self.logger.warning(f"Error processing record {stats['processed']}: {e}")
                    stats["errors"] += 1

                if stats["processed"] % 1000 == 0:
                    self.logger.info(f"Processed {stats['processed']} records...")

        self.logger.info(
            f"Import complete: {stats['written']} written, {stats['errors']} errors"
        )
        return stats
