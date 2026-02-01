"""Test script for StyleDnaAgent."""
import asyncio
from uuid import uuid4

from ..src.agents.style_dna import StyleDnaAgent
from ..src.agents.schemas import JourneySchema, StyleDna
from .utils import stream_and_print


# ─────────────────────────────────────────────────────────────────
# Mock Data Factories
# ─────────────────────────────────────────────────────────────────

def create_mock_journey() -> JourneySchema:
    """Create a mock journey for testing interaction state updates."""
    return JourneySchema(
        title="Weekend Brunch",
        summary="A casual yet polished brunch look",
        occasion="casual",
        location="restaurant",
        style_preferences=["minimalist", "classic"],
        fit_preferences=["relaxed", "tailored"],
        colour_preferences=["#F5F5DC", "#FFFFFF", "#000000"],
        time_of_day="morning",
        season="spring",
        budget_rating=3
    )


def create_mock_style_dna() -> StyleDna:
    """Create a mock StyleDna for testing stability protocol."""
    return StyleDna(
        title="Modern Minimalist",
        description="Clean lines and neutral tones with structured silhouettes",
        style_preferences=["minimalist", "classic"],
        colour_palette=["#FFFFFF", "#000000", "#F5F5DC"],
        brand_preferences=["COS", "Arket", "Uniqlo"],
        primary_silhoutte="tailored",
        budget_rating=3,
        celebrity_style_twin="Victoria Beckham",
        celebrity_twin_reasoning="Shares a refined, architectural approach to fashion",
        reasoning="Consistent preference for clean, structured pieces"
    )


# ─────────────────────────────────────────────────────────────────
# Unit Tests
# ─────────────────────────────────────────────────────────────────

def test_agent_initialization():
    """Test that the agent initializes correctly."""
    print("Testing agent initialization...")
    agent = StyleDnaAgent()

    assert agent.agent is not None, "Agent graph should be compiled"
    assert agent.model is not None, "Model should be loaded"
    assert agent.tools is not None, "Tools should be defined"
    assert len(agent.tools) > 0, "At least one tool should be available"
    assert agent.memory is not None, "Memory should be initialized"

    print("✓ Agent initialization test passed")
    return agent


def test_memory_operations():
    """Test memory retrieve/update operations."""
    print("Testing memory operations...")
    agent = StyleDnaAgent()
    test_user_id = f"test-user-{uuid4().hex[:8]}"

    # Test retrieving non-existent user (should return None)
    result = agent.get_style_dna(test_user_id)
    assert result is None, "Should return None for non-existent user"

    print("✓ Memory operations test passed")


# ─────────────────────────────────────────────────────────────────
# Integration Tests
# ─────────────────────────────────────────────────────────────────

async def test_update_from_interaction_stream():
    """Test updating Style DNA from interaction state (JourneySchema)."""
    agent = StyleDnaAgent()
    journey = create_mock_journey()
    user_id = f"test-user-{uuid4().hex[:8]}"
    thread_id = f"test-interaction-{uuid4()}"

    print("\n" + "=" * 60)
    print("STYLE DNA - INTERACTION STATE UPDATE TEST")
    print("=" * 60)
    print(f"User ID: {user_id}")
    print(f"Thread ID: {thread_id}")
    print(f"Journey: {journey.title}")
    print("=" * 60)

    event_stream = await agent.update_from_interaction_stream(
        user_id=user_id,
        interaction_state=journey,
        thread_id=thread_id
    )

    return await stream_and_print(event_stream, output_key="updated_style_dna")


async def test_update_from_ootd_stream():
    """Test updating Style DNA from OOTD images."""
    agent = StyleDnaAgent()
    user_id = f"test-user-{uuid4().hex[:8]}"
    thread_id = f"test-ootd-{uuid4()}"

    # Use a sample image URL for testing
    ootd_images = [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"  # Fashion photo
    ]

    print("\n" + "=" * 60)
    print("STYLE DNA - OOTD IMAGE UPDATE TEST")
    print("=" * 60)
    print(f"User ID: {user_id}")
    print(f"Thread ID: {thread_id}")
    print(f"Images: {len(ootd_images)} image(s)")
    print("=" * 60)

    event_stream = await agent.update_from_ootd_stream(
        user_id=user_id,
        ootd_images=ootd_images,
        thread_id=thread_id
    )

    return await stream_and_print(event_stream, output_key="updated_style_dna")


# ─────────────────────────────────────────────────────────────────
# Test Runner
# ─────────────────────────────────────────────────────────────────

async def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("STYLE DNA AGENT TESTS")
    print("=" * 60)

    # Unit tests
    print("\n--- UNIT TESTS ---\n")
    test_agent_initialization()
    print()
    test_memory_operations()
    print()

    # Integration tests
    print("\n" + "-" * 60)
    print("INTEGRATION TESTS (require valid API keys)")
    print("-" * 60)

    await test_update_from_interaction_stream()
    await test_update_from_ootd_stream()

    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())
