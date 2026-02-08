"""Test script for MatchMakerAgent."""
import asyncio
from uuid import uuid4

from ..src.agents.matchmaker.core import MatchMakerAgent
from ..src.agents.schemas import JourneySchema
from .utils import stream_and_print


def create_mock_journey() -> JourneySchema:
    """Create a mock journey for testing with valid enum values."""
    return JourneySchema(
        title="Evening Party",
        summary="A glamorous evening party outfit with classic elegance",
        occasion="party",
        location="nightclub",
        style_preferences=["classic", "old_money"],
        fit_preferences=["tailored", "slim"],
        colour_preferences=["#000000", "#FFD700"],
        time_of_day="evening",
        season="winter",
        budget_rating=4
    )


async def test_match_stream():
    """Test streaming match."""
    agent = MatchMakerAgent()
    journey = create_mock_journey()
    thread_id = f"test-stream-{uuid4()}"

    print("\n" + "=" * 60)
    print("MATCHMAKER STREAM TEST")
    print("=" * 60)
    print(f"Thread ID: {thread_id}")
    print(f"Journey: {journey.title}")
    print("=" * 60)

    event_stream = agent.match_stream(journey, thread_id)

    return await stream_and_print(event_stream, output_key="matches")


if __name__ == "__main__":
    asyncio.run(test_match_stream())
