"""Shared utilities for agent tests."""


def extract_thinking(event: dict) -> str | None:
    """
    Extract thinking text from a stream event.

    Args:
        event: LangGraph stream event

    Returns:
        Thinking text if present, None otherwise
    """
    if event.get("event") != "on_chat_model_stream":
        return None

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
