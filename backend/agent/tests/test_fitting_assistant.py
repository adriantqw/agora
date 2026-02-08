"""Test script for FittingAssistantAgent."""
import asyncio
from uuid import uuid4

from ..src.agents.fitting_assistant.core import FittingAssistantAgent
from ..src.agents.fitting_assistant.schemas import (
    ProductSelections,
    ProductSelected,
    ProductSelectedSet,
)
from ..src.agents.schemas import JourneySchema
from .utils import stream_and_print


def create_mock_journey() -> JourneySchema:
    """Create a mock journey for testing."""
    return JourneySchema(
        title="Evening Party",
        summary="A glamorous evening party outfit with classic elegance",
        occasion="party",
        location="nightclub",
        style_preferences=["classic", "old_money"],
        fit_preferences=[],
        colour_preferences=[],
        time_of_day="evening",
        season="winter",
        budget_rating=4
    )


def create_mock_product_selections() -> ProductSelections:
    """Create mock product selections for testing."""
    return ProductSelections(
        matches=[
            ProductSelectedSet(
                title="The 'Uptown After Dark' Edit",
                description="A sophisticated blend of structured tailoring and playful evening glamour, perfect for a winter night out.",
                product_set=[
                    ProductSelected(id="product_07133e69-0869-4ce3-8bf9-9fcb9ec7aac5"),
                    ProductSelected(id="product_3ec097a7-d0f8-44e7-9e71-b49a27e513f7"),
                    ProductSelected(id="product_b2341c11-da64-4ef4-a187-78a441e1e5a6"),
                    ProductSelected(id="product_7f741955-b906-4712-9648-0a83de9d583f"),
                ]
            ),
            ProductSelected(id="product_47b9121a-f905-418a-b36e-6462e381bc17"),
            ProductSelected(id="product_24f90f5e-aa4d-4cb2-8685-3f6e9483a241"),
        ]
    )


def test_agent_initialization():
    """Test that the agent initializes correctly."""
    print("Testing agent initialization...")
    agent = FittingAssistantAgent()

    assert agent.agent is not None, "Agent graph should be compiled"
    assert agent.model is not None, "Model should be loaded"
    assert agent.tools is not None, "Tools should be defined"
    assert len(agent.tools) > 0, "At least one tool should be available"

    print("Agent initialization test passed")
    return agent


def test_personality_validation():
    """Test personality validation."""
    print("Testing personality validation...")
    agent = FittingAssistantAgent()
    journey = create_mock_journey()
    selections = create_mock_product_selections()
    thread_id = f"test-personality-{uuid4()}"

    try:
        agent.fit(journey, selections, thread_id, personality="invalid_personality")
        assert False, "Should have raised ValueError for invalid personality"
    except ValueError as e:
        print(f"Correctly caught invalid personality: {e}")

    print("Personality validation test passed")


async def test_fit_stream():
    """Test streaming fit invocation."""
    agent = FittingAssistantAgent()
    journey = create_mock_journey()
    selections = create_mock_product_selections()
    thread_id = f"test-stream-{uuid4()}"

    print("\n" + "=" * 60)
    print("FITTING ASSISTANT STREAM TEST")
    print("=" * 60)
    print(f"Thread ID: {thread_id}")
    print(f"Journey: {journey.title}")
    print(f"Selections: {len(selections.matches)} items")
    print("=" * 60)

    event_stream = await agent.fit_stream(
        journey=journey,
        product_selections=selections,
        thread_id=thread_id,
        message="Create stylish evening lookbooks for a winter night out",
        personality="friendly"
    )

    return await stream_and_print(event_stream, output_key="fitting_sets")


async def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("FITTING ASSISTANT AGENT TESTS")
    print("=" * 60)

    test_agent_initialization()
    print()

    test_personality_validation()
    print()

    print("-" * 60)
    print("INTEGRATION TESTS (require valid API keys)")
    print("-" * 60)

    await test_fit_stream()

    print()
    print("=" * 60)
    print("ALL TESTS COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())
