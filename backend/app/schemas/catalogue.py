from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


# === Helper Schemas ===

class PaginationInfo(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    totalPages: int


# === Response Schemas (camelCase for frontend) ===

class CatalogueResponse(BaseModel):
    """Single catalogue response schema."""

    id: str
    merchantId: str
    filename: str
    fileUrl: str
    status: str  # "processing" | "completed" | "failed"
    itemsExtracted: int
    processingTime: Optional[float]
    errorMessage: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, catalogue):
        """Convert ORM model to response schema."""
        return cls(
            id=catalogue.id,
            merchantId=catalogue.merchant_id,
            filename=catalogue.filename,
            fileUrl=catalogue.file_url,
            status=catalogue.status,
            itemsExtracted=catalogue.items_extracted,
            processingTime=catalogue.processing_time,
            errorMessage=catalogue.error_message,
            createdAt=catalogue.created_at,
            updatedAt=catalogue.updated_at
        )


class CatalogueListData(BaseModel):
    """Catalogue list data with pagination."""

    items: List[CatalogueResponse]
    pagination: PaginationInfo


class CatalogueListResponse(BaseModel):
    """Paginated catalogue list response."""

    success: bool = True
    data: CatalogueListData


class CatalogueItemResponse(BaseModel):
    """Single catalogue item response schema."""

    id: str
    catalogueId: str
    merchantId: str
    name: str
    description: Optional[str]
    sizes: List[str]
    colours: List[str]
    page: int
    imageUrl: str
    imageType: Optional[str] = None
    bboxData: dict
    productId: Optional[str]
    isConverted: bool
    createdAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, item):
        """Convert ORM model to response schema."""
        # Extract image type from image URL if available
        image_type = None
        if item.image_url:
            # Extract extension from URL
            from urllib.parse import urlparse
            path = urlparse(item.image_url).path
            ext = path.rsplit('.', 1)[-1].lower() if '.' in path else None
            image_type = f"image/{ext}" if ext in ['jpg', 'jpeg', 'png', 'webp', 'gif'] else None

        return cls(
            id=item.id,
            catalogueId=item.catalogue_id,
            merchantId=item.merchant_id,
            name=item.name,
            description=item.description,
            sizes=item.sizes or [],
            colours=item.colours or [],
            page=item.page,
            imageUrl=item.image_url,
            imageType=image_type,
            bboxData=item.bbox_data,
            productId=item.product_id,
            isConverted=item.is_converted,
            createdAt=item.created_at
        )


class CatalogueItemListData(BaseModel):
    """Catalogue items list data with catalogue info and pagination."""

    items: List[CatalogueItemResponse]
    catalogue: CatalogueResponse
    pagination: PaginationInfo


class CatalogueItemListResponse(BaseModel):
    """Paginated catalogue items list response."""

    success: bool = True
    data: CatalogueItemListData


# === Request Schemas ===

class CreateProductsItem(BaseModel):
    """Item payload for product creation with overrides."""
    
    id: str
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    @field_validator('price')
    @classmethod
    def round_price_item(cls, v):
        if v is not None:
            return round(v, 2)
        return v


class CreateProductsRequest(BaseModel):
    """Schema for creating products from catalogue items."""

    items: List[CreateProductsItem] = Field(..., min_length=1, max_length=100)
    defaultPrice: float = Field(..., ge=0)
    defaultQuantity: int = Field(..., ge=0)
    generateSku: bool = Field(default=True)
    skuPrefix: str = Field(default="CAT-", max_length=10)

    @field_validator('defaultPrice')
    @classmethod
    def round_price(cls, v):
        return round(v, 2)


# === Result/Response Schemas ===

class CreateProductsResult(BaseModel):
    """Result of creating products from catalogue items."""

    created: int
    errors: List[dict]


class CreateProductsResponse(BaseModel):
    """Response for creating products from catalogue items."""

    success: bool = True
    data: CreateProductsResult


class DeleteCatalogueResult(BaseModel):
    """Result of deleting a catalogue."""

    deleted: bool


class DeleteCatalogueResponse(BaseModel):
    """Response for deleting a catalogue."""

    success: bool = True
    data: DeleteCatalogueResult
