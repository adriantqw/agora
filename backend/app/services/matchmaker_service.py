from typing import AsyncIterator, Dict, Any, Optional

from agent.src.agents.matchmaker.core import MatchMakerAgent
from agent.src.agents.schemas import JourneySchema
from agent.src.utils.stream import AgentEventParser
from sqlalchemy.orm import Session

from app.models.journey import Journey
from app.models.product import Product
from app.models.catalogue import CatalogueItem


# Initialize agent (singleton)
matchmaker_agent = MatchMakerAgent()


def match(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    thread_id: Optional[str],
    message: Optional[str],
    personality: str,
    db: Session,
    consumer_id: str
) -> dict:
    """Synchronous matching - returns final state with enriched products."""
    # Get JourneySchema from DB journey or directly from stylist agent state
    journey_schema = _resolve_journey_schema(journey_id, stylist_thread_id, consumer_id, db)
    
    # Generate thread_id if not provided
    if not thread_id:
        import uuid
        thread_id = f"matchmaker_{uuid.uuid4()}"
    
    # Call agent
    agent_result = matchmaker_agent.match(journey_schema, thread_id, message, personality)
    
    # Extract matches from agent state and enrich
    matches = _extract_and_enrich_matches(agent_result, db)
    new_match_count = _get_latest_batch_size(agent_result)
    
    # Format response
    return {
        "threadId": thread_id,
        "matches": matches,
        "message": _extract_message(agent_result),
        "iterationCount": agent_result.get("iteration_count", 1),
        "newMatchCount": new_match_count
    }


async def match_stream(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    thread_id: Optional[str],
    message: Optional[str],
    personality: str,
    db: Session,
    consumer_id: str
) -> AsyncIterator[dict]:
    """Async streaming matching - yields rich SSE events using AgentEventParser."""
    # Get JourneySchema from DB journey or directly from stylist agent state
    journey_schema = _resolve_journey_schema(journey_id, stylist_thread_id, consumer_id, db)

    # Generate thread_id if not provided
    if not thread_id:
        import uuid
        thread_id = f"matchmaker_{uuid.uuid4()}"

    try:
        yield {"type": "thinking_start"}

        # Stream events from agent using AgentEventParser
        parser = AgentEventParser("matchmaker")
        async for event in await matchmaker_agent.match_stream(journey_schema, thread_id, message, personality):
            parsed = parser.parse(event)

            # Stream thinking messages token-by-token
            for thought in parsed["thinking_messages"]:
                yield {"type": "thinking", "content": thought}

        yield {"type": "thinking_end"}
        yield {"type": "processing", "message": "Finding your perfect matches..."}

        # Get final state and enrich matches
        final_state = matchmaker_agent.get_state(thread_id)
        if final_state:
            state_values = final_state.values if hasattr(final_state, 'values') else {}
            matches = _extract_and_enrich_matches(state_values, db)
            new_match_count = _get_latest_batch_size(state_values)
            msg = _extract_message(state_values)
            yield {
                "type": "complete",
                "data": {
                    "threadId": thread_id,
                    "matches": matches,
                    "message": msg,
                    "iterationCount": state_values.get("iteration_count", 1),
                    "newMatchCount": new_match_count
                }
            }
    except Exception as e:
        yield {
            "type": "error",
            "message": str(e)
        }


def get_state(thread_id: str, db: Session) -> dict:
    """Get current session state with enriched matches."""
    state_snapshot = matchmaker_agent.get_state(thread_id)
    
    if not state_snapshot:
        raise ValueError(f"Thread {thread_id} not found")
    
    state = state_snapshot.values if hasattr(state_snapshot, 'values') else {}
    
    # Enrich matches
    matches = _extract_and_enrich_matches(state, db)
    
    return {
        "threadId": thread_id,
        "matches": matches,
        "journey": state.get("journey").model_dump() if state.get("journey") else None,
        "iterationCount": state.get("iteration_count", 1)
    }


def _resolve_journey_schema(
    journey_id: Optional[str],
    stylist_thread_id: Optional[str],
    consumer_id: str,
    db: Session,
) -> JourneySchema:
    """
    Resolve a JourneySchema from either a DB journey ID or a stylist thread ID.

    - If journeyId is provided, load the Journey record and reconstruct the schema.
    - If only stylistThreadId is provided (quick match before journey is saved),
      fetch the journey directly from the PersonalStylist agent state.
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
                # Ensure we return a JourneySchema, not a raw dict
                if isinstance(journey_data, dict):
                    return JourneySchema(**journey_data)
                return journey_data

        raise ValueError("Could not retrieve journey from stylist thread")

    raise ValueError("Either journeyId or stylistThreadId must be provided")


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
        # Fetch from PersonalStylist agent
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


def _get_attr(obj, key, default=None):
    """Get attribute from a Pydantic model or dict."""
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _extract_and_enrich_matches(agent_state: dict, db: Session) -> list[dict]:
    """Extract matches from agent state and enrich with product details."""
    matches_data = agent_state.get("matches", [])
    flat_matches = []

    for item in matches_data:
        if isinstance(item, list):
            flat_matches.extend(item)
        else:
            flat_matches.append(item)
    enriched = []

    for item in flat_matches:
        product_set = _get_attr(item, 'product_set') or _get_attr(item, 'productSet')
        if product_set:
            # ProductMatchSet
            enriched_set = {
                "title": _get_attr(item, 'title'),
                "description": _get_attr(item, 'description'),
                "productSet": [
                    _enrich_product_match(
                        _get_attr(product, 'id', ''),
                        _get_attr(product, 'score'),
                        _get_attr(product, 'reason', ''),
                        db
                    )
                    for product in product_set
                ]
            }
            enriched.append(enriched_set)
        else:
            # ProductMatch
            enriched.append(_enrich_product_match(
                _get_attr(item, 'id', ''),
                _get_attr(item, 'score'),
                _get_attr(item, 'reason', ''),
                db
            ))

    return enriched


def _get_latest_batch_size(agent_state: dict) -> int:
    matches_data = agent_state.get("matches", [])
    if not matches_data:
        return 0
    last_batch = matches_data[-1]
    if isinstance(last_batch, list):
        return len(last_batch)
    return 0


def _enrich_product_match(match_id: str, score: Optional[float], reason: str, db: Session) -> dict:
    """Fetch product details from database."""
    # Vector DB uses prefixed IDs: "product_abc" or "catalogue_xyz"
    
    if match_id.startswith("product_"):
        product_id = match_id.replace("product_", "")
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if product:
            return {
                "id": match_id,
                "name": product.name,
                "description": product.description,
                "imageUrl": product.image,
                "price": product.price,
                "score": score,
                "reason": reason
            }
    
    elif match_id.startswith("catalogue_"):
        catalogue_id = match_id.replace("catalogue_", "")
        item = db.query(CatalogueItem).filter(CatalogueItem.id == catalogue_id).first()
        
        if item:
            return {
                "id": match_id,
                "name": item.name,
                "description": item.description,
                "imageUrl": item.image_url,
                "price": None,
                "score": score,
                "reason": reason
            }
    
    # Fallback if product not found
    return {
        "id": match_id,
        "name": None,
        "description": None,
        "imageUrl": None,
        "price": None,
        "score": score,
        "reason": reason
    }


def _extract_message(agent_state: dict) -> str:
    """Extract message from agent state."""
    messages = agent_state.get("messages", [])
    if messages:
        last_message = messages[-1]
        if hasattr(last_message, 'content'):
            return last_message.content
        elif isinstance(last_message, dict):
            return last_message.get("content", "Matches found!")
    return "Matches found!"

