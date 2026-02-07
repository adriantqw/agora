"""
Partial JSON parsing utilities for streaming structured output.

When an LLM generates structured output (JSON) token by token,
these utilities parse the incomplete JSON to extract completed
key-value pairs as they arrive.
"""

import json
import logging

logger = logging.getLogger(__name__)


def try_parse_partial_json(text: str) -> dict | None:
    """
    Attempt to parse a partial JSON string and extract all complete key-value pairs.

    Handles cases like:
        '{"title": "Summer Vibes", "summary": "Looking for'  → {"title": "Summer Vibes"}
        '{"title": "X", "occasion":'                         → {"title": "X"}
        '{"style_preferences": ["bohemian", "classic'         → {"style_preferences": ["bohemian"]}
        '{"season": null, '                                   → {"season": null}

    Args:
        text: Partial JSON string being accumulated from streaming chunks

    Returns:
        dict of complete key-value pairs, or None if nothing parseable
    """
    if not text or not text.strip():
        return None

    text = text.strip()

    # Must start with {
    if not text.startswith("{"):
        return None

    # Try parsing as-is first (might be complete JSON)
    try:
        result = json.loads(text)
        if isinstance(result, dict):
            return result
        return None
    except json.JSONDecodeError:
        pass

    # Attempt to repair partial JSON by truncating incomplete values
    # and closing open braces/brackets
    repaired = _repair_partial_json(text)
    if repaired is not None:
        return repaired

    return None


def _repair_partial_json(text: str) -> dict | None:
    """
    Try to repair partial JSON by progressively truncating from the end
    and closing open delimiters.
    """
    # Strategy: find the last position where we can cleanly truncate,
    # then close any open braces/brackets

    for attempt in range(5):
        candidate = text

        if attempt > 0:
            # Progressive truncation: find the Nth-last comma and truncate there
            pos = len(candidate)
            for _ in range(attempt):
                pos = candidate.rfind(",", 0, pos)
                if pos == -1:
                    break
            if pos <= 0:
                break
            candidate = candidate[:pos]

        candidate = candidate.rstrip()

        # Remove trailing comma
        if candidate.endswith(","):
            candidate = candidate[:-1].rstrip()

        # If ends with colon (key with no value), truncate to before this key
        if candidate.endswith(":"):
            # Find the last comma before this key
            last_comma = candidate.rfind(",")
            if last_comma > 0:
                candidate = candidate[:last_comma].rstrip()
            else:
                # No comma — only one key with no value, just use opening brace
                candidate = "{"
                candidate += "}"
                try:
                    result = json.loads(candidate)
                    return result if isinstance(result, dict) else None
                except json.JSONDecodeError:
                    continue

        # If ends with an incomplete string (odd number of unescaped quotes
        # after last comma), truncate to last comma
        if _has_incomplete_string(candidate):
            last_comma = candidate.rfind(",")
            if last_comma > 0:
                candidate = candidate[:last_comma].rstrip()
            else:
                continue

        # Close any open delimiters
        candidate = _close_delimiters(candidate)

        try:
            result = json.loads(candidate)
            if isinstance(result, dict):
                return result
        except json.JSONDecodeError:
            continue

    return None


def _has_incomplete_string(text: str) -> bool:
    """Check if text ends inside an incomplete string literal."""
    # Count unescaped quotes from the end
    in_string = False
    escaped = False
    for char in text:
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == '"':
            in_string = not in_string
    return in_string


def _close_delimiters(text: str) -> str:
    """Close any unmatched { and [ delimiters."""
    # Track open delimiters (respecting strings)
    stack = []
    in_string = False
    escaped = False

    for char in text:
        if escaped:
            escaped = False
            continue
        if char == "\\":
            if in_string:
                escaped = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue

        if char in "{[":
            stack.append(char)
        elif char == "}":
            if stack and stack[-1] == "{":
                stack.pop()
        elif char == "]":
            if stack and stack[-1] == "[":
                stack.pop()

    # Close in reverse order
    closers = {"[": "]", "{": "}"}
    for opener in reversed(stack):
        text += closers[opener]

    return text


class PartialJsonTracker:
    """
    Stateful tracker that accumulates JSON text chunks from streaming
    structured output and detects newly completed fields.

    Usage:
        tracker = PartialJsonTracker()

        # For each streaming text chunk:
        delta = tracker.feed('{"title": "Summer')
        # delta = {}  (title not complete yet)

        delta = tracker.feed(' Vibes", "occasion":')
        # delta = {"title": "Summer Vibes"}  (title now complete)

        delta = tracker.feed(' "casual"}')
        # delta = {"occasion": "casual"}

        tracker.reset()  # Ready for next structured output call
    """

    def __init__(self):
        self._buffer = ""
        self._last_parsed: dict = {}
        self._emitted_keys: set = set()

    def feed(self, text_chunk: str) -> dict:
        """
        Feed a new text chunk and return newly completed fields.

        Args:
            text_chunk: Next piece of the JSON string from streaming

        Returns:
            Dict of newly completed or changed key-value pairs (delta).
            Empty dict if no new fields detected.
        """
        self._buffer += text_chunk
        parsed = try_parse_partial_json(self._buffer)

        if parsed is None:
            return {}

        # Find newly completed or changed fields
        delta = {}
        for key, value in parsed.items():
            if key not in self._emitted_keys:
                # Brand new key
                delta[key] = value
                self._emitted_keys.add(key)
            elif key in self._last_parsed and parsed[key] != self._last_parsed[key]:
                # Value changed (e.g., list field grew)
                delta[key] = value

        self._last_parsed = parsed
        return delta

    def reset(self):
        """Reset tracker state for the next structured output call."""
        self._buffer = ""
        self._last_parsed = {}
        self._emitted_keys = set()
