from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.merchant import Merchant
from app.services.storage_service import storage_service
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductListData,
    PaginationInfo,
    ProductDetailResponse,
    BulkProductCreate,
    BulkImportResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
    BulkDeleteResult
)
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: Merchant = Depends(get_current_user),
):
    """
    Upload a product image to Cloudflare R2.

    Args:
        file: Image file (jpg, png, webp, gif - max 5MB)
        current_user: Current authenticated merchant

    Returns:
        URL of the uploaded image
    """
    result = await storage_service.upload_image(file)

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "UPLOAD_FAILED",
                    "message": result["error"]
                }
            }
        )

    return {
        "success": True,
        "data": {
            "url": result["url"],
            "filename": result["filename"]
        }
    }


@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    sortBy: str = Query("name"),
    sortOrder: str = Query("asc"),
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List products with pagination, search, and filtering.

    Args:
        page: Page number (1-indexed)
        limit: Items per page (max 100)
        search: Search query for name or SKU
        tags: Comma-separated tag filter
        sortBy: Field to sort by (name, sku, price, quantity, createdAt)
        sortOrder: Sort direction (asc, desc)
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Paginated list of products
    """
    # Parse tags
    tag_list = [t.strip() for t in tags.split(",")] if tags else None

    # Validate sort field
    valid_sort_fields = ["name", "sku", "price", "quantity", "created_at", "createdAt"]
    sort_field = sortBy if sortBy in valid_sort_fields else "name"

    # Validate sort order
    sort_direction = sortOrder if sortOrder in ["asc", "desc"] else "asc"

    products, total = product_service.get_products(
        db=db,
        merchant_id=current_user.id,
        page=page,
        limit=limit,
        search=search,
        tags=tag_list,
        sort_by=sort_field,
        sort_order=sort_direction
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return ProductListResponse(
        success=True,
        data=ProductListData(
            items=[ProductResponse.from_product(p) for p in products],
            pagination=PaginationInfo(
                page=page,
                limit=limit,
                total=total,
                totalPages=total_pages
            )
        )
    )


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(
    product_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single product by ID.

    Args:
        product_id: Product's unique identifier
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Product details

    Raises:
        HTTPException: If product not found
    """
    product = product_service.get_product_by_id(db, current_user.id, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Product not found"
                }
            }
        )

    return ProductDetailResponse(
        success=True,
        data=ProductResponse.from_product(product)
    )


@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new product.

    Args:
        product_data: Product creation data
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Created product details

    Raises:
        HTTPException: If SKU already exists
    """
    # Check SKU uniqueness
    existing = product_service.get_product_by_sku(db, current_user.id, product_data.sku)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "error": {
                    "code": "SKU_EXISTS",
                    "message": f"SKU '{product_data.sku}' already exists"
                }
            }
        )

    product = product_service.create_product(db, current_user.id, product_data)

    return ProductDetailResponse(
        success=True,
        data=ProductResponse.from_product(product)
    )


@router.post("/bulk", response_model=BulkImportResponse)
def bulk_import_products(
    bulk_data: BulkProductCreate,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk import products (create or update).

    Args:
        bulk_data: Bulk import data with products list
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Import results with counts

    Raises:
        HTTPException: If too many products
    """
    if len(bulk_data.products) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "TOO_MANY_ITEMS",
                    "message": "Maximum 500 products per request"
                }
            }
        )

    result = product_service.bulk_import_products(
        db=db,
        merchant_id=current_user.id,
        products=bulk_data.products,
        skip_duplicates=bulk_data.skipDuplicates
    )

    return BulkImportResponse(success=True, data=result)


@router.put("/{product_id}", response_model=ProductDetailResponse)
def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing product.

    Args:
        product_id: Product's unique identifier
        update_data: Product update data
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Updated product details

    Raises:
        HTTPException: If product not found
    """
    product = product_service.get_product_by_id(db, current_user.id, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Product not found"
                }
            }
        )

    updated_product = product_service.update_product(db, product, update_data)

    return ProductDetailResponse(
        success=True,
        data=ProductResponse.from_product(updated_product)
    )


@router.delete("/bulk", response_model=BulkDeleteResponse)
def bulk_delete_products(
    delete_data: BulkDeleteRequest,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk delete products by IDs.

    Args:
        delete_data: Bulk delete request with product IDs
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Delete results with count
    """
    deleted_count = product_service.bulk_delete_products(
        db=db,
        merchant_id=current_user.id,
        product_ids=delete_data.ids
    )

    return BulkDeleteResponse(
        success=True,
        data=BulkDeleteResult(deleted=deleted_count)
    )
