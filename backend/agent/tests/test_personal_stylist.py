"""
Simple test script for the Personal Stylist Agent.

Usage:
    cd backend
    python -m agent.tests.test_personal_stylist
"""

import asyncio
import traceback
import uuid
from agent.src.agents.personal_stylist.core import PersonalStylistAgent
from agent.src.utils.stream import extract_personal_stylist_metadata


async def test_streaming():
    """Test streaming agent responses."""
    print("\n" + "=" * 60)
    print("Testing Streaming")
    print("=" * 60)

    agent = PersonalStylistAgent()
    thread_id = uuid.uuid4().hex
    query = "I'm looking for a casual outfit for brunch"

    print(f"\nUser: {query}")
    print("\nStreaming events:")

    event_count = 0
    async for event in agent.stream(query, thread_id):
        results = extract_personal_stylist_metadata(event)
        # Print thinking messages
        for msg in results["thinking_messages"]:
            print(f"[Thinking]: {msg}")

        # Print UI components generated
        for ui in results["ui_components"]:
            print(f"[UI Component]: {ui}")

        event_count += 1

    final_state = agent.get_state(thread_id)
    print("\nFinal Agent State:")
    print(final_state)
    print(f"\nTotal events processed: {event_count}")


if __name__ == "__main__":
    print("\n\nRunning agent tests...")
    try:
        # Run async streaming test
        print("\n\nRunning streaming test...")
        asyncio.run(test_streaming())
    except Exception as e:
        print(f"\nError during agent test: {e}")
        traceback.print_exc()
