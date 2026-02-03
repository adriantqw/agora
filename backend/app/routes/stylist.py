import json
from typing import Optional

from fastapi import APIRouter, Depends, Form
from fastapi import UploadFile
from fastapi.responses import StreamingResponse

from app.dependencies import get_current_user, get_current_consumer
from app.models.merchant import Merchant
from app.models.consumer import Consumer
from app.schemas.stylist import ChatRequest, SubmitAnswersRequest, StylistResponse
from app.services import stylist_service

router = APIRouter(prefix="/api/stylist", tags=["Personal Stylist"])


@router.post("/chat", response_model=StylistResponse)
def chat(
    request: ChatRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Send a chat message to stylist agent (merchant endpoint)."""
    result = stylist_service.chat(request.threadId, request.message)
    return {"success": True, "data": result}


@router.post("/consumer/chat", response_model=StylistResponse)
def consumer_chat(
    request: ChatRequest,
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Send a chat message to stylist agent (consumer endpoint)."""
    result = stylist_service.chat(request.threadId, request.message)
    return {"success": True, "data": result}


@router.post("/consumer/chat-form", response_model=StylistResponse)
def consumer_chat_form(
    message: str = Form(...),
    images: list[UploadFile] = Form(default=[]),
    threadId: Optional[str] = Form(None),
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Send chat with images to stylist agent (consumer endpoint)."""
    result = stylist_service.chat_with_images(threadId or "", message, images)
    return {"success": True, "data": result}


@router.post("/consumer/chat-form/stream")
async def consumer_chat_form_stream(
    message: str = Form(...),
    images: list[UploadFile] = Form(default=[]),
    threadId: Optional[str] = Form(None),
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Stream chat with images responses via SSE (consumer endpoint)."""
    async def event_generator():
        try:
            async for event in stylist_service.chat_with_images_stream(
                threadId or "", message, images
            ):
                yield f"data: {json.dumps(event)}\n\n"

            final_state = stylist_service.get_state(threadId or "")
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
    """Submit UI component answers (merchant endpoint)."""
    result = stylist_service.submit_answers(request.threadId, request.answers)
    return {"success": True, "data": result}


@router.post("/consumer/answers", response_model=StylistResponse)
def consumer_submit_answers(
    request: SubmitAnswersRequest,
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Submit UI component answers (consumer endpoint)."""
    result = stylist_service.submit_answers(request.threadId, request.answers)
    return {"success": True, "data": result}


@router.post("/answers/stream")
async def submit_answers_stream(
    request: SubmitAnswersRequest,
    current_user: Merchant = Depends(get_current_user)
):
    """Stream answer submission responses via SSE (merchant endpoint)."""
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


@router.post("/consumer/answers/stream")
async def consumer_submit_answers_stream(
    request: SubmitAnswersRequest,
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Stream answer submission responses via SSE (consumer endpoint)."""
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
    """Get current session state (merchant endpoint)."""
    result = stylist_service.get_state(thread_id)
    return {"success": True, "data": result}


@router.get("/consumer/state/{thread_id}", response_model=StylistResponse)
def consumer_get_state(
    thread_id: str,
    current_consumer: Consumer = Depends(get_current_consumer)
):
    """Get current session state (consumer endpoint)."""
    result = stylist_service.get_state(thread_id)
    return {"success": True, "data": result}
