from datetime import datetime
import os
import asyncio
from pathlib import Path

from agent.src.agents.personal_stylist.core import PersonalStylistAgent
from agent.src.agents.personal_stylist.schemas import UserResponse
from app.services.storage_service import storage_service

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


async def _upload_temp_images_async(ui_inputs: list) -> list:
    """Upload temporary image files to R2 and update paths with public URLs."""
    if not ui_inputs:
        return ui_inputs

    for ui_input in ui_inputs:
        # Check if this UI input has image_options
        if isinstance(ui_input, dict) and ui_input.get("image_options"):
            for image_option in ui_input["image_options"]:
                image_path = image_option.get("image_path", "")

                # Check if this is a temp file path (contains /tmp/ or img-gen- pattern)
                if image_path and os.path.exists(image_path) and ("/tmp/" in image_path or "img-gen-" in image_path):
                    try:
                        # Upload to R2
                        result = await storage_service.upload_file_from_path(
                            image_path,
                            folder="generated-images"
                        )

                        if "url" in result:
                            # Replace temp path with R2 URL
                            image_option["image_path"] = result["url"]

                            # Clean up temp file
                            try:
                                os.remove(image_path)
                            except Exception:
                                pass
                    except Exception as e:
                        # Log error but don't fail the request
                        print(f"Failed to upload temp image {image_path}: {e}")

    return ui_inputs


def _upload_temp_images(ui_inputs: list) -> list:
    """Synchronous wrapper for uploading temp images."""
    # Use nest_asyncio to handle nested event loops properly
    import nest_asyncio
    nest_asyncio.apply()
    return asyncio.run(_upload_temp_images_async(ui_inputs))


def _format_response(thread_id: str, state: dict) -> dict:
    """Format state for API response."""
    journey = state.get("journey")
    # ui_inputs is now a nested list [[batch1], [batch2], ...] - get the latest batch
    ui_inputs_batches = state.get("ui_inputs", [])
    latest_batch = ui_inputs_batches[-1] if ui_inputs_batches else []

    # Convert to dicts if they're Pydantic models
    latest_batch_dicts = []
    for ui in latest_batch:
        if hasattr(ui, "model_dump"):
            latest_batch_dicts.append(ui.model_dump())
        else:
            latest_batch_dicts.append(ui)

    # Upload temp images to R2 and replace paths with public URLs
    latest_batch_dicts = _upload_temp_images(latest_batch_dicts)

    return {
        "threadId": thread_id,
        "journey": journey.model_dump() if journey else None,
        "uiInputs": latest_batch_dicts
    }


def _format_stream_event(event: dict) -> dict:
    """Format streaming event."""
    # Extract metadata from LangGraph event
    return {
        "type": "progress",
        "thinkingMessage": event.get("thinking"),
        "timestamp": datetime.utcnow().isoformat()
    }
