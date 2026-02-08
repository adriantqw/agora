"""API routes for curate-my-fit integration."""
import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.dependencies import get_current_consumer, get_current_consumer_optional, get_db
from app.models.consumer import Consumer
from app.schemas.curate_my_fit import (
    StartBatchResponse,
    StartBatchStreamRequest,
    SubmitBatchAnswersRequest,
    SubmitBatchAnswersResponse,
    StateResponse,
)
from app.services import curate_my_fit_service
from app.services.storage_service import storage_service

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/curate-my-fit", tags=["Curate My Fit"])


@router.post("/start", response_model=StartBatchResponse)
async def start_batch(
    searchQuery: str = Form(...),
    images: list[UploadFile] = File(default=[]),
    current_consumer: Optional[Consumer] = Depends(get_current_consumer_optional),
    db: Session = Depends(get_db)
):
    """
    Start a new curate-my-fit batch session.

    Uploads images to R2 and initializes PersonalStylist agent with search query.

    Args:
        searchQuery: User's search query (e.g., "Valentine's date outfit")
        images: Up to 5 image files (JPEG, PNG, WEBP)
        current_consumer: Optional authenticated consumer (guest mode if None)
        db: Database session

    Returns:
        StartBatchResponse with threadId, blurb, questions, summaryUpdates, imageUrls
    """
    try:
        consumer_id = current_consumer.id if current_consumer else "guest"
        logger.info(f"Starting batch for consumer {consumer_id} with query: {searchQuery}")
        result = await curate_my_fit_service.start_batch(
            db=db,
            consumer_id=consumer_id,
            search_query=searchQuery,
            images=images
        )

        logger.info(f"Batch started successfully with thread_id: {result.get('threadId')}")
        return {"success": True, "data": result}

    except ValueError as e:
        logger.error(f"Validation error in start_batch: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in start_batch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start batch: {str(e)}")


@router.post("/submit", response_model=SubmitBatchAnswersResponse)
async def submit_batch_answers(
    request: SubmitBatchAnswersRequest,
    current_consumer: Optional[Consumer] = Depends(get_current_consumer_optional),
    db: Session = Depends(get_db)
):
    """
    Submit batch answers to PersonalStylist agent.

    Returns either next batch of questions or final journey if complete.

    Args:
        request: SubmitBatchAnswersRequest with threadId and answers
        current_consumer: Optional authenticated consumer (guest mode if None)
        db: Database session

    Returns:
        SubmitBatchAnswersResponse with hasMore flag and either:
        - Next batch (blurb, questions, summaryUpdates) if hasMore=true
        - Final journey (journeyId, journey) if hasMore=false
    """
    try:
        consumer_id = current_consumer.id if current_consumer else "guest"
        logger.info(f"Submitting answers for thread {request.threadId}")
        result = await curate_my_fit_service.submit_batch_answers(
            db=db,
            consumer_id=consumer_id,
            thread_id=request.threadId,
            answers=request.answers
        )

        logger.info(f"Answers submitted successfully, hasMore: {result.get('hasMore')}")
        return {"success": True, "data": result}

    except ValueError as e:
        logger.error(f"Validation error in submit_batch_answers: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in submit_batch_answers: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to submit answers: {str(e)}")


@router.get("/state/{thread_id}", response_model=StateResponse)
def get_state(
    thread_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
):
    """
    Retrieve session state for autosave/resume (PLACEHOLDER).

    TODO: Implement autosave functionality for draft sessions.

    Args:
        thread_id: Thread ID from start_batch
        current_consumer: Authenticated consumer

    Returns:
        StateResponse with threadId, answers, lastUpdated, expiresAt
    """
    # TODO: Implement autosave/resume functionality
    # Should return: { threadId, answers, lastUpdated, expiresAt }
    raise HTTPException(
        status_code=501,
        detail="Autosave functionality not yet implemented. This is a placeholder for future work."
    )

    # Commented out for future implementation:
    # try:
    #     result = curate_my_fit_service.get_state(thread_id)
    #     return {"success": True, "data": result}
    # except ValueError as e:
    #     raise HTTPException(status_code=404, detail=str(e))
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Failed to get state: {str(e)}")


@router.post("/upload-images")
async def upload_images(
    images: list[UploadFile] = File(...),
    current_consumer: Optional[Consumer] = Depends(get_current_consumer_optional),
):
    """
    Pre-upload images for streaming start batch.

    SSE streaming doesn't support multipart FormData, so images are uploaded
    separately before starting the streaming batch.
    """
    try:
        upload_result = await storage_service.upload_search_images(images)
        if "error" in upload_result:
            raise ValueError(upload_result["error"])

        image_urls = [img["url"] for img in upload_result["urls"]]
        image_types = [img.get("type") for img in upload_result["urls"]]

        return {"success": True, "data": {"imageUrls": image_urls, "imageTypes": image_types}}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Image upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to upload images: {str(e)}")


@router.post("/start/stream")
async def start_batch_stream(
    request: StartBatchStreamRequest,
    current_consumer: Optional[Consumer] = Depends(get_current_consumer_optional),
    db: Session = Depends(get_db),
):
    """Stream batch start responses via SSE."""
    consumer_id = current_consumer.id if current_consumer else "guest"
    logger.info(f"Starting batch stream for consumer {consumer_id}")

    async def event_generator():
        try:
            yield f"data: ping\n\n"
            async for event in curate_my_fit_service.start_batch_stream(
                db=db,
                consumer_id=consumer_id,
                search_query=request.searchQuery,
                image_urls=request.imageUrls,
                image_types=request.imageTypes,
            ):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except Exception as e:
            logger.error(f"Stream error in start_batch: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/submit/stream")
async def submit_batch_answers_stream(
    request: SubmitBatchAnswersRequest,
    current_consumer: Optional[Consumer] = Depends(get_current_consumer_optional),
    db: Session = Depends(get_db),
):
    """Stream answer submission responses via SSE."""
    consumer_id = current_consumer.id if current_consumer else "guest"
    logger.info(f"Starting submit stream for thread {request.threadId}")

    async def event_generator():
        try:
            async for event in curate_my_fit_service.submit_batch_answers_stream(
                db=db,
                consumer_id=consumer_id,
                thread_id=request.threadId,
                answers=request.answers,
            ):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except Exception as e:
            logger.error(f"Stream error in submit_batch_answers: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
