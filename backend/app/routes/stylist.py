import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.dependencies import get_current_user
from app.models.merchant import Merchant
from app.schemas.stylist import ChatRequest, SubmitAnswersRequest, StylistResponse
from app.services import stylist_service

router = APIRouter(prefix="/api/stylist", tags=["Personal Stylist"])


@router.post("/chat", response_model=StylistResponse)
def chat(
    request: ChatRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Send a chat message to the stylist agent."""
    result = stylist_service.chat(request.threadId, request.message)
    return {"success": True, "data": result}


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Stream chat responses via SSE."""
    async def event_generator():
        try:
            async for event in stylist_service.chat_stream(
                request.threadId, request.message
            ):
                yield f"data: {json.dumps(event)}\n\n"

            # Send final state
            final_state = stylist_service.get_state(request.threadId)
            yield f"data: {json.dumps({'type': 'complete', **final_state})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/answers", response_model=StylistResponse)
def submit_answers(
    request: SubmitAnswersRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Submit UI component answers."""
    result = stylist_service.submit_answers(request.threadId, request.answers)
    return {"success": True, "data": result}


@router.post("/answers/stream")
async def submit_answers_stream(
    request: SubmitAnswersRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Stream answer submission responses via SSE."""
    async def event_generator():
        try:
            async for event in stylist_service.submit_answers_stream(
                request.threadId, request.answers
            ):
                yield f"data: {json.dumps(event)}\n\n"

            final_state = stylist_service.get_state(request.threadId)
            yield f"data: {json.dumps({'type': 'complete', **final_state})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/state/{thread_id}", response_model=StylistResponse)
def get_state(
    thread_id: str,
    current_user: Merchant = Depends(get_current_user)
):
    """Get current session state."""
    result = stylist_service.get_state(thread_id)
    return {"success": True, "data": result}
