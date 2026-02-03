from datetime import datetime
from typing import Optional
from fastapi import UploadFile

from agent.src.agents.personal_stylist.core import PersonalStylistAgent
from agent.src.agents.personal_stylist.schemas import UserResponse

# Initialize agent (singleton)
stylist_agent = PersonalStylistAgent()


def chat(thread_id: str, message: str) -> dict:
    """Synchronous chat - returns final state."""
    result = stylist_agent.chat(message, thread_id)
    return _format_response(thread_id, result)


async def chat_stream(thread_id: str, message: str):
    """Async streaming chat - yields events."""
    async for event in await stylist_agent.chat_stream(message, thread_id):
        yield _format_stream_event(event)


def submit_answers(thread_id: str, answers: list[UserResponse]) -> dict:
    """Submit UI answers - returns updated state."""
    result = stylist_agent.submit_answers(thread_id, answers)
    return _format_response(thread_id, result)


async def submit_answers_stream(thread_id: str, answers: list[UserResponse]):
    """Async streaming answer submission."""
    async for event in await stylist_agent.submit_answers_stream(thread_id, answers):
        yield _format_stream_event(event)


def get_state(thread_id: str) -> dict:
    """Get current session state."""
    state = stylist_agent.get_state(thread_id)
    return _format_response(thread_id, state.values if state else {})


def _format_response(thread_id: str, state: dict) -> dict:
    """Format state for API response."""
    journey = state.get("journey")
    ui_inputs = state.get("ui_inputs", [])

    return {
        "threadId": thread_id,
        "journey": journey.model_dump() if journey else None,
        "uiInputs": [ui.model_dump() for ui in ui_inputs] if ui_inputs else []
    }


def chat_with_images(thread_id: str, message: str, images: list[UploadFile]) -> dict:
    """Chat with images - returns final state."""
    result = stylist_agent.chat(message, thread_id)
    return _format_response(thread_id, result)


async def chat_with_images_stream(thread_id: str, message: str, images: list[UploadFile]):
    """Async streaming chat with images - yields events."""
    async for event in await stylist_agent.chat_stream(message, thread_id):
        yield _format_stream_event(event)


def _format_stream_event(event: dict) -> dict:
    """Format streaming event."""
    # Extract metadata from LangGraph event
    return {
        "type": "progress",
        "thinkingMessage": event.get("thinking"),
        "timestamp": datetime.utcnow().isoformat()
    }
