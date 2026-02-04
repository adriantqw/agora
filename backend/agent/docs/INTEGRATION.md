# Agent Integration Guide

This document provides comprehensive API documentation for integrating Agora agents into backend services and frontend applications.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Agent API Reference](#agent-api-reference)
  - [CatalogueIngestor](#catalogueingestor)
  - [PersonalStylistAgent](#personalstylistagent)
  - [MatchMakerAgent](#matchmakeragent)
  - [FittingAssistantAgent](#fittingassistantagent)
  - [StyleDnaAgent](#stylednaagent)
- [Streaming Patterns](#streaming-patterns)
- [Common Schemas](#common-schemas)
- [Error Handling](#error-handling)

---

## Overview

All Agora agents follow a consistent pattern:

- **Sync methods** return a `dict` containing the final agent state
- **Stream methods** (`*_stream`) return an `AsyncGenerator` of LangGraph events
- **State methods** (`get_state`) return the current `StateSnapshot` for a thread
- **Thread IDs** are required for session persistence via `MemorySaver`

## Quick Start

```python
import uuid
from agent.src.agents.matchmaker.core import MatchMakerAgent
from agent.src.agents.schemas import JourneySchema

# Initialize agent (do once, reuse instance)
agent = MatchMakerAgent()

# Create journey from user preferences
journey = JourneySchema(
    title="Summer Beach Trip",
    occasion="casual",
    season="summer",
    style_preferences=["bohemian", "minimalist"],
    colour_palette=["#FFFFFF", "#F5F5DC"]
)

# Generate unique thread ID for session
thread_id = str(uuid.uuid4())

# Synchronous call
result = agent.match(journey, thread_id)
print(result["matches"])

# Streaming call
async for event in agent.match_stream(journey, thread_id):
    # Process events in real-time
    pass
```

---

## Agent API Reference

### CatalogueIngestor

Extracts product data from PDF catalogue pages using vision models.

#### Methods

| Method | Description |
|--------|-------------|
| `ingest(pdf_path)` | Process PDF and return extracted items |
| `stream_ingest(pdf_path)` | Stream processing events |
| `parse_final_state(state)` | Convert final state to item payloads |

#### `ingest(pdf_path: str) -> dict`

Synchronously process a PDF catalogue.

**Parameters:**
- `pdf_path` (str): Absolute path to the PDF file

**Returns:** `dict` - Final agent state containing:
- `catalogue_items`: List of extracted items
- `current_page_idx`: Last processed page index
- `total_pages`: Total pages in PDF

**Example:**
```python
from agent.src.agents.catalogue_ingestor.core import CatalogueIngestor

agent = CatalogueIngestor()
result = agent.ingest("/path/to/catalogue.pdf")

for item in result["catalogue_items"]:
    print(f"Found: {item['name']} on page {item['page']}")
```

#### `stream_ingest(pdf_path: str) -> AsyncGenerator`

Stream processing events for real-time progress updates.

**Parameters:**
- `pdf_path` (str): Absolute path to the PDF file

**Yields:** LangGraph events with progress metadata

**Example:**
```python
from agent.src.utils.stream import AgentEventParser

parser = AgentEventParser("catalogue_ingestor")

async for event in agent.stream_ingest("/path/to/catalogue.pdf"):
    metadata = parser.parse(event)
    if metadata["current_page"] is not None:
        print(f"Processing page {metadata['current_page']}, found {metadata['item_count']} items")
```

#### `parse_final_state(final_state: CatalogueIngestorState) -> list[dict]`

Convert the final state into a list of catalogue item payloads.

**Parameters:**
- `final_state`: The CatalogueIngestorState object

**Returns:** `list[dict]` - List of items with keys:
- `name`: Product name
- `description`: Product description
- `sizes`: List of available sizes
- `colours`: List of available colors
- `page`: Page number where item was found
- `image_path`: Path to cropped item image
- `bbox_data`: Bounding box coordinates

---

### PersonalStylistAgent

Interactive agent that gathers user style preferences through UI components.

#### Methods

| Method | Description |
|--------|-------------|
| `chat(message, thread_id, personality?)` | Send message, get UI components |
| `chat_stream(message, thread_id, personality?)` | Stream chat response |
| `submit_answers(thread_id, answers, personality?)` | Submit UI answers |
| `submit_answers_stream(thread_id, answers, personality?)` | Stream answer processing |
| `get_state(thread_id)` | Get current session state |

#### `chat(message: str, thread_id: str, personality: str = "friendly") -> dict`

Send a message and receive UI components for user input.

**Parameters:**
- `message` (str): User's message
- `thread_id` (str): Session identifier
- `personality` (str, optional): Agent personality ("friendly", "professional", etc.)

**Returns:** `dict` - Agent state containing:
- `messages`: Conversation history
- `ui_inputs`: List of UI components to render
- `journey`: Current JourneySchema state

**Example:**
```python
from agent.src.agents.personal_stylist.core import PersonalStylistAgent
import uuid

agent = PersonalStylistAgent()
thread_id = str(uuid.uuid4())

result = agent.chat("I need an outfit for a beach wedding", thread_id)

for component in result["ui_inputs"]:
    print(f"Question: {component['label']}")
    print(f"Type: {component['type']}")  # image-choice, multi-select, etc.
```

#### `submit_answers(thread_id: str, answers: list[UserResponse], personality: str = "friendly") -> dict`

Submit user's answers to UI components.

**Parameters:**
- `thread_id` (str): Session identifier (must match previous chat)
- `answers` (list[UserResponse]): List of user responses
- `personality` (str, optional): Agent personality

**Returns:** `dict` - Updated agent state with new UI components or completed journey

**Example:**
```python
from agent.src.agents.personal_stylist.schemas import UserResponse

answers = [
    UserResponse(input_id="q1", response="summer"),
    UserResponse(input_id="q2", response=["bohemian", "minimalist"])
]

result = agent.submit_answers(thread_id, answers)

# Check if journey is complete
if result.get("journey") and result["journey"].get("title"):
    print("Journey complete!")
```

#### `get_state(thread_id: str) -> StateSnapshot`

Retrieve the current state for a session.

**Parameters:**
- `thread_id` (str): Session identifier

**Returns:** `StateSnapshot` - LangGraph state snapshot

---

### MatchMakerAgent

Matches products to user preferences using vector similarity search.

#### Methods

| Method | Description |
|--------|-------------|
| `match(journey, thread_id, message?, personality?)` | Find matching products |
| `match_stream(journey, thread_id, message?, personality?)` | Stream matching process |
| `get_state(thread_id)` | Get current session state |

#### `match(journey: JourneySchema, thread_id: str, message: str = None, personality: str = "friendly") -> dict`

Find products matching the user's journey preferences.

**Parameters:**
- `journey` (JourneySchema): User's style preferences
- `thread_id` (str): Session identifier
- `message` (str, optional): Additional user message
- `personality` (str, optional): Agent personality

**Returns:** `dict` - Agent state containing:
- `messages`: Conversation history
- `matches`: MatchResult with product matches

**Example:**
```python
from agent.src.agents.matchmaker.core import MatchMakerAgent
from agent.src.agents.schemas import JourneySchema

agent = MatchMakerAgent()

journey = JourneySchema(
    title="Office Casual",
    occasion="business_casual",
    style_preferences=["classic", "minimalist"],
    colour_palette=["#000000", "#FFFFFF", "#808080"],
    budget_rating=3
)

result = agent.match(journey, thread_id="match-session-1")

# Access matches
matches = result["matches"]
for match in matches.matches:
    if hasattr(match, 'product_set'):
        # ProductMatchSet - group of items
        print(f"Set: {match.title}")
        for product in match.product_set:
            print(f"  - {product.name}")
    else:
        # ProductMatch - single item
        print(f"Product: {match.name} (score: {match.score})")
```

#### `match_stream(journey: JourneySchema, thread_id: str, message: str = None, personality: str = "friendly") -> AsyncGenerator`

Stream the matching process for real-time updates.

**Example:**
```python
from agent.src.utils.stream import AgentEventParser

parser = AgentEventParser("matchmaker")

async for event in agent.match_stream(journey, thread_id):
    metadata = parser.parse(event)
    if metadata["thinking_messages"]:
        print(f"Agent thinking: {metadata['thinking_messages'][-1][:100]}...")
    if metadata["matches"]:
        print(f"Found {len(metadata['matches'])} matches so far")
```

---

### FittingAssistantAgent

Virtual fitting room visualization using text-to-image generation.

#### Methods

| Method | Description |
|--------|-------------|
| `fit(journey, product_selections, thread_id, message?, personality?)` | Generate fitting images |
| `fit_stream(journey, product_selections, thread_id, message?, personality?)` | Stream generation |
| `get_state(thread_id)` | Get current session state |

#### `fit(journey: JourneySchema, product_selections: ProductSelections, thread_id: str, message: str = None, personality: str = "friendly") -> dict`

Generate virtual fitting room images for selected products.

**Parameters:**
- `journey` (JourneySchema): User's style preferences
- `product_selections` (ProductSelections): Products to visualize
- `thread_id` (str): Session identifier
- `message` (str, optional): Additional styling instructions
- `personality` (str, optional): Agent personality

**Returns:** `dict` - Agent state containing:
- `messages`: Conversation history
- `fitting_sets`: FittingSets with generated images

**Example:**
```python
from agent.src.agents.fitting_assistant.core import FittingAssistantAgent
from agent.src.agents.fitting_assistant.schemas import (
    ProductSelections, ProductSelected, ProductSelectedSet
)
from agent.src.agents.schemas import JourneySchema

agent = FittingAssistantAgent()

journey = JourneySchema(
    title="Evening Party",
    occasion="party",
    location="nightclub",
    style_preferences=["classic", "old_money"],
    season="winter",
    time_of_day="evening",
    budget_rating=4
)

selections = ProductSelections(matches=[
    ProductSelectedSet(
        title="The 'Uptown After Dark' Edit",
        description="A sophisticated blend of structured tailoring and evening glamour",
        product_set=[
            ProductSelected(id="product_07133e69-..."),
            ProductSelected(id="product_3ec097a7-...")
        ]
    ),
    ProductSelected(id="product_47b9121a-...")
])

result = agent.fit(journey, selections, thread_id="fit-session-1")

# Access generated images
fitting_sets = result["fitting_sets"]
print(f"Message: {fitting_sets.message}")
for fit_set in fitting_sets.fitting_sets:
    print(f"  {fit_set.title}: {fit_set.image_path}")
```

#### `fit_stream(...) -> AsyncGenerator`

Stream the image generation process.

**Example:**
```python
from agent.src.utils.stream import AgentEventParser

parser = AgentEventParser("fitting_assistant")

async for event in agent.fit_stream(journey, selections, thread_id):
    metadata = parser.parse(event)
    if metadata["thinking_messages"]:
        print(f"Generating: {metadata['thinking_messages'][-1][:50]}...")
    if metadata["fitting_sets"]:
        print(f"Generated {len(metadata['fitting_sets'])} images")
```

---

### StyleDnaAgent

Maintains long-term user style profiles with stability weighting.

#### Methods

| Method | Description |
|--------|-------------|
| `update_from_ootd(user_id, ootd_images, thread_id)` | Update from outfit images |
| `update_from_ootd_stream(user_id, ootd_images, thread_id)` | Stream OOTD update |
| `update_from_interaction(user_id, interaction_state, thread_id)` | Update from journey |
| `update_from_interaction_stream(user_id, interaction_state, thread_id)` | Stream interaction update |
| `get_style_dna(user_id)` | Get current StyleDna |
| `get_state(thread_id)` | Get session state |

#### `update_from_ootd(user_id: str, ootd_images: list[str], thread_id: str) -> dict`

Update user's StyleDna based on outfit-of-the-day images.

**Parameters:**
- `user_id` (str): Unique user identifier
- `ootd_images` (list[str]): URLs or file paths to outfit images
- `thread_id` (str): Session identifier

**Returns:** `dict` - Agent state containing:
- `updated_style_dna`: New StyleDna profile
- `current_style_dna`: Previous StyleDna (if existed)

**Example:**
```python
from agent.src.agents.style_dna.core import StyleDnaAgent

agent = StyleDnaAgent()

result = agent.update_from_ootd(
    user_id="user_123",
    ootd_images=[
        "https://example.com/outfit1.jpg",
        "/local/path/outfit2.jpg"
    ],
    thread_id="style-session-1"
)

style_dna = result["updated_style_dna"]
print(f"Style: {style_dna.title}")
print(f"Celebrity Twin: {style_dna.celebrity_style_twin}")
print(f"Preferences: {style_dna.style_preferences}")
```

#### `update_from_interaction(user_id: str, interaction_state: JourneySchema, thread_id: str) -> dict`

Update StyleDna based on a completed journey interaction.

**Parameters:**
- `user_id` (str): Unique user identifier
- `interaction_state` (JourneySchema): Completed journey preferences
- `thread_id` (str): Session identifier

**Returns:** `dict` - Agent state with updated StyleDna

**Example:**
```python
from agent.src.agents.schemas import JourneySchema

journey = JourneySchema(
    title="Date Night Look",
    occasion="date_night",
    style_preferences=["minimalist", "classic"],
    colour_palette=["#000000", "#800020"]
)

result = agent.update_from_interaction(
    user_id="user_123",
    interaction_state=journey,
    thread_id="style-session-2"
)
```

#### `get_style_dna(user_id: str) -> StyleDna | None`

Retrieve the current StyleDna for a user from memory.

**Parameters:**
- `user_id` (str): Unique user identifier

**Returns:** `StyleDna` or `None` if no profile exists

**Example:**
```python
style_dna = agent.get_style_dna("user_123")
if style_dna:
    print(f"Found profile: {style_dna.title}")
else:
    print("No style profile yet")
```

---

## Streaming Patterns

### Using AgentEventParser

The `AgentEventParser` class provides a unified interface for parsing streaming events:

```python
from agent.src.utils.stream import AgentEventParser

# Initialize parser for specific agent
parser = AgentEventParser("matchmaker")  # or "catalogue_ingestor", "personal_stylist", etc.

async for event in agent.match_stream(journey, thread_id):
    metadata = parser.parse(event)

    # Common field: thinking_messages (always present)
    if metadata["thinking_messages"]:
        latest_thought = metadata["thinking_messages"][-1]
        print(f"Thinking: {latest_thought[:100]}...")

    # Agent-specific fields vary by type
    # matchmaker: matches, iteration_count
    # fitting_assistant: fitting_sets, product_details, message
    # style_dna: updated_style_dna, current_style_dna, celebrity_twin_images
```

### Backend SSE Integration

Example FastAPI endpoint for streaming:

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json

router = APIRouter()

@router.post("/api/match/stream")
async def stream_match(journey: JourneySchema, thread_id: str):
    async def event_generator():
        parser = AgentEventParser("matchmaker")
        async for event in agent.match_stream(journey, thread_id):
            metadata = parser.parse(event)
            yield f"data: {json.dumps(metadata)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### Frontend SSE Consumption

```javascript
const streamMatch = async (journey, threadId, { onProgress, onComplete }) => {
  const response = await fetch('/api/match/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ journey, thread_id: threadId })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        onProgress(data);
      }
    }
  }
  onComplete();
};
```

---

## Common Schemas

### JourneySchema

User style preferences collected by PersonalStylistAgent.

```python
from agent.src.agents.schemas import JourneySchema

journey = JourneySchema(
    title="Summer Beach Trip",                    # Required: Journey title
    summary="Relaxed bohemian beach looks",       # Optional: Description
    time_of_day="afternoon",                      # Enum: morning, afternoon, evening, night
    season="summer",                              # Enum: winter, autumn, spring, summer, transitional
    occasion="casual",                            # Enum: casual, formal, semi_formal, business_casual, party, date_night, wedding, black_tie, workout, lounging, festival
    location="beach",                             # Enum: indoors, outdoors, beach, office, gym, restaurant, nightclub, mountains, airport, urban, resort
    fit_preference="relaxed",                     # Enum: slim, compression, oversized, regular, relaxed, tailored, cropped
    style_preferences=["bohemian", "minimalist"], # List of StyleType enums
    colour_palette=["#FFFFFF", "#F5F5DC"],        # Hex colors (max 5)
    budget_rating=3,                              # 1-5 scale
    mood_board_path="/path/to/moodboard.jpg",    # Optional: Reference image
    other="Prefer natural fabrics"               # Optional: Additional notes
)
```

### StyleDna

Long-term user style profile managed by StyleDnaAgent.

```python
from agent.src.agents.schemas import StyleDna

style_dna = StyleDna(
    title="Bohemian Minimalist",
    description="Clean, earthy aesthetic with relaxed silhouettes",
    style_preferences=["bohemian", "minimalist"],
    colour_palette=["#FFFFFF", "#F5F5DC", "#8B7355"],
    brand_preferences=["Everlane", "Reformation"],
    primary_silhoutte="relaxed",
    budget_rating=3,
    celebrity_style_twin="Zoe Kravitz",
    celebrity_twin_reasoning="Shares preference for effortless, minimalist pieces",
    celebrity_twin_images=["https://example.com/celeb.jpg"],
    mood_board_path="/path/to/generated/moodboard.jpg",
    reasoning="Internal analysis notes..."  # Not shown to user
)
```

### ProductSelections

Input for FittingAssistantAgent.

```python
from agent.src.agents.fitting_assistant.schemas import (
    ProductSelections, ProductSelected, ProductSelectedSet
)

selections = ProductSelections(matches=[
    # Single product (details populated automatically by agent)
    ProductSelected(id="product_001"),

    # Product set (outfit combination)
    ProductSelectedSet(
        title="Beach Day Ensemble",
        description="Complete beach-ready look",
        product_set=[
            ProductSelected(id="product_002"),
            ProductSelected(id="product_003"),
        ]
    )
])
```

**Note:** `ProductSelected` has optional detail fields (`name`, `description`, `image_url`, `price`, `tags`) that are automatically populated by the FittingAssistantAgent when processing. You only need to provide the `id` when creating selections.

### FittingSets

Output from FittingAssistantAgent.

```python
# Returned from agent.fit()
fitting_sets = result["fitting_sets"]

# Structure:
# FittingSets(
#     message="Here are your virtual fitting room looks!",
#     fitting_sets=[
#         FittingSetObject(
#             title="Beach Ready",
#             description="A relaxed summer look",
#             product_ids=["product_001", "product_002"],
#             image_path=["/path/to/generated/image.jpg"]
#         )
#     ]
# )
```

### UserResponse

Input for PersonalStylistAgent answer submission.

```python
from agent.src.agents.personal_stylist.schemas import UserResponse

answers = [
    UserResponse(input_id="question_1", response="summer"),
    UserResponse(input_id="question_2", response=["bohemian", "minimalist"]),
    UserResponse(input_id="question_3", response=3),  # Scale rating
]
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ValueError: Unknown agent_type` | Invalid agent type passed to AgentEventParser | Use one of: catalogue_ingestor, personal_stylist, matchmaker, fitting_assistant, style_dna |
| `ValueError: Invalid personality` | Unknown personality configuration | Check `config/personality.yml` for valid options |
| `FileNotFoundError` | PDF or image path doesn't exist | Verify file paths before passing to agents |
| `RecursionLimitError` | Agent exceeded max iterations | Increase `recursion_limit` in `config/agent.yml` or simplify request |

### Handling Streaming Errors

```python
try:
    async for event in agent.match_stream(journey, thread_id):
        metadata = parser.parse(event)
        # Process event...
except Exception as e:
    # Log error
    print(f"Stream error: {e}")
    # Fallback to sync method
    result = agent.match(journey, thread_id)
```

### Thread ID Best Practices

```python
import uuid

# Generate unique thread ID per session
thread_id = str(uuid.uuid4())

# Or use user-specific thread for continuity
thread_id = f"user_{user_id}_session_{session_id}"

# Retrieve previous state if resuming
state = agent.get_state(thread_id)
if state:
    print("Resuming previous session")
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key for LLM and embeddings |
| `SERP_API_KEY` | Yes | Serp API key for google image search |

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Agent module overview
- [README.md](../README.md) - Getting started guide
- [tests/README.md](../tests/README.md) - Testing documentation
