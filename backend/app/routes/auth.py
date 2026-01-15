from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.merchant import Merchant
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LoginData,
    RefreshRequest,
    RefreshResponse,
    RefreshData,
    UserResponse,
    UserData,
    ErrorResponse,
    ErrorDetail
)
from app.schemas.merchant import MerchantResponse
from app.services.auth_service import (
    authenticate_merchant,
    create_tokens,
    validate_refresh_token_db,
    revoke_refresh_token_db
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse, responses={401: {"model": ErrorResponse}})
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate merchant and return access and refresh tokens.

    Args:
        request: Login request with email and password
        db: Database session

    Returns:
        Login response with user data and tokens

    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate merchant
    merchant = authenticate_merchant(db, request.email, request.password)
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_CREDENTIALS",
                    "message": "Invalid email or password"
                }
            }
        )

    # Create tokens
    access_token, refresh_token = create_tokens(db, merchant.id)

    # Build response
    return LoginResponse(
        success=True,
        data=LoginData(
            user=MerchantResponse.from_merchant(merchant),
            token=access_token,
            refreshToken=refresh_token
        )
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: RefreshRequest,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout merchant by revoking refresh token.

    Args:
        request: Refresh token to revoke
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        204 No Content
    """
    # Revoke the refresh token
    revoke_refresh_token_db(db, request.refreshToken)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/refresh", response_model=RefreshResponse, responses={401: {"model": ErrorResponse}})
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.

    Args:
        request: Refresh token request
        db: Database session

    Returns:
        New access token

    Raises:
        HTTPException: If refresh token is invalid
    """
    # Validate refresh token
    merchant_id = validate_refresh_token_db(db, request.refreshToken)
    if not merchant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "Invalid or expired refresh token"
                }
            }
        )

    # Create new access token
    access_token = create_tokens(db, merchant_id)[0]  # Only need access token

    return RefreshResponse(
        success=True,
        data=RefreshData(token=access_token)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: Merchant = Depends(get_current_user)):
    """
    Get current authenticated merchant's profile.

    Args:
        current_user: Current authenticated merchant

    Returns:
        User profile data
    """
    return UserResponse(
        success=True,
        data=UserData(user=MerchantResponse.from_merchant(current_user))
    )
