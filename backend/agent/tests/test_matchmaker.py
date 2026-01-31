"""Test script for MatchMakerAgent match_stream."""
import asyncio
import logging
from uuid import uuid4

from ..src.agents.matchmaker.core import MatchMakerAgent
from ..src.agents.personal_stylist.schemas import JourneySchema

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_match_stream():
    """Test streaming match."""
    agent = MatchMakerAgent()

    journey = JourneySchema(
        title="Evening Party",
        occasion="party",
        style_preferences=["bold", "glamorous"],
        colour_preferences=["black", "gold"],
        time_of_day="evening",
        season="winter"
    )

    thread_id = f"test-stream-{uuid4()}"
    logger.info(f"Testing stream match with thread_id: {thread_id}")
    logger.info(f"Journey: {journey.model_dump_json(indent=2)}")
    print("-" * 60)

    async for event in agent.match_stream(journey, thread_id):
        event_type = event.get("event")
        # Model streaming tokens (thinking/content)
        if event_type == "on_chat_model_stream":
            chunk = event.get("data", {}).get("chunk")
            if chunk and hasattr(chunk, "content") and chunk.content:
                print("-" * 60)
                print(chunk.content, end="", flush=True)

        # Tool invocation start
        elif event_type == "on_tool_start":
            logger.info(f"🔧 Tool call: {event.get('name')}")
            tool_input = event.get("data", {}).get("input")
            if tool_input:
                print("-" * 60)
                logger.info(f"   Input: {tool_input}")

        # Tool invocation end
        elif event_type == "on_tool_end":
            output = event.get("data", {}).get("output")
            if output:
                # Truncate long outputs
                output_str = str(output)
                if len(output_str) > 500:
                    output_str = output_str[:500] + "..."
                print("-" * 60)
                logger.info(f"   Output: {output_str}")

        # Chain/graph completion
        elif event_type == "on_chain_end" and event.get("name") == "LangGraph":
            logger.info("✅ Graph completed")

    # Get final state
    state = agent.get_state(thread_id)
    logger.info(f"Final matches count: {len(state.values.get('matches', []))}")
    return state


if __name__ == "__main__":
    asyncio.run(test_match_stream())
