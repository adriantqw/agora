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

    async for event in agent.match_stream(journey, thread_id):
        if event["event"] == "on_tool_start":
            logger.info(f"Tool call: {event['name']}")
        elif event["event"] == "on_tool_end":
            logger.info(f"Tool result received")
        elif event["event"] == "on_chain_end":
            logger.info("Chain completed")

    # Get final state
    state = agent.get_state(thread_id)
    logger.info(f"Final matches: {state.values.get('matches', [])}")
    return state


if __name__ == "__main__":
    asyncio.run(test_match_stream())
