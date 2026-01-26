def extract_catalogue_ingestor_metadata(event: dict):
    """
    Extract metadata from LangGraph events.
    
    Args:
        event: The event to extract metadata from.
    
    Returns:
        A dictionary containing the extracted metadata.
    """
    results = {
        "thinking_messages": [],
        "current_page": None,
        "item_count": None
    }
    data = event.get('data', {})

    # 1. Thinking Messages (Extracted from the Model's Response Content)
    msg_source = data.get('chunk') or data.get('output')
    if msg_source and hasattr(msg_source, 'content'):
        content = msg_source.content
        if isinstance(content, list):
            for part in content:
                if isinstance(part, dict) and part.get('type') == 'thinking':
                    results["thinking_messages"].append(part.get('thinking'))

    # 2. Current Page & Item Count (Pulled directly from Agent State)
    # State can be in 'chunk' (on_chain_stream), 'output' (on_chain_end), or 'input' (on_chain_start)
    state = None
    for key in ['chunk', 'output', 'input']:
        if isinstance(data.get(key), dict):
            state = data.get(key)
            break

    if state:
        # Extract the page index from state
        if 'current_page_idx' in state:
            results["current_page"] = state.get('current_page_idx')

        # Extract item count from the state's list of items
        items = state.get('catalogue_items', [])
        if isinstance(items, list):
            results["item_count"] = len(items)

    return results


def extract_personal_stylist_metadata(event: dict):
    """
    Extract metadata from LangGraph events for the Personal Stylist Agent.
    
    Args:
        event: The event to extract metadata from.

    Returns:
        A dictionary containing the extracted metadata.
    """
    results = {
        "thinking_messages": [],
        "ui_components": [],
        "user_responses": []
    }
    data = event.get('data', {})

    # 1. Thinking Messages (Extracted from the Model's Response Content)
    msg_source = data.get('chunk') or data.get('output')
    if msg_source and hasattr(msg_source, 'content'):
        content = msg_source.content
        if isinstance(content, list):
            for part in content:
                if isinstance(part, dict) and part.get('type') == 'thinking':
                    results["thinking_messages"].append(part.get('thinking'))

    # 2. UI Components & User Responses (Pulled directly from Agent State)
    # State can be in 'chunk' (on_chain_stream), 'output' (on_chain_end), or 'input' (on_chain_start)
    state = None
    for key in ['chunk', 'output', 'input']:
        if isinstance(data.get(key), dict):
            state = data.get(key)
            break

    if state:
        # Extract UI components from state
        ui_inputs = state.get('ui_inputs', [])
        if isinstance(ui_inputs, list):
            results["ui_components"] = ui_inputs

        # Extract user responses from state
        ui_answers = state.get('ui_answers', [])
        if isinstance(ui_answers, list):
            results["user_responses"] = ui_answers

    return results