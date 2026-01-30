#!/usr/bin/env python3
"""
Dataset Import CLI - Transform external product datasets into sample_products.csv format.

Usage:
    python import_dataset.py --source adidas --output ./output/adidas_products.csv
    python import_dataset.py --source myntra --limit 1000
    python import_dataset.py --source farfetch
    python import_dataset.py --all --output-dir ./output/
"""

import argparse
import logging
import sys
from pathlib import Path

from scripts.dataset_importers.adidas_importer import AdidasImporter
from scripts.dataset_importers.myntra_importer import MyntraImporter
from scripts.dataset_importers.farfetch_importer import FarfetchImporter

# Default paths
DATA_DIR = Path("data")
DEFAULT_OUTPUT_DIR = Path("scripts") / "output"

DATASET_CONFIGS = {
    "adidas": {
        "source": DATA_DIR / "adidas_dataset" / "adidas_usa.csv",
        "importer": AdidasImporter,
        "output_name": "adidas_products.csv",
    },
    "myntra": {
        "source": DATA_DIR / "myntra_dataset" / "myntra202305041052.csv",
        "importer": MyntraImporter,
        "output_name": "myntra_products.csv",
    },
    "farfetch": {
        "source": DATA_DIR / "farfetch_dataset" / "farfetch_fashion_dataset_images_crawlfeeds.json",
        "importer": FarfetchImporter,
        "output_name": "farfetch_products.csv",
    },
}


def setup_logging(verbose: bool):
    """Configure logging based on verbosity."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def run_import(
    source: str,
    output: str,
    limit: int = None,
    sample_rate: float = 1.0,
):
    """Run import for a single dataset."""
    config = DATASET_CONFIGS.get(source)
    if not config:
        raise ValueError(f"Unknown source: {source}")

    source_path = str(config["source"])

    # Verify source file exists
    if not Path(source_path).exists():
        raise FileNotFoundError(f"Source file not found: {source_path}")

    # Create importer with appropriate options
    if source == "myntra":
        importer = config["importer"](source_path, output, limit, sample_rate)
    else:
        importer = config["importer"](source_path, output, limit)

    logging.info(f"Importing {source} from {source_path}")
    logging.info(f"Output: {output}")
    if limit:
        logging.info(f"Limit: {limit} records")

    stats = importer.run()
    logging.info(f"Completed: processed={stats['processed']}, written={stats['written']}, errors={stats['errors']}")

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Import external product datasets into sample_products.csv format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python import_dataset.py --source adidas
    python import_dataset.py --source myntra --limit 5000
    python import_dataset.py --source farfetch -v
    python import_dataset.py --all --output-dir ./output/
        """,
    )
    parser.add_argument(
        "--source",
        "-s",
        choices=["adidas", "myntra", "farfetch"],
        help="Dataset source to import",
    )
    parser.add_argument(
        "--all",
        "-a",
        action="store_true",
        help="Import all datasets",
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Output file path (for single source)",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Output directory (for --all mode)",
    )
    parser.add_argument(
        "--limit",
        "-l",
        type=int,
        help="Limit number of records to process",
    )
    parser.add_argument(
        "--sample-rate",
        type=float,
        default=1.0,
        help="Random sampling rate for large datasets (0.0-1.0)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()
    setup_logging(args.verbose)

    # Ensure output directory exists
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.all:
        # Import all datasets
        total_stats = {"processed": 0, "written": 0, "errors": 0}

        for source, config in DATASET_CONFIGS.items():
            output_path = output_dir / config["output_name"]
            try:
                stats = run_import(
                    source=source,
                    output=str(output_path),
                    limit=args.limit,
                    sample_rate=args.sample_rate,
                )
                total_stats["processed"] += stats["processed"]
                total_stats["written"] += stats["written"]
                total_stats["errors"] += stats["errors"]
            except FileNotFoundError as e:
                logging.warning(f"Skipping {source}: {e}")
            except Exception as e:
                logging.error(f"Failed to import {source}: {e}")

        logging.info(f"All imports complete: {total_stats}")

    elif args.source:
        # Import single dataset
        if args.output:
            output_path = args.output
        else:
            output_path = str(output_dir / DATASET_CONFIGS[args.source]["output_name"])

        try:
            run_import(
                source=args.source,
                output=output_path,
                limit=args.limit,
                sample_rate=args.sample_rate,
            )
        except FileNotFoundError as e:
            logging.error(f"Error: {e}")
            sys.exit(1)
        except Exception as e:
            logging.error(f"Import failed: {e}")
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
