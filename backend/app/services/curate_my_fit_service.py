"""Service layer for curate-my-fit integration with PersonalStylist agent."""
import uuid
import json
import logging
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

# Configure logger
logger = logging.getLogger(__name__)


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
    logger.info(f"Calling PersonalStylist agent with message: {message[:100]}...")

    # Use async invocation to support async tools (Txt2ImgGenerator)
    result = await _chat_async(stylist_agent, message, thread_id)
    logger.info(f"Agent result keys: {result.keys()}")
    logger.debug(f"Agent result: {result}")

    # Parse BatchResponse from agent output
    batch_response = _parse_batch_response(result, search_query, image_urls)
    logger.info(f"Parsed batch response with {len(batch_response['questions'])} questions")

    return {
        "threadId": thread_id,
        "blurb": batch_response["blurb"],
        "questions": batch_response["questions"],
        "summaryUpdates": batch_response["summaryUpdates"],
        "imageUrls": image_urls,
    }


async def submit_batch_answers(
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

    # Submit answers to PersonalStylist agent (async to support async tools)
    result = await _submit_answers_async(stylist_agent, thread_id, user_responses)

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

async def _chat_async(agent, message: str, thread_id: str, personality: str = 'friendly') -> dict:
    """
    Async wrapper for PersonalStylist agent chat.

    Uses ainvoke() to support async tools like Txt2ImgGenerator.
    """
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": agent.recursion_limit}
    return await agent.agent.ainvoke({"messages": [("user", message)], "personality": personality}, config=config)


async def _submit_answers_async(agent, thread_id: str, answers: list, personality: str = 'friendly') -> dict:
    """
    Async wrapper for PersonalStylist agent answer submission.

    Uses ainvoke() to support async tools.
    """
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": agent.recursion_limit}
    return await agent.agent.ainvoke({"ui_answers": answers, "personality": personality}, config=config)


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
    # Extract UI inputs from agent result (correct key is 'ui_inputs' not 'uiInputs')
    ui_inputs = result.get("ui_inputs", [])
    journey = result.get("journey")

    logger.debug(f"Extracted {len(ui_inputs)} UI inputs from agent result")
    logger.debug(f"Journey data: {journey}")

    # Generate blurb from agent message or create generic one
    messages = result.get("messages", [])
    blurb = _extract_blurb_from_messages(messages, search_query)
    logger.debug(f"Extracted blurb: {blurb[:100]}...")

    # Convert UI inputs to questions
    questions = _convert_ui_inputs_to_questions(ui_inputs)
    logger.debug(f"Converted {len(questions)} questions")

    # Extract summary updates from journey
    summary_updates = _extract_summary_updates(journey, search_query)
    logger.debug(f"Summary updates: {summary_updates}")

    return {
        "blurb": blurb,
        "questions": questions,
        "summaryUpdates": summary_updates,
    }


def _extract_blurb_from_messages(messages: list, search_query: Optional[str]) -> str:
    """Extract blurb from agent messages or generate default."""
    # Find last AI message
    for msg in reversed(messages):
        # Check if it's a Pydantic BaseMessage object
        if hasattr(msg, "type") and msg.type == "ai":
            # Extract text content
            if hasattr(msg, "content") and isinstance(msg.content, str):
                return msg.content
        # Check if it's a dict representation
        elif isinstance(msg, dict):
            msg_type = msg.get("type")
            # LangChain also uses "AIMessage" as class name in serialization
            if msg_type == "ai" or msg.get("__class__") == "AIMessage":
                content = msg.get("content", "")
                if isinstance(content, str) and content:
                    return content

    # Default blurb if no AI message found
    if search_query:
        return f"Let's curate your perfect look! I see you're looking for {search_query}."
    return "Let's get started on creating your perfect outfit!"


def _convert_ui_inputs_to_questions(ui_inputs: list) -> list[dict]:
    """
    Convert agent UI inputs to QuestionSchema format.

    Args:
        ui_inputs: List of UIInput Pydantic models from agent

    Returns:
        List of question dicts compatible with frontend QuestionSchema
    """
    questions = []

    for ui_input in ui_inputs:
        # Access Pydantic model attributes directly (not .get())
        question = {
            "id": ui_input.id if ui_input.id else str(uuid.uuid4()),
            "type": _map_ui_type_to_frontend(ui_input.type),
            "question": ui_input.question,
            "rowLabel": ui_input.question,  # Use question as row label
            "required": True,  # All questions required by default
            "options": [],
        }

        # Map image_options (ImageOption Pydantic models)
        if ui_input.image_options:
            question["options"] = [
                {
                    "label": opt.label,
                    "value": opt.id if opt.id else opt.label.lower().replace(" ", "-"),
                    "imageUrl": str(opt.image_path) if opt.image_path else None,
                }
                for opt in ui_input.image_options
            ]

        # Map text_options (list of strings)
        elif ui_input.text_options:
            question["options"] = [
                {
                    "label": text,
                    "value": text.lower().replace(" ", "-"),
                }
                for text in ui_input.text_options
            ]

        # Map colour_hex_options (list of hex strings)
        elif ui_input.colour_hex_options:
            question["options"] = [
                {
                    "label": hex_color,
                    "value": hex_color,
                }
                for hex_color in ui_input.colour_hex_options
            ]

        # Add type-specific fields for scale-rating
        if ui_input.type.value == "scale_rating":
            question["minLabel"] = ui_input.min_label
            question["maxLabel"] = ui_input.max_label

        questions.append(question)

    return questions


def _map_ui_type_to_frontend(ui_type) -> str:
    """
    Map agent UIInputType enum to frontend question type string.

    Args:
        ui_type: UIInputType enum value

    Returns:
        Frontend-compatible type string
    """
    # Handle enum - get the value
    if hasattr(ui_type, 'value'):
        type_value = ui_type.value
    else:
        type_value = str(ui_type)

    # Map agent types to frontend types
    type_mapping = {
        "image_choice": "image-select",
        "colour_palette": "color-picker",
        "multi_select": "multi-select",
        "single_select": "single-choice",
        "scale_rating": "scale-rating",
        "free_text": "free-text",
    }

    return type_mapping.get(type_value, "free-text")


def _extract_summary_updates(journey, search_query: Optional[str]) -> dict:
    """
    Extract summary updates from journey state.

    Args:
        journey: JourneySchema Pydantic model or None
        search_query: Original search query for fallback title

    Returns:
        dict with title, foundations (SummaryFoundations schema), narrative
    """
    if not journey:
        return {
            "title": "Your Journey",
            "foundations": {
                "location": None,
                "style": None,
                "age": None,
                "sizing": None,
                "occasion": None,
            },
            "narrative": "Let's create something amazing together!",
        }

    # Handle both Pydantic model and dict
    if hasattr(journey, 'model_dump'):
        journey_dict = journey.model_dump()
    elif isinstance(journey, dict):
        journey_dict = journey
    else:
        journey_dict = {}

    # Initialize foundations with all fields (matching SummaryFoundations schema)
    foundations = {
        "location": None,
        "style": None,
        "age": None,
        "sizing": None,
        "occasion": None,
    }

    # Extract foundation data (convert enums to strings)
    if journey_dict.get("location"):
        location = journey_dict["location"]
        foundations["location"] = location.value if hasattr(location, 'value') else str(location)

    if journey_dict.get("occasion"):
        occasion = journey_dict["occasion"]
        foundations["occasion"] = occasion.value if hasattr(occasion, 'value') else str(occasion)

    if journey_dict.get("season"):
        season = journey_dict["season"]
        # Season doesn't map to foundations schema, so skip it
        pass

    if journey_dict.get("style_preferences"):
        styles = journey_dict["style_preferences"]
        # Convert enum list to strings and take first 2
        style_strs = [s.value if hasattr(s, 'value') else str(s) for s in styles[:2]]
        foundations["style"] = ", ".join(style_strs) if style_strs else None

    return {
        "title": journey_dict.get("title", "Your Journey"),
        "foundations": foundations,
        "narrative": journey_dict.get("summary", "Building your perfect look..."),
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
    """
    Create Journey record from agent output.

    Args:
        db: Database session
        consumer_id: Consumer ID from auth token
        journey_data: Journey data from agent (Pydantic model or dict)
        thread_id: Thread ID for extracting search query/images

    Returns:
        Journey: Created journey record
    """
    # Convert Pydantic model to dict if needed
    if hasattr(journey_data, 'model_dump'):
        journey_dict = journey_data.model_dump()
    elif isinstance(journey_data, dict):
        journey_dict = journey_data
    else:
        journey_dict = {}

    # Extract search query and image URLs from thread state if available
    state = stylist_agent.get_state(thread_id)
    messages = []

    # Handle both StateSnapshot and dict
    if state:
        if hasattr(state, 'values'):
            # StateSnapshot object
            messages = state.values.get("messages", [])
        elif isinstance(state, dict):
            # Dict representation
            messages = state.get("messages", [])

    # Try to extract search query from first message
    search_query = None
    image_urls = []
    if messages:
        first_msg = messages[0]
        content = None

        # Extract content from message
        if hasattr(first_msg, "content"):
            content = first_msg.content
        elif isinstance(first_msg, dict):
            content = first_msg.get("content", "")

        # Parse content for search query and images
        if content and isinstance(content, str):
            if "User search query:" in content:
                lines = content.split("\n")
                search_query = lines[0].replace("User search query:", "").strip()
            if "User uploaded" in content and "images:" in content:
                try:
                    image_urls = json.loads(content.split("images:")[1].strip())
                except:
                    pass

    journey = Journey(
        id=str(uuid.uuid4()),
        consumer_id=consumer_id,
        title=journey_dict.get("title", "Untitled Journey"),
        status="active",
        status_color="#10B981",  # Green
        status_label="Active",
        summary=journey_dict.get("summary"),
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
