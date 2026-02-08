import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.dependencies import get_current_consumer, get_db
from app.models.consumer import Consumer
from app.schemas.matchmaker import (
    MatchRequest, MatchResponse,
    StreamProgressEvent, StreamCompleteEvent, StreamErrorEvent,
    StateResponse
)
from app.services import matchmaker_service

router = APIRouter(prefix="/api/matchmaker", tags=["MatchMaker"])


@router.post("/match", response_model=MatchResponse)
def match(
    request: MatchRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Get product matches synchronously."""
    try:
        result = matchmaker_service.match(
            journey_id=request.journeyId,
            stylist_thread_id=request.stylistThreadId,
            thread_id=request.threadId,
            message=request.message,
            personality=request.personality,
            db=db,
            consumer_id=current_consumer.id
        )
        return {"success": True, "data": result}
    except ValueError as e:
        # Journey not found or ownership error
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
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
            detail=f"Failed to match products: {str(e)}"
        )


@router.post("/match/stream")
async def match_stream(
    request: MatchRequest,
    current_consumer: Consumer = Depends(get_current_consumer),
    db: Session = Depends(get_db)
):
    """Stream product matches via Server-Sent Events."""
    async def event_generator():
        try:
            async for event in matchmaker_service.match_stream(
                journey_id=request.journeyId,
                stylist_thread_id=request.stylistThreadId,
                thread_id=request.threadId,
                message=request.message,
                personality=request.personality,
                db=db,
                consumer_id=current_consumer.id
            ):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except ValueError as e:
            # Journey not found or ownership error
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
        result = matchmaker_service.get_state(thread_id, db)
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
