"""Test script for PersonalStylistAgent."""
import asyncio
from uuid import uuid4

from ..src.agents.personal_stylist.core import PersonalStylistAgent
from ..src.agents.personal_stylist.schemas import UserResponse
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


async def test_chat_async():
    """Test async chat and verify nested ui_inputs structure."""
    agent = PersonalStylistAgent()
    thread_id = uuid4().hex
    query = "I need an outfit for a summer wedding"

    print("\n" + "=" * 60)
    print("PERSONAL STYLIST ASYNC TEST - NESTED UI_INPUTS")
    print("=" * 60)
    print(f"Thread ID: {thread_id}")
    print(f"Query: {query}")
    print("=" * 60)

    # First chat - should create first batch (use ainvoke for async tools)
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": agent.recursion_limit}
    result = await agent.agent.ainvoke({"messages": [("user", query)], "personality": "friendly"}, config=config)

    ui_inputs = result.get("ui_inputs", [])
    print(f"\nAfter first chat:")
    print(f"  ui_inputs type: {type(ui_inputs)}")
    print(f"  Number of batches: {len(ui_inputs)}")

    # Verify nested structure
    assert isinstance(ui_inputs, list), "ui_inputs should be a list"
    assert len(ui_inputs) >= 1, "Should have at least 1 batch"
    assert isinstance(ui_inputs[0], list), "First element should be a list (batch)"

    first_batch = ui_inputs[0]
    print(f"  First batch has {len(first_batch)} questions")

    # Print questions from first batch
    for i, q in enumerate(first_batch):
        q_text = q.question if hasattr(q, 'question') else q.get('question', '')
        print(f"    Q{i+1}: {q_text[:50]}...")

    print("\n" + "=" * 60)
    print("TEST PASSED: ui_inputs has nested batch structure")
    print("=" * 60)

    return result


async def test_submit_answers_async():
    """Test submit_answers and verify new batch is appended."""
    agent = PersonalStylistAgent()
    thread_id = uuid4().hex
    query = "I want a casual beach outfit"

    print("\n" + "=" * 60)
    print("PERSONAL STYLIST SUBMIT ANSWERS TEST")
    print("=" * 60)
    print(f"Thread ID: {thread_id}")
    print(f"Query: {query}")
    print("=" * 60)

    # First chat (use ainvoke for async tools)
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": agent.recursion_limit}
    result1 = await agent.agent.ainvoke({"messages": [("user", query)], "personality": "friendly"}, config=config)
    ui_inputs1 = result1.get("ui_inputs", [])
    first_batch = ui_inputs1[-1] if ui_inputs1 else []

    print(f"\nAfter first chat: {len(ui_inputs1)} batch(es), {len(first_batch)} questions")

    # Create mock answers for first batch
    answers = []
    for q in first_batch[:3]:  # Answer first 3 questions
        q_id = q.id if hasattr(q, 'id') else q.get('id')
        answers.append(UserResponse(
            question_id=q_id,
            selected_options=["option1"],
            timestamp=1234567890
        ))

    print(f"\nSubmitting {len(answers)} answers...")

    # Submit answers (use ainvoke for async tools)
    result2 = await agent.agent.ainvoke({"ui_answers": answers, "personality": "friendly"}, config=config)
    ui_inputs2 = result2.get("ui_inputs", [])

    print(f"\nAfter submit_answers:")
    print(f"  Total batches: {len(ui_inputs2)}")

    # Verify batches accumulated
    assert len(ui_inputs2) >= 2, f"Should have at least 2 batches after submit, got {len(ui_inputs2)}"

    # Verify first batch is preserved
    assert ui_inputs2[0] == ui_inputs1[0], "First batch should be preserved"

    # Get new batch
    new_batch = ui_inputs2[-1]
    print(f"  New batch has {len(new_batch)} questions")

    # Verify HumanMessage was added (check messages)
    messages = result2.get("messages", [])
    human_msgs = [m for m in messages if hasattr(m, 'type') and m.type == 'human']
    print(f"  Human messages in history: {len(human_msgs)}")

    # The last human message should contain the answer summary
    if human_msgs:
        last_human = human_msgs[-1]
        content = last_human.content if hasattr(last_human, 'content') else ""
        if "My answers:" in content:
            print("  ✓ Answer summary found in conversation history")
        else:
            print("  ✗ Answer summary NOT found in conversation history")

    print("\n" + "=" * 60)
    print("TEST PASSED: ui_inputs correctly accumulated as nested batches")
    print("=" * 60)

    return result2


async def run_all_tests():
    """Run all tests."""
    await test_chat_async()
    await test_submit_answers_async()
    await test_chat_stream()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
