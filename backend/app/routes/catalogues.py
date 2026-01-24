from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.merchant import Merchant
import json
import asyncio
from datetime import datetime
from app.schemas.catalogue import (
    CatalogueResponse,
    CatalogueListResponse,
    CatalogueListData,
    CatalogueItemListResponse,
    CatalogueItemListData,
    CatalogueItemResponse,
    PaginationInfo,
    CreateProductsRequest,
    CreateProductsResponse,
    CreateProductsResult,
    DeleteCatalogueResponse,
    DeleteCatalogueResult
)
from app.services import catalogue_service
import math

router = APIRouter(prefix="/api/catalogues", tags=["Catalogues"])


@router.post("/upload", response_model=dict)
async def upload_catalogue(
    file: UploadFile = File(...),
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process a PDF catalogue.

    Args:
        file: PDF file to upload (max 50MB)
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Catalogue details with processing status
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_FILE_TYPE",
                    "message": "File must be a PDF"
                }
            }
        )

    # Validate file size (50MB max)
    MAX_SIZE = 50 * 1024 * 1024  # 50MB
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "success": False,
                "error": {
                    "code": "FILE_TOO_LARGE",
                    "message": f"File size exceeds maximum of {MAX_SIZE // 1024 // 1024}MB"
                }
            }
        )

    try:
        catalogue = await catalogue_service.upload_and_ingest_catalogue(
            db=db,
            merchant_id=current_user.id,
            file=file,
            filename=file.filename
        )

        return {
            "success": True,
            "data": CatalogueResponse.from_model(catalogue)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": {
                    "code": "PROCESSING_FAILED",
                    "message": str(e)
                }
            }
        )


@router.get("/{catalogue_id}/stream")
async def stream_catalogue_processing(
    catalogue_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream real-time processing updates via Server-Sent Events (SSE).

    Events sent:
    - progress: Current page, total pages, items found, thinking message
    - complete: Processing finished successfully
    - error: Processing failed

    Args:
        catalogue_id: Catalogue ID to stream
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        StreamingResponse with text/event-stream
    """
    # Verify catalogue ownership
    catalogue = catalogue_service.get_catalogue_by_id(db, catalogue_id, current_user.id)
    if not catalogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catalogue not found"
        )

    async def event_generator():
        try:
            while True:
                # Force a fresh query by expiring the current session
                db.expire_all()
                
                # Refresh catalogue state from database
                db.refresh(catalogue)

                # Send progress update
                event = {
                    "type": "progress",
                    "status": catalogue.status,
                    "currentPage": catalogue.current_page or 0,
                    "totalPages": catalogue.total_pages or 0,
                    "itemsFound": catalogue.items_extracted or 0,
                    "thinkingMessage": catalogue.thinking_message or "",
                    "timestamp": datetime.utcnow().isoformat()
                }

                yield f"data: {json.dumps(event)}\n\n"

                # Check if completed
                if catalogue.status == "completed":
                    final_event = {
                        "type": "complete",
                        "itemsFound": catalogue.items_extracted or 0,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    yield f"data: {json.dumps(final_event)}\n\n"
                    break

                # Check if failed
                if catalogue.status == "failed":
                    error_event = {
                        "type": "error",
                        "message": catalogue.error_message or "Processing failed",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    yield f"data: {json.dumps(error_event)}\n\n"
                    break

                # Poll every 500ms
                await asyncio.sleep(0.5)

        except Exception as e:
            error_event = {
                "type": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.get("", response_model=CatalogueListResponse)
def list_catalogues(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all catalogues for the current merchant.

    Args:
        page: Page number (1-indexed)
        limit: Items per page (max 100)
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Paginated list of catalogues
    """
    catalogues, total_count = catalogue_service.get_catalogues(
        db=db,
        merchant_id=current_user.id,
        page=page,
        limit=limit
    )

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0

    return CatalogueListResponse(
        success=True,
        data=CatalogueListData(
            items=[CatalogueResponse.from_model(c) for c in catalogues],
            pagination=PaginationInfo(
                page=page,
                limit=limit,
                total=total_count,
                totalPages=total_pages
            )
        )
    )


@router.get("/{catalogue_id}/status", response_model=dict)
def get_catalogue_status(
    catalogue_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get catalogue processing status (for polling during upload).

    Args:
        catalogue_id: The catalogue's ID
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Status information with progress
    """
    catalogue = catalogue_service.get_catalogue_by_id(
        db=db,
        merchant_id=current_user.id,
        catalogue_id=catalogue_id
    )

    if not catalogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "CATALOGUE_NOT_FOUND",
                    "message": "Catalogue not found"
                }
            }
        )

    # Calculate progress based on status
    if catalogue.status == "processing":
        # Fake progress calculation (you could enhance this with real progress tracking)
        import time
        elapsed = time.time() - catalogue.created_at.timestamp()
        # Assume 60 seconds average processing time
        progress = min(95, int((elapsed / 60) * 100))

        return {
            "success": True,
            "data": {
                "status": "processing",
                "progress": progress,
                "message": f"Processing catalogue... {progress}%"
            }
        }
    elif catalogue.status == "completed":
        return {
            "success": True,
            "data": {
                "status": "completed",
                "progress": 100,
                "itemsExtracted": catalogue.items_extracted,
                "message": f"Extracted {catalogue.items_extracted} items"
            }
        }
    else:  # failed
        return {
            "success": True,
            "data": {
                "status": "failed",
                "progress": 0,
                "message": catalogue.error_message or "Processing failed"
            }
        }


@router.get("/{catalogue_id}", response_model=dict)
def get_catalogue(
    catalogue_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single catalogue by ID.

    Args:
        catalogue_id: The catalogue's ID
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Catalogue details
    """
    catalogue = catalogue_service.get_catalogue_by_id(
        db=db,
        merchant_id=current_user.id,
        catalogue_id=catalogue_id
    )

    if not catalogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "CATALOGUE_NOT_FOUND",
                    "message": "Catalogue not found"
                }
            }
        )

    return {
        "success": True,
        "data": CatalogueResponse.from_model(catalogue)
    }


@router.get("/{catalogue_id}/items", response_model=CatalogueItemListResponse)
def get_catalogue_items(
    catalogue_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get items from a catalogue.

    Args:
        catalogue_id: The catalogue's ID
        page: Page number (1-indexed)
        limit: Items per page (max 100)
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Paginated list of catalogue items with catalogue info
    """
    items, total_count, catalogue = catalogue_service.get_catalogue_items(
        db=db,
        merchant_id=current_user.id,
        catalogue_id=catalogue_id,
        page=page,
        limit=limit
    )

    if not catalogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "CATALOGUE_NOT_FOUND",
                    "message": "Catalogue not found"
                }
            }
        )

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0

    return CatalogueItemListResponse(
        success=True,
        data=CatalogueItemListData(
            items=[CatalogueItemResponse.from_model(item) for item in items],
            catalogue=CatalogueResponse.from_model(catalogue),
            pagination=PaginationInfo(
                page=page,
                limit=limit,
                total=total_count,
                totalPages=total_pages
            )
        )
    )


@router.post("/{catalogue_id}/create-products", response_model=CreateProductsResponse)
def create_products(
    catalogue_id: str,
    request: CreateProductsRequest,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create products from catalogue items.

    Args:
        catalogue_id: The catalogue's ID
        request: Product creation request with item IDs and defaults
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Result with created count and errors
    """
    # Verify catalogue exists and belongs to merchant
    catalogue = catalogue_service.get_catalogue_by_id(
        db=db,
        merchant_id=current_user.id,
        catalogue_id=catalogue_id
    )

    if not catalogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "CATALOGUE_NOT_FOUND",
                    "message": "Catalogue not found"
                }
            }
        )

    # Validate item count
    if len(request.items) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_REQUEST",
                    "message": "At least one item is required"
                }
            }
        )

    if len(request.items) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_REQUEST",
                    "message": "Maximum 100 items per batch"
                }
            }
        )

    try:
        result = catalogue_service.create_products_from_items(
            db=db,
            merchant_id=current_user.id,
            items=request.items,
            default_price=request.defaultPrice,
            default_quantity=request.defaultQuantity,
            generate_sku=request.generateSku,
            sku_prefix=request.skuPrefix
        )

        return CreateProductsResponse(
            success=True,
            data=CreateProductsResult(
                created=result["created"],
                errors=result["errors"]
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": {
                    "code": "CREATION_FAILED",
                    "message": str(e)
                }
            }
        )


@router.delete("/{catalogue_id}", response_model=DeleteCatalogueResponse)
def delete_catalogue(
    catalogue_id: str,
    current_user: Merchant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a catalogue and all associated items.

    Args:
        catalogue_id: The catalogue's ID
        current_user: Current authenticated merchant
        db: Database session

    Returns:
        Deletion result
    """
    success = catalogue_service.delete_catalogue(
        db=db,
        merchant_id=current_user.id,
        catalogue_id=catalogue_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": "CATALOGUE_NOT_FOUND",
                    "message": "Catalogue not found"
                }
            }
        )

    return DeleteCatalogueResponse(
        success=True,
        data=DeleteCatalogueResult(deleted=True)
    )
