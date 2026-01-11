from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, BulkImportResult
import uuid
import random


def get_products(
    db: Session,
    merchant_id: str,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    tags: Optional[List[str]] = None,
    sort_by: str = "name",
    sort_order: str = "asc"
) -> Tuple[List[Product], int]:
    """
    Get paginated products for a merchant.

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        page: Page number (1-indexed)
        limit: Items per page
        search: Search query for name or SKU
        tags: List of tags to filter by
        sort_by: Field to sort by
        sort_order: Sort direction (asc or desc)

    Returns:
        Tuple of (products list, total count)
    """
    query = db.query(Product).filter(Product.merchant_id == merchant_id)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.sku.ilike(search_pattern)
            )
        )

    # Tag filter - filter products that have any of the specified tags
    # Note: SQLite JSON support is limited, so we do a simple contains check
    if tags:
        # For SQLite, we need to check if the JSON array contains any of the tags
        # This is a simplified approach - for each tag, check if it appears in the JSON
        tag_filters = []
        for tag in tags:
            # Use LIKE to check if the tag appears in the JSON array
            tag_filters.append(Product.tags.cast(str).ilike(f'%"{tag}"%'))
        if tag_filters:
            query = query.filter(or_(*tag_filters))

    # Get total count before pagination
    total = query.count()

    # Sorting
    sort_field_map = {
        "name": Product.name,
        "sku": Product.sku,
        "price": Product.price,
        "quantity": Product.quantity,
        "created_at": Product.created_at,
        "createdAt": Product.created_at
    }
    sort_column = sort_field_map.get(sort_by, Product.name)

    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return products, total


def get_product_by_id(db: Session, merchant_id: str, product_id: str) -> Optional[Product]:
    """
    Get a single product by ID (merchant-scoped).

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        product_id: Product's unique identifier

    Returns:
        Product object if found, None otherwise
    """
    return db.query(Product).filter(
        Product.id == product_id,
        Product.merchant_id == merchant_id
    ).first()


def get_product_by_sku(db: Session, merchant_id: str, sku: str) -> Optional[Product]:
    """
    Get a product by SKU (merchant-scoped).

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        sku: Product SKU

    Returns:
        Product object if found, None otherwise
    """
    return db.query(Product).filter(
        Product.sku == sku,
        Product.merchant_id == merchant_id
    ).first()


def create_product(db: Session, merchant_id: str, product_data: ProductCreate) -> Product:
    """
    Create a new product.

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        product_data: Product creation data

    Returns:
        Created Product object
    """
    product = Product(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        name=product_data.name,
        sku=product_data.sku,
        price=product_data.price,
        quantity=product_data.quantity,
        tags=product_data.tags,
        image=product_data.image,
        description=product_data.description
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, update_data: ProductUpdate) -> Product:
    """
    Update an existing product.

    Args:
        db: Database session
        product: Product object to update
        update_data: Product update data

    Returns:
        Updated Product object
    """
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def bulk_import_products(
    db: Session,
    merchant_id: str,
    products: List[ProductCreate],
    skip_duplicates: bool = False
) -> BulkImportResult:
    """
    Bulk import products with upsert logic.

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        products: List of products to import
        skip_duplicates: If True, skip existing SKUs; if False, update them

    Returns:
        BulkImportResult with counts and errors
    """
    created = 0
    updated = 0
    skipped = 0
    errors = []

    for idx, product_data in enumerate(products):
        try:
            existing = get_product_by_sku(db, merchant_id, product_data.sku)

            if existing:
                if skip_duplicates:
                    skipped += 1
                else:
                    # Update existing product
                    existing.name = product_data.name
                    existing.price = product_data.price
                    existing.quantity = product_data.quantity
                    existing.tags = product_data.tags
                    existing.image = product_data.image
                    existing.description = product_data.description
                    updated += 1
            else:
                # Create new product
                product = Product(
                    id=str(uuid.uuid4()),
                    merchant_id=merchant_id,
                    name=product_data.name,
                    sku=product_data.sku,
                    price=product_data.price,
                    quantity=product_data.quantity,
                    tags=product_data.tags,
                    image=product_data.image,
                    description=product_data.description
                )
                db.add(product)
                created += 1

        except Exception as e:
            errors.append({
                "row": idx + 1,
                "sku": product_data.sku,
                "error": str(e)
            })

    db.commit()

    return BulkImportResult(
        created=created,
        updated=updated,
        skipped=skipped,
        errors=errors
    )


def bulk_delete_products(db: Session, merchant_id: str, product_ids: List[str]) -> int:
    """
    Bulk delete products by IDs (merchant-scoped).

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        product_ids: List of product IDs to delete

    Returns:
        Number of deleted products
    """
    deleted = db.query(Product).filter(
        Product.id.in_(product_ids),
        Product.merchant_id == merchant_id
    ).delete(synchronize_session=False)
    db.commit()
    return deleted


# Mock tag categories for dummy AI tagging
MOCK_TAG_CATEGORIES = {
    "material": ["Cotton", "Leather", "Synthetic", "Wool", "Silk", "Denim"],
    "style": ["Modern", "Vintage", "Minimalist", "Casual", "Premium", "Eco-friendly"],
    "audience": ["Men", "Women", "Kids", "Unisex", "Teens", "Adults"]
}


def generate_ai_tags_for_products(
    db: Session,
    merchant_id: str,
    product_ids: List[str]
) -> dict:
    """
    Generate mock AI tags for products (dummy implementation).

    In a real implementation, this would call an AI service.

    Args:
        db: Database session
        merchant_id: Merchant's unique identifier
        product_ids: List of product IDs to generate tags for

    Returns:
        Dictionary with processed count and results list
    """
    results = []
    processed = 0

    for product_id in product_ids:
        product = get_product_by_id(db, merchant_id, product_id)
        if product:
            # Generate 2-4 random mock tags based on product name
            num_tags = random.randint(2, 4)
            suggested_tags = []

            # Pick random tags from different categories
            categories = random.sample(
                list(MOCK_TAG_CATEGORIES.keys()),
                min(num_tags, len(MOCK_TAG_CATEGORIES))
            )
            for category in categories:
                tag = random.choice(MOCK_TAG_CATEGORIES[category])
                if tag not in suggested_tags:
                    suggested_tags.append(tag)

            results.append({
                "productId": product_id,
                "suggestedTags": suggested_tags,
                "applied": False
            })
            processed += 1

    return {
        "processed": processed,
        "results": results
    }
