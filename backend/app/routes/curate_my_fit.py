"""API routes for curate-my-fit integration."""
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_consumer, get_db
from app.models.consumer import Consumer
from app.schemas.curate_my_fit import (
    StartBatchResponse,
    SubmitBatchAnswersRequest,
    SubmitBatchAnswersResponse,
    StateResponse,
)
from app.services import curate_my_fit_service

router = APIRouter(prefix="/api/curate-my-fit", tags=["Curate My Fit"])


@router.post("/start", response_model=StartBatchResponse)
async def start_batch(
    searchQuery: str = Form(...),
    images: list[UploadFile] = File(default=[]),
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Start a new curate-my-fit batch session.

    Uploads images to R2 and initializes PersonalStylist agent with search query.

    Args:
        searchQuery: User's search query (e.g., "Valentine's date outfit")
        images: Up to 5 image files (JPEG, PNG, WEBP)
        current_consumer: Authenticated consumer
        db: Database session

    Returns:
        StartBatchResponse with threadId, blurb, questions, summaryUpdates, imageUrls
    """
    try:
        result = await curate_my_fit_service.start_batch(
            db=db,
            consumer_id=current_consumer.id,
            search_query=searchQuery,
            images=images
        )

        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start batch: {str(e)}")


@router.post("/submit", response_model=SubmitBatchAnswersResponse)
def submit_batch_answers(
    request: SubmitBatchAnswersRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """
    Submit batch answers to PersonalStylist agent.

    Returns either the next batch of questions or final journey if complete.

    Args:
        request: SubmitBatchAnswersRequest with threadId and answers
        current_consumer: Authenticated consumer
        db: Database session

    Returns:
        SubmitBatchAnswersResponse with hasMore flag and either:
        - Next batch (blurb, questions, summaryUpdates) if hasMore=true
        - Final journey (journeyId, journey, nextStep) if hasMore=false
    """
    try:
        result = curate_my_fit_service.submit_batch_answers(
            db=db,
            consumer_id=current_consumer.id,
            thread_id=request.threadId,
            answers=request.answers
        )

        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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
