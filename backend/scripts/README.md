# Dataset Import Scripts

Scripts to transform external product datasets (Adidas, Myntra, Farfetch) into the `sample_products.csv` format.

- [Myntra](https://www.kaggle.com/datasets/ronakbokaria/myntra-products-dataset)
- [adidas](https://www.kaggle.com/datasets/thedevastator/adidas-fashion-retail-products-dataset-9300-prod)
- [farfetch](https://www.kaggle.com/datasets/crawlfeeds/images-extracted-from-fashion-website)

## Target Schema

| Column | Type | Example |
|--------|------|---------|
| name | string | "Cotton T-Shirt - Navy Blue" |
| sku | string | "APP-001", "SHOE-001", "ACC-001" |
| price | float | 19.99 (USD) |
| quantity | int | 200 |
| tags | string | "clothing,cotton,casual" |
| image | string | URL to product image (first URL from source) |
| description | string | Product description text |

## Source Datasets

| Dataset | Location | Format | Records | Currency |
|---------|----------|--------|---------|----------|
| Adidas | `backend/data/adidas_dataset/adidas_usa.csv` | CSV | ~9,500 | USD |
| Myntra | `backend/data/myntra_dataset/myntra202305041052.csv` | CSV | ~6.2M | INR |
| Farfetch | `backend/data/farfetch_dataset/farfetch_fashion_dataset_images_crawlfeeds.json` | JSON | 141 | USD |

## Usage

```bash
# Import single dataset
uv run python -m scripts.import_dataset --source adidas
uv run python -m scripts.import_dataset --source farfetch
uv run python -m scripts.import_dataset --source myntra --limit 1000

# Import all datasets
uv run python -m scripts.import_dataset --all --limit 50

# With options
uv run python -m scripts.import_dataset --source adidas --output ./my_products.csv --limit 500 --verbose
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--source`, `-s` | Dataset to import: adidas, myntra, farfetch | Required (unless --all) |
| `--all`, `-a` | Import all datasets | False |
| `--output`, `-o` | Output file path | `./output/{source}_products.csv` |
| `--output-dir` | Output directory (for --all mode) | `./output/` |
| `--limit`, `-l` | Max records to process | None (all) |
| `--sample-rate` | Random sampling rate 0.0-1.0 (for large datasets) | 1.0 |
| `--verbose`, `-v` | Enable debug logging | False |

## Field Mappings

### Adidas
- `name` → name
- `selling_price` → price (USD)
- `category` → SKU prefix + tags
- `images` (split by `~`) → image (1st URL)
- `description` → description
- `color`, `brand`, `breadcrumbs` → tags
- quantity: default 50

### Myntra
- `name` → name
- `price` × 0.012 → price (INR to USD)
- `img` (split by `;`) → image (1st URL)
- `seller` → tags (as brand)
- name parsing → category, tags
- description: generated from name + seller
- quantity: random 10-100
- Default limit: 1,000 products

### Farfetch
- `brand` + `title` → name
- `price` → price (USD)
- `images` (split by `, `) → image (1st URL)
- `description` → description (HTML stripped)
- `breadcrumbs` → category, gender, tags
- quantity: default 25

## SKU Prefixes

| Category | Prefix |
|----------|--------|
| Shoes/Footwear | SHOE-XXXXX |
| Clothing/Apparel | APP-XXXXX |
| Accessories/Bags | ACC-XXXXX |
| Other | PROD-XXXXX |

## Output

Generated CSV files are written to `./output/` directory:
- `adidas_products.csv`
- `myntra_products.csv`
- `farfetch_products.csv`

## Seeding the Database

The `seed_database.py` script can now use these datasets directly:

```bash
# Use default sample_products.csv
uv run python scripts/seed_database.py

# Use a specific dataset
uv run python scripts/seed_database.py --dataset adidas
uv run python scripts/seed_database.py --dataset myntra      # Default 1000 products
uv run python scripts/seed_database.py --dataset farfetch

# Use all datasets combined
uv run python scripts/seed_database.py --dataset all

# Limit products per dataset
uv run python scripts/seed_database.py --dataset adidas --limit 500

# Skip products or journeys
uv run python scripts/seed_database.py --skip-products
uv run python scripts/seed_database.py --skip-journeys
```

### Seed Database Options

| Option | Description |
|--------|-------------|
| `--dataset`, `-d` | Dataset: adidas, myntra, farfetch, all |
| `--limit`, `-l` | Max products per dataset |
| `--skip-products` | Skip seeding products |
| `--skip-journeys` | Skip seeding journeys |
