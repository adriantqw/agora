"""Service layer for curate-my-fit integration with PersonalStylist agent."""
import uuid
import json
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile

from agent.src.agents.personal_stylist.core import PersonalStylistAgent
from app.schemas.curate_my_fit import (
    BatchResponse,
    QuestionSchema,
    SummaryUpdates,
    AnswerData,
)
from app.services.storage_service import storage_service
from app.models.journey import Journey
from app.models.consumer import Consumer


# Initialize agent (singleton)
stylist_agent = PersonalStylistAgent()


async def start_batch(
    db: Session,
    consumer_id: str,
    search_query: str,
    images: list[UploadFile]
) -> dict:
    """
    Start a new batch session with search query and images.

    Args:
        db: Database session
        consumer_id: Consumer ID from auth token
        search_query: User's search query
        images: List of uploaded images (up to 5)

    Returns:
        dict with threadId, blurb, questions, summaryUpdates, imageUrls
    """
    # Upload images to R2
    image_urls = []
    if images and len(images) > 0:
        upload_result = await storage_service.upload_search_images(images)
        if "error" in upload_result:
            raise ValueError(upload_result["error"])
        image_urls = upload_result["urls"]

    # Generate unique thread ID
    thread_id = f"curate_{uuid.uuid4()}"

    # Call PersonalStylist agent with search query + images
    message = _format_initial_message(search_query, image_urls)
    result = stylist_agent.chat(message, thread_id)

    # Parse BatchResponse from agent output
    batch_response = _parse_batch_response(result, search_query, image_urls)

    return {
        "threadId": thread_id,
        "blurb": batch_response["blurb"],
        "questions": batch_response["questions"],
        "summaryUpdates": batch_response["summaryUpdates"],
        "imageUrls": image_urls,
    }


def submit_batch_answers(
    db: Session,
    consumer_id: str,
    thread_id: str,
    answers: dict[str, AnswerData]
) -> dict:
    """
    Submit batch answers to PersonalStylist agent.

    Args:
        db: Database session
        consumer_id: Consumer ID from auth token
        thread_id: Thread ID from start_batch
        answers: Dictionary of questionId -> AnswerData

    Returns:
        dict with hasMore, and either next batch or final journey
    """
    # Convert answers to UserResponse format expected by agent
    user_responses = _convert_answers_to_user_response(answers)

    # Submit answers to PersonalStylist agent
    result = stylist_agent.submit_answers(thread_id, user_responses)

    # Check if journey is complete
    journey = result.get("journey")
    if journey and _is_journey_complete(journey):
        # Create Journey record in database
        journey_obj = _create_journey_from_agent(db, consumer_id, journey, thread_id)

        return {
            "hasMore": False,
            "journeyId": journey_obj.id,
            "journey": _format_journey(journey_obj),
            "nextStep": {
                "action": "matchmaker",
                "url": f"/matchmaker?journeyId={journey_obj.id}"
            }
        }
    else:
        # Generate next batch
        batch_response = _parse_batch_response(result, None, None)

        return {
            "hasMore": True,
            "blurb": batch_response["blurb"],
            "questions": batch_response["questions"],
            "summaryUpdates": batch_response["summaryUpdates"],
        }


def get_state(thread_id: str) -> dict:
    """
    Retrieve session state (PLACEHOLDER for future autosave).

    Args:
        thread_id: Thread ID from start_batch

    Returns:
        dict with threadId, answers, lastUpdated, expiresAt
    """
    # TODO: Implement autosave/resume functionality
    # Should return: { threadId, answers, lastUpdated, expiresAt }
    state = stylist_agent.get_state(thread_id)
    if not state:
        raise ValueError(f"Session {thread_id} not found or expired")

    return {
        "threadId": thread_id,
        "answers": {},  # TODO: Extract from state
        "lastUpdated": "",  # TODO: Get from state metadata
        "expiresAt": "",  # TODO: Calculate expiration
    }


# Helper functions

def _format_initial_message(search_query: str, image_urls: list[str]) -> str:
    """Format initial message for agent with search query and images."""
    message = f"User search query: {search_query}"
    if image_urls:
        message += f"\n\nUser uploaded {len(image_urls)} images: {json.dumps(image_urls)}"
    return message


def _parse_batch_response(result: dict, search_query: Optional[str], image_urls: Optional[list[str]]) -> dict:
    """
    Parse agent result into BatchResponse format.

    Args:
        result: Agent result with journey, ui_inputs, etc.
        search_query: Original search query (for first batch)
        image_urls: Uploaded image URLs (for first batch)

    Returns:
        dict with blurb, questions, summaryUpdates
    """
    # Extract UI inputs from agent result
    ui_inputs = result.get("uiInputs", [])
    journey = result.get("journey")

    # Generate blurb from agent message or create generic one
    messages = result.get("messages", [])
    blurb = _extract_blurb_from_messages(messages, search_query)

    # Convert UI inputs to questions
    questions = _convert_ui_inputs_to_questions(ui_inputs)

    # Extract summary updates from journey
    summary_updates = _extract_summary_updates(journey, search_query)

    return {
        "blurb": blurb,
        "questions": questions,
        "summaryUpdates": summary_updates,
    }


def _extract_blurb_from_messages(messages: list, search_query: Optional[str]) -> str:
    """Extract blurb from agent messages or generate default."""
    # Find last AI message
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "ai":
            # Extract text content
            if hasattr(msg, "content") and isinstance(msg.content, str):
                return msg.content

    # Default blurb if no AI message found
    if search_query:
        return f"Let's curate your perfect look! I see you're looking for {search_query}."
    return "Let's get started on creating your perfect outfit!"


def _convert_ui_inputs_to_questions(ui_inputs: list) -> list[dict]:
    """Convert agent UI inputs to QuestionSchema format."""
    questions = []
    for ui_input in ui_inputs:
        question = {
            "id": ui_input.get("question_id", str(uuid.uuid4())),
            "type": ui_input.get("type", "free-text"),
            "question": ui_input.get("question", ""),
            "rowLabel": ui_input.get("label", ""),
            "required": ui_input.get("required", True),
            "options": [],
        }

        # Convert options if present
        if "options" in ui_input:
            question["options"] = [
                {
                    "label": opt.get("label", ""),
                    "value": opt.get("value", ""),
                    "imageUrl": opt.get("image_url"),
                    "iconName": opt.get("icon_name"),
                    "description": opt.get("description"),
                }
                for opt in ui_input["options"]
            ]

        # Add type-specific fields
        if ui_input.get("type") == "free-text":
            question["placeholder"] = ui_input.get("placeholder")
        elif ui_input.get("type") == "dual-range":
            question["minValue"] = ui_input.get("min_value")
            question["maxValue"] = ui_input.get("max_value")
            question["unit"] = ui_input.get("unit")
        elif ui_input.get("type") == "multi-select":
            question["multiSelect"] = True

        questions.append(question)

    return questions


def _extract_summary_updates(journey: Optional[dict], search_query: Optional[str]) -> dict:
    """Extract summary updates from journey state."""
    if not journey:
        return {
            "title": "Your Journey",
            "foundations": {},
            "narrative": "Let's create something amazing together!",
        }

    foundations = {}
    if journey.get("location"):
        foundations["location"] = journey["location"]
    if journey.get("occasion"):
        foundations["occasion"] = journey["occasion"]
    if journey.get("season"):
        foundations["season"] = journey["season"]
    if journey.get("style_preferences"):
        foundations["style"] = ", ".join(journey["style_preferences"][:2])  # First 2 styles

    return {
        "title": journey.get("title", "Your Journey"),
        "foundations": foundations,
        "narrative": journey.get("summary", "Building your perfect look..."),
    }


def _convert_answers_to_user_response(answers: dict[str, AnswerData]) -> list:
    """Convert frontend answers to UserResponse format for agent."""
    user_responses = []
    for question_id, answer_data in answers.items():
        response = {
            "question_id": question_id,
            "timestamp": answer_data.timestamp or 0,
        }

        # Add answer data based on type
        if answer_data.selectedOptions:
            response["selected_options"] = answer_data.selectedOptions
        if answer_data.freeText:
            response["free_text"] = answer_data.freeText
        if answer_data.minValue is not None:
            response["min_value"] = answer_data.minValue
        if answer_data.maxValue is not None:
            response["max_value"] = answer_data.maxValue

        user_responses.append(response)

    return user_responses


def _is_journey_complete(journey: dict) -> bool:
    """Check if journey has enough information to be complete."""
    # Journey is complete if it has core attributes filled
    required_fields = ["title", "occasion", "season"]
    return all(journey.get(field) for field in required_fields)


def _create_journey_from_agent(
    db: Session,
    consumer_id: str,
    journey_data: dict,
    thread_id: str
) -> Journey:
    """Create Journey record from agent output."""
    # Extract search query and image URLs from thread state if available
    state = stylist_agent.get_state(thread_id)
    messages = state.values.get("messages", []) if state else []

    # Try to extract search query from first message
    search_query = None
    image_urls = []
    if messages:
        first_msg = messages[0]
        if hasattr(first_msg, "content"):
            content = first_msg.content
            if "User search query:" in content:
                lines = content.split("\n")
                search_query = lines[0].replace("User search query:", "").strip()
            if "User uploaded" in content and "images:" in content:
                import json
                try:
                    image_urls = json.loads(content.split("images:")[1].strip())
                except:
                    pass

    journey = Journey(
        id=str(uuid.uuid4()),
        consumer_id=consumer_id,
        title=journey_data.get("title", "Untitled Journey"),
        status="active",
        status_color="#10B981",  # Green
        status_label="Active",
        summary=journey_data.get("summary"),
        search_query=search_query,
        image_urls=image_urls,
    )

    db.add(journey)
    db.commit()
    db.refresh(journey)

    return journey


def _format_journey(journey: Journey) -> dict:
    """Format Journey object for API response."""
    return {
        "id": journey.id,
        "consumerId": journey.consumer_id,
        "title": journey.title,
        "status": journey.status,
        "statusColor": journey.status_color,
        "statusLabel": journey.status_label,
        "summary": journey.summary,
        "searchQuery": journey.search_query,
        "imageUrls": journey.image_urls,
        "closetUrl": journey.closet_url,
        "createdAt": journey.created_at.isoformat() if journey.created_at else None,
        "updatedAt": journey.updated_at.isoformat() if journey.updated_at else None,
    }
