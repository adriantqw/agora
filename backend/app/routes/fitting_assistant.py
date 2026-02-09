import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.dependencies import get_current_consumer, get_db
from app.models.consumer import Consumer
from app.schemas.fitting_assistant import (
    FitRequest, FitResponse,
    StateResponse
)
from app.services import fitting_assistant_service

router = APIRouter(prefix="/api/fitting-assistant", tags=["FittingAssistant"])


@router.post("/fit", response_model=FitResponse)
def fit(
    request: FitRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Generate fitting room lookbooks synchronously."""
    try:
        # Convert pydantic models to dicts for the service layer
        selections = [s.model_dump() for s in request.productSelections]

        result = fitting_assistant_service.fit(
            journey_id=request.journeyId,
            stylist_thread_id=request.stylistThreadId,
            product_selections=selections,
            thread_id=request.threadId,
            message=request.message,
            personality=request.personality,
            db=db,
            consumer_id=current_consumer.id
        )
        return {"success": True, "data": result}
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        elif "not valid" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate fitting: {str(e)}"
        )


@router.post("/fit/stream")
async def fit_stream(
    request: FitRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Stream fitting room lookbook generation via Server-Sent Events."""
    async def event_generator():
        try:
            # Convert pydantic models to dicts for the service layer
            selections = [s.model_dump() for s in request.productSelections]

            async for event in fitting_assistant_service.fit_stream(
                journey_id=request.journeyId,
                stylist_thread_id=request.stylistThreadId,
                product_selections=selections,
                thread_id=request.threadId,
                message=request.message,
                personality=request.personality,
                db=db,
                consumer_id=current_consumer.id
            ):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except ValueError as e:
            if "not found" in str(e).lower():
                error_event = {"type": "error", "message": f"404: {str(e)}"}
                yield f"data: {json.dumps(error_event)}\n\n"
            else:
                error_event = {"type": "error", "message": f"403: {str(e)}"}
                yield f"data: {json.dumps(error_event)}\n\n"
        except Exception as e:
            error_event = {"type": "error", "message": f"500: {str(e)}"}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/state/{thread_id}", response_model=StateResponse)
def get_state(
    thread_id: str,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Retrieve session state for a thread."""
    try:
        result = fitting_assistant_service.get_state(thread_id, db)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve state: {str(e)}"
        )
