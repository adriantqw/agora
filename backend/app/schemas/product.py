from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


# === Request Schemas ===

class ProductCreate(BaseModel):
    """Schema for creating a product."""

    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    tags: List[str] = Field(default_factory=list)
    image: Optional[str] = Field(None, max_length=2000)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('price')
    @classmethod
    def round_price(cls, v):
        return round(v, 2)


class ProductUpdate(BaseModel):
    """Schema for updating a product (SKU cannot be changed)."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)
    tags: Optional[List[str]] = None
    image: Optional[str] = Field(None, max_length=2000)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('price')
    @classmethod
    def round_price(cls, v):
        if v is not None:
            return round(v, 2)
        return v


class BulkProductCreate(BaseModel):
    """Schema for bulk import."""

    products: List[ProductCreate]
    skipDuplicates: bool = False


class BulkDeleteRequest(BaseModel):
    """Schema for bulk delete."""

    ids: List[str] = Field(..., min_length=1, max_length=100)


# === Response Schemas (camelCase for frontend) ===

class ProductResponse(BaseModel):
    """Single product response schema."""

    id: str
    name: str
    sku: str
    price: float
    quantity: int
    tags: List[str]
    image: Optional[str]
    description: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_product(cls, product):
        return cls(
            id=product.id,
            name=product.name,
            sku=product.sku,
            price=product.price,
            quantity=product.quantity,
            tags=product.tags or [],
            image=product.image,
            description=product.description,
            createdAt=product.created_at,
            updatedAt=product.updated_at
        )


class PaginationInfo(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    totalPages: int


class ProductListData(BaseModel):
    """Product list data with pagination."""

    items: List[ProductResponse]
    pagination: PaginationInfo


class ProductListResponse(BaseModel):
    """Paginated product list response."""

    success: bool = True
    data: ProductListData


class ProductDetailData(BaseModel):
    """Single product data wrapper."""

    product: ProductResponse


class ProductDetailResponse(BaseModel):
    """Single product detail response."""

    success: bool = True
    data: ProductResponse


class BulkImportResult(BaseModel):
    """Bulk import result."""

    created: int
    updated: int
    skipped: int
    errors: List[dict]


class BulkImportResponse(BaseModel):
    """Bulk import response."""

    success: bool = True
    data: BulkImportResult


class BulkDeleteResult(BaseModel):
    """Bulk delete result."""

    deleted: int


class BulkDeleteResponse(BaseModel):
    """Bulk delete response."""

    success: bool = True
    data: BulkDeleteResult
