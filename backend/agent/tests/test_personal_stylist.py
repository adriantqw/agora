"""Test script for PersonalStylistAgent."""
import asyncio
from uuid import uuid4

from ..src.agents.personal_stylist.core import PersonalStylistAgent
from .utils import stream_and_print


async def test_chat_stream():
    """Test streaming chat."""
    agent = PersonalStylistAgent()
    thread_id = uuid4().hex
    query = "I'm looking for a casual outfit for brunch"

    print("\n" + "=" * 60)
    print("PERSONAL STYLIST STREAM TEST")
    print("=" * 60)
    print(f"Thread ID: {thread_id}")
    print(f"Query: {query}")
    print("=" * 60)

    event_stream = await agent.chat_stream(query, thread_id)

    return await stream_and_print(event_stream, output_key="ui_inputs")


if __name__ == "__main__":
    asyncio.run(test_chat_stream())
