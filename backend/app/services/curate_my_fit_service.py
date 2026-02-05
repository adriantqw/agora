"""Service layer for curate-my-fit integration with PersonalStylist agent."""
import uuid
import json
import logging
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile

from agent.src.agents.personal_stylist.core import PersonalStylistAgent
from agent.src.agents.personal_stylist.schemas import UserResponse
from app.schemas.curate_my_fit import (
    BatchResponse,
    QuestionSchema,
    SummaryUpdates,
    AnswerData,
)
from app.services.storage_service import storage_service
from app.models.journey import Journey
from app.models.consumer import Consumer
from app.models.curate_my_fit import CurateMyFitQuestion

# Configure logger
logger = logging.getLogger(__name__)


# Initialize agent (singleton)
stylist_agent = PersonalStylistAgent()


# Database helper functions for question tracking

def _get_sent_question_signatures(db: Session, thread_id: str) -> set[str]:
    """
    Retrieve all question signatures that have been sent for this thread.

    Args:
        db: Database session
        thread_id: Agent thread ID

    Returns:
        Set of question signatures (type:question_text format)
    """
    questions = db.query(CurateMyFitQuestion.question_signature).filter(
        CurateMyFitQuestion.thread_id == thread_id
    ).all()

    signatures = {q[0] for q in questions if q[0]}
    logger.info(f"Retrieved {len(signatures)} existing question signatures from DB for thread {thread_id}")
    return signatures


def _store_questions(db: Session, thread_id: str, questions: list[dict]) -> None:
    """
    Store questions in database to track what's been sent.

    Args:
        db: Database session
        thread_id: Agent thread ID
        questions: List of question dicts from frontend
    """
    for question in questions:
        question_id = question.get("id")
        question_signature = _get_question_signature(question)

        if question_signature:
            # Check if question already exists (avoid duplicates)
            existing = db.query(CurateMyFitQuestion).filter(
                CurateMyFitQuestion.thread_id == thread_id,
                CurateMyFitQuestion.question_id == question_id
            ).first()

            if not existing:
                # Create new question record
                question_record = CurateMyFitQuestion(
                    id=str(uuid.uuid4()),
                    thread_id=thread_id,
                    question_id=question_id,
                    question_signature=question_signature,
                    question_data=question  # Store full question for debugging
                )
                db.add(question_record)
                logger.debug(f"Stored question {question_id} with signature {question_signature}")

    db.commit()
    logger.info(f"Stored {len(questions)} questions in DB for thread {thread_id}")


def _link_thread_to_journey(db: Session, thread_id: str, journey_id: str) -> None:
    """
    Link agent thread to completed journey.

    Args:
        db: Database session
        thread_id: Agent thread ID
        journey_id: Journey ID
    """
    # Update Journey record with thread_id
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if journey:
        # Use setattr for Column assignment
        setattr(journey, 'thread_id', thread_id)

    # Update all question records with journey_id
    db.query(CurateMyFitQuestion).filter(
        CurateMyFitQuestion.thread_id == thread_id
    ).update({"journey_id": journey_id})

    db.commit()
    logger.info(f"Linked thread {thread_id} to journey {journey_id}")


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
    image_types = []
    if images and len(images) > 0:
        upload_result = await storage_service.upload_search_images(images)
        if "error" in upload_result:
            raise ValueError(upload_result["error"])
        image_urls = [img["url"] for img in upload_result["urls"]]
        image_types = [img.get("type") for img in upload_result["urls"]]

    # Generate unique thread ID
    thread_id = f"curate_{uuid.uuid4()}"

    # Call PersonalStylist agent with search query + images
    message = _format_initial_message(search_query, image_urls)
    logger.info(f"Calling PersonalStylist agent with message: {message[:100]}...")

    # Use async invocation to support async tools (Txt2ImgGenerator)
    logger.info("="*60)
    logger.info("START_BATCH - START")
    logger.info(f"Thread ID: {thread_id}")
    logger.info(f"Search query: {search_query}")
    logger.info(f"Image URLs: {image_urls}")
    
    result = await _chat_async(stylist_agent, message, thread_id)
    logger.info(f"Agent result keys: {result.keys()}")
    logger.info(f"Agent result: {json.dumps(result, indent=2, default=str)}")

    # Sanitize result to convert PosixPath objects to strings for JSON serialization
    result = _sanitize_for_json(result)

    # Parse BatchResponse from agent output (no filtering needed for initial batch)
    batch_response = _parse_batch_response(result, search_query, image_urls)
    logger.info(f"Parsed initial batch with {len(batch_response['questions'])} questions")

    # Store questions in database for tracking
    if batch_response["questions"]:
        _store_questions(db, thread_id, batch_response["questions"])

    logger.info(f"RETURNING TO FRONTEND:")
    logger.info(f"  threadId: {thread_id}")
    logger.info(f"  questions count: {len(batch_response['questions'])}")
    logger.info("START_BATCH - END")
    logger.info("="*60)

    return {
        "threadId": thread_id,
        "blurb": batch_response["blurb"],
        "questions": batch_response["questions"],
        "summaryUpdates": batch_response["summaryUpdates"],
        "imageUrls": image_urls,
        "imageTypes": image_types,
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
    logger.info("="*60)
    logger.info("SUBMIT_BATCH_ANSERS - START")
    logger.info(f"Thread ID: {thread_id}")
    logger.info(f"Answers submitted: {list(answers.keys())}")

    # Get existing question signatures from DATABASE (not agent state)
    existing_signatures = _get_sent_question_signatures(db, thread_id)

    # Convert answers to UserResponse format expected by agent
    user_responses = _convert_answers_to_user_response(answers)
    logger.info(f"Converted to {len(user_responses)} UserResponse objects")

    # Submit answers to PersonalStylist agent (async to support async tools)
    result = await _submit_answers_async(stylist_agent, thread_id, user_responses)
    logger.info("Agent invocation completed")
    logger.info(f"Agent result keys: {result.keys()}")
    logger.info(f"Agent result: {json.dumps(result, indent=2, default=str)}")

    # Sanitize result to convert PosixPath objects to strings for JSON serialization
    result = _sanitize_for_json(result)

    # Check if journey is complete
    # Only complete if agent has NO more questions AND journey data is sufficient
    batch_response = _parse_batch_response(result, None, None)
    all_questions = batch_response["questions"]

    # Filter out duplicate questions based on DB signatures
    new_questions = [
        q for q in all_questions
        if _get_question_signature(q) not in existing_signatures
    ]

    filtered_count = len(all_questions) - len(new_questions)
    if filtered_count > 0:
        logger.info(f"Filtered out {filtered_count} duplicate questions (based on DB)")

    journey = result.get("journey")
    if journey and _is_journey_complete(journey) and not new_questions:
        logger.info("JOURNEY COMPLETE - creating Journey record")

        # Create Journey record
        journey_obj = _create_journey_from_agent(db, consumer_id, journey, thread_id)

        # Link thread to journey
        _link_thread_to_journey(db, thread_id, journey_obj.id)

        logger.info("SUBMIT_BATCH_ANSERS - END (journey complete)")
        logger.info("="*60)
        # Create Journey record in database
        journey_obj = _create_journey_from_agent(db, consumer_id, journey, thread_id)

        return {
            "hasMore": False,
            "journeyId": journey_obj.id,
            "journey": _format_journey(journey_obj),
        }
    else:
        # Store new questions in database
        if new_questions:
            _store_questions(db, thread_id, new_questions)

        # Generate next batch
        logger.info(f"RETURNING TO FRONTEND:")
        logger.info(f"  hasMore: True")
        logger.info(f"  questions count: {len(new_questions)}")
        logger.info("SUBMIT_BATCH_ANSERS - END (more questions)")
        logger.info("="*60)

        return {
            "hasMore": True,
            "blurb": batch_response["blurb"],
            "questions": new_questions,
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

def _get_mime_type_from_path(file_path: str) -> Optional[str]:
    """
    Extract MIME type from file path.

    Args:
        file_path: File path or URL

    Returns:
        MIME type string or None
    """
    if not file_path:
        return None

    # Extract extension
    ext = file_path.rsplit('.', 1)[-1].lower() if '.' in file_path else None

    # Map to MIME type
    mime_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "gif": "image/gif",
    }

    return mime_map.get(ext)


def _get_question_signature(ui_input) -> str:
    """
    Create a content-based signature for a question to detect duplicates.
    Uses type + question text to identify similar questions.

    Args:
        ui_input: UIInput from agent state OR question dict from _convert_ui_inputs_to_questions

    Returns:
        String signature for this question
    """
    # Extract type (handles both agent UIInput and frontend question dict)
    ui_type = None
    if hasattr(ui_input, 'type'):
        ui_type = ui_input.type
    elif isinstance(ui_input, dict):
        ui_type = ui_input.get('type')

    # Extract question text (agent uses 'question', frontend dict uses 'question' or 'rowLabel')
    question_text = None
    if hasattr(ui_input, 'question'):
        question_text = ui_input.question
    elif isinstance(ui_input, dict):
        question_text = ui_input.get('question') or ui_input.get('rowLabel')

    # Create signature: type:question (normalized)
    if ui_type and question_text:
        type_str = ui_type.value if hasattr(ui_type, 'value') else str(ui_type)
        text_normalized = str(question_text).strip().lower()
        return f"{type_str}:{text_normalized}"

    # Fallback to empty signature if missing data
    return ""


def _extract_ui_inputs_from_state(state) -> list:
    """
    Extract ui_inputs from agent state (handles both StateSnapshot and dict).

    Args:
        state: StateSnapshot or dict from agent.get_state()

    Returns:
        List of ui_inputs (may be empty)
    """
    if not state:
        return []

    # Extract ui_inputs from state (handle both StateSnapshot and dict)
    ui_inputs = []
    if hasattr(state, 'values'):
        # StateSnapshot object
        ui_inputs = state.values.get("ui_inputs", [])
    elif isinstance(state, dict):
        # Dict representation
        ui_inputs = state.get("ui_inputs", [])

    return ui_inputs


def _get_existing_question_ids(thread_id: str) -> set[str]:
    """
    Extract question IDs from agent state that were previously sent to frontend.

    Args:
        thread_id: Thread ID from start_batch

    Returns:
        Set of question IDs that have already been sent
    """
    existing_question_ids = set()
    
    try:
        state = stylist_agent.get_state(thread_id)
        if not state:
            return existing_question_ids

        # Extract ui_inputs from state (handle both StateSnapshot and dict)
        ui_inputs = []
        if hasattr(state, 'values'):
            # StateSnapshot object
            ui_inputs = state.values.get("ui_inputs", [])
        elif isinstance(state, dict):
            # Dict representation
            ui_inputs = state.get("ui_inputs", [])

        # Extract question IDs from existing ui_inputs
        for ui_input in ui_inputs:
            if hasattr(ui_input, 'id') and ui_input.id:
                existing_question_ids.add(str(ui_input.id))
            elif isinstance(ui_input, dict):
                ui_id = ui_input.get('id')
                if ui_id:
                    existing_question_ids.add(str(ui_id))

        logger.debug(f"Found {len(existing_question_ids)} existing question IDs to filter")
    except Exception as e:
        logger.warning(f"Failed to extract existing question IDs: {e}")

    return existing_question_ids


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


def _sanitize_for_json(data):
    """
    Recursively convert PosixPath and Pydantic objects to JSON-serializable types.

    Args:
        data: Any data structure that may contain PosixPath or Pydantic objects

    Returns:
        Sanitized data with all special objects converted to JSON-serializable types
    """
    if hasattr(data, 'model_dump'):
        # Pydantic model - convert to dict with mode='json' to handle Path objects
        return _sanitize_for_json(data.model_dump(mode='json'))
    elif isinstance(data, dict):
        return {key: _sanitize_for_json(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [_sanitize_for_json(item) for item in data]
    elif hasattr(data, '__fspath__'):  # PosixPath check
        return str(data)
    else:
        return data


def _parse_batch_response(
    result: dict,
    search_query: Optional[str],
    image_urls: Optional[list[str]]
) -> dict:
    """
    Parse agent result into BatchResponse format.

    Args:
        result: Agent result with journey, ui_inputs, etc.
        search_query: Original search query (for first batch)
        image_urls: Uploaded image URLs (for first batch)

    Returns:
        dict with blurb, questions, summaryUpdates
    """
    logger.info("_PARSE_BATCH_RESPONSE - START")

    # Extract UI inputs from agent result (correct key is 'ui_inputs' not 'uiInputs')
    ui_inputs = result.get("ui_inputs", [])
    journey = result.get("journey")
    messages = result.get("messages", [])

    logger.info(f"Extracted {len(ui_inputs)} UI inputs from agent result")
    logger.info(f"Messages count: {len(messages)}")
    logger.info(f"Journey data: {json.dumps(journey, indent=2, default=str)}")

    # Check ui_inputs is nested list
    ui_inputs_list = []
    for ui_input in ui_inputs:
        logger.info(type(ui_input))
        if isinstance(ui_input, list):
            ui_inputs_list.extend(ui_input)
        elif isinstance(ui_input, dict):
            ui_inputs_list.append(ui_input)
        else:
            logger.warn(f"Skipping unsupported UI input type: {type(ui_input)}")


    # Generate blurb from agent message or create generic one
    messages = result.get("messages", [])
    blurb = _extract_blurb_from_messages(messages, search_query)
    logger.info(f"Extracted blurb: {blurb[:100]}...")

    # Convert UI inputs to questions
    questions = _convert_ui_inputs_to_questions(ui_inputs_list)
    logger.info(f"Converted {len(questions)} questions from ui_inputs")

    # Log all questions with their signatures (for debugging)
    for i, q in enumerate(questions):
        q_id = q.get("id", "N/A")
        q_type = q.get("type", "N/A")
        q_text = q.get("question", "")[:50] + ("..." if len(q.get("question", "")) > 50 else "")
        sig = _get_question_signature(q)
        logger.info(f"  Question [{i}]: ID={q_id} | Type={q_type} | Sig={sig} | Text={q_text}")

    logger.info("_PARSE_BATCH_RESPONSE - END")
    logger.info("="*60)

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
        # Helper to get field from either Pydantic model or dict
        def get_field(obj, field):
            if isinstance(obj, dict):
                return obj.get(field)
            else:
                return getattr(obj, field, None)

        # Build question dict
        ui_id = get_field(ui_input, 'id')
        ui_type = get_field(ui_input, 'type')
        ui_question = get_field(ui_input, 'question')

        question = {
            "id": str(ui_id) if ui_id else str(uuid.uuid4()),
            "type": _map_ui_type_to_frontend(ui_type),
            "question": str(ui_question) if ui_question else "",
            "rowLabel": str(ui_question) if ui_question else "",  # Use question as row label
            "required": True,  # All questions required by default
            "options": [],
        }

        # Map image_options
        image_options = get_field(ui_input, 'image_options')
        if image_options:
            question["options"] = [
                {
                    "label": str(get_field(opt, 'label') or ""),
                    "value": str(get_field(opt, 'id') or get_field(opt, 'label').lower().replace(" ", "-")),
                    "id": str(get_field(opt, 'id') or get_field(opt, 'label').lower().replace(" ", "-")),
                    "imageUrl": str(get_field(opt, 'image_path')) if get_field(opt, 'image_path') else None,
                    "imageType": _get_mime_type_from_path(str(get_field(opt, 'image_path'))) if get_field(opt, 'image_path') else None,
                }
                for opt in image_options
            ]

        # Map text_options (list of strings)
        text_options = get_field(ui_input, 'text_options')
        if text_options:
            question["options"] = [
                {
                    "label": str(text),
                    "value": str(text).lower().replace(" ", "-"),
                    "id": str(text).lower().replace(" ", "-"),  # Add explicit id field
                }
                for text in text_options
            ]

        # Map colour_hex_options (list of hex strings)
        colour_options = get_field(ui_input, 'colour_hex_options')
        if colour_options:
            question["options"] = [
                {
                    "label": str(hex_color),
                    "value": str(hex_color),
                    "id": str(hex_color),  # Add explicit id field
                }
                for hex_color in colour_options
            ]

        # Add type-specific fields for scale-rating
        type_value = ui_type.value if hasattr(ui_type, 'value') else ui_type
        if type_value == "scale_rating":
            question["minLabel"] = str(get_field(ui_input, 'min_label')) if get_field(ui_input, 'min_label') else None
            question["maxLabel"] = str(get_field(ui_input, 'max_label')) if get_field(ui_input, 'max_label') else None

        # Log detailed question information
        logger.info("="*80)
        logger.info("QUESTION DETAIL:")
        logger.info(f"  ID: {question['id']}")
        logger.info(f"  Type (mapped): {question['type']}")
        logger.info(f"  Type (original): {type_value}")
        logger.info(f"  Question: {question['question']}")
        logger.info(f"  Row Label: {question['rowLabel']}")
        logger.info(f"  Required: {question['required']}")
        logger.info(f"  Options count: {len(question['options'])}")
        if question['options']:
            for idx, opt in enumerate(question['options']):
                logger.info(f"    Option [{idx}]:")
                logger.info(f"      ID: {opt.get('id', 'N/A')}")
                logger.info(f"      Label: {opt.get('label', 'N/A')}")
                logger.info(f"      Value: {opt.get('value', 'N/A')}")
                if opt.get('imageUrl'):
                    logger.info(f"      Image URL: {opt['imageUrl']}")
        if question.get('minLabel'):
            logger.info(f"  Min Label: {question['minLabel']}")
        if question.get('maxLabel'):
            logger.info(f"  Max Label: {question['maxLabel']}")
        logger.info("="*80)

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
        "colour_palette": "color-palette",
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


def _convert_answers_to_user_response(answers: dict[str, AnswerData]) -> list[UserResponse]:
    """Convert frontend answers to UserResponse format for agent."""
    user_responses = []
    for question_id, answer_data in answers.items():
        user_response = UserResponse(
            question_id=question_id,
            selected_values=answer_data.selectedOptions or [],
            text_value=answer_data.freeText
        )
        user_responses.append(user_response)

    return user_responses


def _is_journey_complete(journey) -> bool:
    """Check if journey has enough information to be complete."""
    # Journey is complete if it has core attributes filled
    required_fields = ["title", "occasion", "season"]

    # Handle both dict and Pydantic model
    if hasattr(journey, 'model_dump'):
        # Pydantic model - use getattr
        return all(getattr(journey, field, None) for field in required_fields)
    else:
        # Dictionary - use get
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
    # Convert PosixPath objects to strings to avoid JSON serialization errors
    image_urls = journey.image_urls
    if isinstance(image_urls, list):
        image_urls = [str(url) if hasattr(url, '__fspath__') else url for url in image_urls]

    closet_url = journey.closet_url
    if closet_url and hasattr(closet_url, '__fspath__'):
        closet_url = str(closet_url)

    return {
        "id": journey.id,
        "consumerId": journey.consumer_id,
        "title": journey.title,
        "status": journey.status,
        "statusColor": journey.status_color,
        "statusLabel": journey.status_label,
        "summary": journey.summary,
        "searchQuery": journey.search_query,
        "imageUrls": image_urls,
        "closetUrl": closet_url,
        "createdAt": journey.created_at.isoformat() if journey.created_at else None,
        "updatedAt": journey.updated_at.isoformat() if journey.updated_at else None,
    }
