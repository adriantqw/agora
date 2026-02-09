from typing import AsyncIterator, Optional

from agent.src.agents.fitting_assistant.core import FittingAssistantAgent
from agent.src.agents.fitting_assistant.schemas import (
    ProductSelections, ProductSelected, ProductSelectedSet
)
from agent.src.agents.schemas import JourneySchema
from agent.src.utils.stream import AgentEventParser
from sqlalchemy.orm import Session

from app.models.journey import Journey
from app.models.product import Product
from app.models.catalogue import CatalogueItem


# Initialize agent (singleton)
fitting_assistant_agent = FittingAssistantAgent()


def fit(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    product_selections: list,
    thread_id: Optional[str],
    message: Optional[str],
    personality: str,
    db: Session,
    consumer_id: str
) -> dict:
    """Synchronous fitting - returns final state with fitting sets."""
    # Resolve journey
    journey_schema = _resolve_journey_schema(journey_id, stylist_thread_id, consumer_id, db)

    # Convert API selections to agent schema
    agent_selections = _convert_selections(product_selections)

    # Generate thread_id if not provided
    if not thread_id:
        import uuid
        thread_id = f"fitting_{uuid.uuid4()}"

    # Call agent
    agent_result = fitting_assistant_agent.fit(
        journey=journey_schema,
        product_selections=agent_selections,
        thread_id=thread_id,
        message=message,
        personality=personality
    )

    # Extract fitting sets and format response
    fitting_sets = _extract_fitting_sets(agent_result)
    msg = _extract_message(agent_result)

    return {
        "threadId": thread_id,
        "fittingSets": fitting_sets,
        "message": msg,
    }


async def fit_stream(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    product_selections: list,
    thread_id: Optional[str],
    message: Optional[str],
    personality: str,
    db: Session,
    consumer_id: str
) -> AsyncIterator[dict]:
    """Async streaming fitting - yields rich SSE events using AgentEventParser."""
    # Resolve journey
    journey_schema = _resolve_journey_schema(journey_id, stylist_thread_id, consumer_id, db)

    # Convert API selections to agent schema
    agent_selections = _convert_selections(product_selections)

    # Generate thread_id if not provided
    if not thread_id:
        import uuid
        thread_id = f"fitting_{uuid.uuid4()}"

    try:
        yield {"type": "thinking_start"}

        # Stream events from agent using AgentEventParser
        parser = AgentEventParser("fitting_assistant")
        async for event in await fitting_assistant_agent.fit_stream(
            journey=journey_schema,
            product_selections=agent_selections,
            thread_id=thread_id,
            message=message,
            personality=personality
        ):
            parsed = parser.parse(event)

            # Stream thinking messages token-by-token
            for thought in parsed["thinking_messages"]:
                yield {"type": "thinking", "content": thought}

        yield {"type": "thinking_end"}
        yield {"type": "processing", "message": "Generating your lookbook..."}

        # Get final state and extract fitting sets
        final_state = fitting_assistant_agent.get_state(thread_id)
        if final_state:
            state_values = final_state.values if hasattr(final_state, 'values') else {}
            fitting_sets = _extract_fitting_sets(state_values)
            msg = _extract_message(state_values)
            yield {
                "type": "complete",
                "data": {
                    "threadId": thread_id,
                    "fittingSets": fitting_sets,
                    "message": msg,
                }
            }
    except Exception as e:
        yield {
            "type": "error",
            "message": str(e)
        }


def get_state(thread_id: str, db: Session) -> dict:
    """Get current session state."""
    state_snapshot = fitting_assistant_agent.get_state(thread_id)

    if not state_snapshot:
        raise ValueError(f"Thread {thread_id} not found")

    state = state_snapshot.values if hasattr(state_snapshot, 'values') else {}

    fitting_sets = _extract_fitting_sets(state)

    return {
        "threadId": thread_id,
        "fittingSets": fitting_sets,
        "journey": state.get("journey").model_dump() if state.get("journey") else None,
    }


def _convert_selections(api_selections: list) -> ProductSelections:
    """Convert API selection dicts to agent ProductSelections schema."""
    matches = []
    for item in api_selections:
        if isinstance(item, dict) and "productSet" in item:
            # ProductSelectedSet
            products = [
                ProductSelected(id=p["id"]) for p in item["productSet"]
            ]
            matches.append(ProductSelectedSet(
                title=item["title"],
                description=item["description"],
                product_set=products
            ))
        elif isinstance(item, dict):
            # Single ProductSelected
            matches.append(ProductSelected(id=item["id"]))
        else:
            # Already a Pydantic model (from direct calls)
            matches.append(item)

    return ProductSelections(matches=matches)


def _resolve_journey_schema(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    consumer_id: str,
    db: Session,
) -> JourneySchema:
    """
    Resolve a JourneySchema from either a DB journey ID or a stylist thread ID.
    """
    if journey_id:
        journey = _get_journey_with_ownership(journey_id, consumer_id, db)
        return _convert_journey_to_schema(journey, db)

    if stylist_thread_id:
        from app.services.curate_my_fit_service import stylist_agent
        stylist_state = stylist_agent.get_state(stylist_thread_id)
        if stylist_state:
            values = stylist_state.values if hasattr(stylist_state, 'values') else stylist_state
            journey_data = values.get("journey")
            if journey_data:
                if isinstance(journey_data, dict):
                    return JourneySchema(**journey_data)
                return journey_data

        raise ValueError("Could not retrieve journey from stylist thread")

    # No journey context — return a minimal schema
    return JourneySchema(
        title="Fitting Room Session",
        summary="User-selected items for virtual fitting"
    )


def _get_journey_with_ownership(journey_id: str, consumer_id: str, db: Session) -> Journey:
    """Fetch journey and verify consumer owns it."""
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise ValueError(f"Journey {journey_id} not found")

    if journey.consumer_id and journey.consumer_id != consumer_id:
        raise ValueError("Journey does not belong to you")

    return journey


def _convert_journey_to_schema(journey: Journey, db: Session) -> JourneySchema:
    """Reconstruct JourneySchema from PersonalStylist agent state."""
    if journey.thread_id:
        from app.services.stylist_service import stylist_agent
        stylist_state = stylist_agent.get_state(journey.thread_id)
        if stylist_state:
            journey_schema = stylist_state.values.get("journey") if hasattr(stylist_state, 'values') else stylist_state.get("journey")
            if journey_schema:
                return journey_schema

    # Fallback: minimal schema
    return JourneySchema(
        title=journey.title,
        summary=journey.summary or "Custom preferences"
    )


def _extract_fitting_sets(agent_state: dict) -> list[dict]:
    """Extract fitting sets from agent state and format for API response."""
    fitting_sets_data = agent_state.get("fitting_sets", [])
    result = []

    for item in fitting_sets_data:
        if hasattr(item, 'model_dump'):
            dumped = item.model_dump()
        elif isinstance(item, dict):
            dumped = item
        else:
            continue

        result.append({
            "title": dumped.get("title", ""),
            "description": dumped.get("description", ""),
            "productIds": dumped.get("product_ids", []),
            "imagePaths": [str(p) for p in dumped.get("image_path", [])],
        })

    return result


def _extract_message(agent_state: dict) -> str:
    """Extract message from agent state."""
    messages = agent_state.get("messages", [])
    if messages:
        last_message = messages[-1]
        if hasattr(last_message, 'content'):
            return last_message.content
        elif isinstance(last_message, dict):
            return last_message.get("content", "Your lookbook is ready!")
    return "Your lookbook is ready!"
