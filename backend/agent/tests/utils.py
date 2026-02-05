"""Shared utilities for agent tests."""

from ..src.utils.stream import AgentEventParser


def extract_thinking(event: dict) -> str | None:
    """
    Extract thinking text from a stream event.

    Uses AgentEventParser internally but returns a single string
    for backward compatibility with test scripts.

    Args:
        event: LangGraph stream event

    Returns:
        Thinking text if present, None otherwise
    """
    # Use a generic parser - thinking extraction is the same for all agents
    # We'll use catalogue_ingestor but any agent type works for thinking
    if event.get("event") != "on_chat_model_stream":
        return None

    # Direct extraction for efficiency (avoid parser overhead)
    chunk = event.get("data", {}).get("chunk")
    if not chunk or not hasattr(chunk, "content") or not chunk.content:
        return None

    content = chunk.content
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict) and part.get("type") == "thinking":
                return part.get("thinking", "")

    return None


def extract_tool_call(event: dict) -> dict | None:
    """
    Extract tool call info from a stream event.

    Args:
        event: LangGraph stream event

    Returns:
        Dict with 'name' and 'input' if tool call, None otherwise
    """
    if event.get("event") != "on_tool_start":
        return None

    return {
        "name": event.get("name"),
        "input": event.get("data", {}).get("input")
    }


def extract_final_output(event: dict) -> dict | None:
    """
    Extract final output from graph completion event.

    Args:
        event: LangGraph stream event

    Returns:
        Output dict if graph completed, None otherwise
    """
    if event.get("event") != "on_chain_end":
        return None
    if event.get("name") != "LangGraph":
        return None

    output = event.get("data", {}).get("output", {})
    return output if isinstance(output, dict) else None


def print_thinking(thinking: str) -> None:
    """Print thinking text with streaming effect."""
    print(thinking, end="", flush=True)


def print_tool_call(tool_call: dict) -> None:
    """Print tool call info."""
    print(f"\n\n[TOOL] {tool_call['name']}")


def print_final_state(state: dict, output_key: str = "matches") -> None:
    """
    Print final state output cleanly.

    Args:
        state: Final agent state
        output_key: Key for the main output list (e.g., 'matches', 'fitting_sets')
    """
    print("\n\n" + "=" * 60)
    print("[FINAL OUTPUT]")
    print("=" * 60)

    messages = state.get("messages", [])
    if messages:
        last_msg = messages[-1]
        if hasattr(last_msg, "content") and last_msg.content:
            content = last_msg.content
            # Handle list content (with thinking blocks)
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "text":
                        print(f"\nMessage: {part.get('text', '')}")
                        break
            else:
                print(f"\nMessage: {content}")

    items = state.get(output_key, [])
    # Handle Pydantic model with nested items
    if hasattr(items, output_key):
        items = getattr(items, output_key)
    elif hasattr(items, 'matches'):
        items = items.matches
    elif hasattr(items, 'fitting_sets'):
        items = items.fitting_sets

    if not isinstance(items, list):
        items = [items] if items else []

    # Handle nested list structure (e.g., ui_inputs is [[batch1], [batch2], ...])
    # Extract the latest batch for display
    if output_key == "ui_inputs" and items and isinstance(items[0], list):
        print(f"\nTotal batches: {len(items)}")
        items = items[-1] if items else []  # Get latest batch
        print(f"Latest batch has {len(items)} item(s):")
    else:
        print(f"\nGenerated {len(items)} item(s):")
    for i, item in enumerate(items, 1):
        if hasattr(item, "title"):
            desc = getattr(item, "description", "")
            print(f"  {i}. {item.title}: {desc}")
        elif isinstance(item, dict):
            print(f"  {i}. {item.get('title', item)}")
        else:
            print(f"  {i}. {item}")

    print("=" * 60)


async def stream_and_print(event_stream, output_key: str = "matches") -> dict | None:
    """
    Stream events and print thinking + final output.

    Args:
        event_stream: Async generator from agent.astream_events()
        output_key: Key for the main output list

    Returns:
        Final output dict or None
    """
    print("\n[THINKING]")
    print("-" * 60)

    final_output = None

    async for event in event_stream:
        # Print thinking as it streams
        thinking = extract_thinking(event)
        if thinking:
            print_thinking(thinking)

        # Log tool calls
        tool_call = extract_tool_call(event)
        if tool_call:
            print_tool_call(tool_call)

        # Capture final output
        output = extract_final_output(event)
        if output:
            final_output = output

    # Print final output
    if final_output:
        print_final_state(final_output, output_key)

    return final_output


async def stream_with_parser(
    event_stream,
    agent_type: str,
    output_key: str = "matches"
) -> dict | None:
    """
    Stream events using AgentEventParser for structured metadata extraction.

    This is the recommended way to process agent streams as it provides
    agent-specific metadata extraction.

    Args:
        event_stream: Async generator from agent.*_stream() methods
        agent_type: One of: catalogue_ingestor, personal_stylist, matchmaker,
                    fitting_assistant, style_dna
        output_key: Key for the main output list in final state

    Returns:
        Final output dict or None

    Example:
        result = await stream_with_parser(
            agent.match_stream(journey, thread_id),
            agent_type="matchmaker",
            output_key="matches"
        )
    """
    parser = AgentEventParser(agent_type)

    print("\n[THINKING]")
    print("-" * 60)

    final_output = None

    async for event in event_stream:
        # Parse event with agent-specific parser
        metadata = parser.parse(event)

        # Print thinking messages
        if metadata.get("thinking_messages"):
            for msg in metadata["thinking_messages"]:
                print(msg, end="", flush=True)

        # Log tool calls (still use direct extraction for tools)
        tool_call = extract_tool_call(event)
        if tool_call:
            print_tool_call(tool_call)

        # Capture final output
        output = extract_final_output(event)
        if output:
            final_output = output

    # Print final output
    if final_output:
        print_final_state(final_output, output_key)

    return final_output
