from pydantic import BaseModel, EmailStr
from datetime import datetime


class MerchantBase(BaseModel):
    """Base merchant schema with common fields."""

    email: EmailStr
    merchant_name: str
    store_name: str
    store_id: str
    role: str = "merchant"


class MerchantResponse(BaseModel):
    """Merchant response schema for API responses."""

    id: str
    email: str
    merchantName: str
    storeName: str
    storeId: str
    role: str
    memberSince: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_merchant(cls, merchant):
        """Create MerchantResponse from Merchant model."""
        return cls(
            id=merchant.id,
            email=merchant.email,
            merchantName=merchant.merchant_name,
            storeName=merchant.store_name,
            storeId=merchant.store_id,
            role=merchant.role,
            memberSince=merchant.member_since
        )
