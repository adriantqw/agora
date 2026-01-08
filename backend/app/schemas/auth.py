from pydantic import BaseModel, EmailStr
from app.schemas.merchant import MerchantResponse


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class TokenData(BaseModel):
    """Token data schema."""

    token: str
    refreshToken: str


class LoginData(BaseModel):
    """Login response data schema."""

    user: MerchantResponse
    token: str
    refreshToken: str


class LoginResponse(BaseModel):
    """Login response schema."""

    success: bool = True
    data: LoginData


class RefreshRequest(BaseModel):
    """Refresh token request schema."""

    refreshToken: str


class RefreshData(BaseModel):
    """Refresh token response data schema."""

    token: str


class RefreshResponse(BaseModel):
    """Refresh token response schema."""

    success: bool = True
    data: RefreshData


class UserData(BaseModel):
    """User profile data schema."""

    user: MerchantResponse


class UserResponse(BaseModel):
    """User profile response schema."""

    success: bool = True
    data: UserData


class ErrorDetail(BaseModel):
    """Error detail schema."""

    code: str
    message: str


class ErrorResponse(BaseModel):
    """Error response schema."""

    success: bool = False
    error: ErrorDetail
