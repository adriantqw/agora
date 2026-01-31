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
        title="Summer Beach Vacation",
        summary="A relaxed bohemian beach look for summer vacation",
        occasion="vacation",
        location="beach",
        style_preferences=["bohemian", "minimalist"],
        fit_preferences=["relaxed"],
        colour_preferences=["#FFFFFF", "#F5F5DC", "#ADD8E6"],
        time_of_day="afternoon",
        season="summer",
        budget_rating=3
    )


def create_mock_product_selections() -> ProductSelections:
    """Create mock product selections for testing."""
    return ProductSelections(
        matches=[
            ProductSelected(id="product_001"),
            ProductSelected(id="product_002"),
            ProductSelectedSet(
                title="Beach Day Ensemble",
                description="A complete beach-ready look",
                product_set=[
                    ProductSelected(id="product_003"),
                    ProductSelected(id="product_004"),
                    ProductSelected(id="product_005"),
                ]
            ),
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
        message="Create stylish summer lookbooks",
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
