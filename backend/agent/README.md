# Agent Module

AI-powered agents for the Agora platform using LangGraph and Google Gemini.

## Directory Structure

```
agent/
├── config/
│   ├── agent.yml           # Agent configurations
│   ├── model.yml           # LLM model settings
│   ├── personality.yml     # Personality configurations for agents
│   └── vector_db.yml       # ChromaDB vector store config
├── src/
│   ├── agents/
│   │   ├── catalogue_ingestor/  # PDF catalogue extraction
│   │   ├── personal_stylist/    # Interactive style gathering
│   │   ├── matchmaker/          # Product matching via vector search
│   │   ├── fitting_assistant/   # Virtual fitting room visualization
│   │   ├── style_dna/           # Long-term user style profile management
│   │   ├── schemas.py           # Shared schemas (JourneySchema, StyleDna, enums)
│   │   └── tools.py             # Shared tools (load_image, Txt2ImgGenerator)
│   ├── models/
│   │   └── langchain_utils.py   # Model loading utilities
│   ├── prompts/
│   │   └── templates.yml        # System prompts for all agents
│   ├── utils/
│   │   ├── yaml.py              # Config/template loaders
│   │   ├── image.py             # Image processing
│   │   ├── google_img_search.py # Google image search utility
│   │   └── stream.py            # Streaming utilities
│   ├── memory_utils.py          # AgoraMemory (SQLite long-term memory)
│   └── vector_db/
│       └── catalogue.py         # ChromaDB + Gemini embeddings
└── tests/
```

## Development Setup

**Dependencies are managed at the backend root level** (`backend/pyproject.toml`).

```bash
cd backend
uv venv
uv sync
source .venv/bin/activate
```

**Additional requirements:**
- Tesseract OCR: `brew install tesseract` (macOS) or `apt-get install tesseract-ocr` (Linux)

## Environment Variables

Configure in `backend/.env`:

```env
GOOGLE_API_KEY=<your_google_api_key>
TESSERACT_PATH=/usr/bin/tesseract
```

## Agents

### CatalogueIngestorAgent

Extracts product data from PDF catalogue pages.

```python
from agent.src.agents.catalogue_ingestor import CatalogueIngestor

ingestor = CatalogueIngestor()
final_state = await ingestor.ingest(pdf_path="catalogue.pdf")
items = ingestor.parse_final_state(final_state)
```

### PersonalStylistAgent

Gathers user style preferences via interactive UI components.

```python
from agent.src.agents.personal_stylist.core import PersonalStylistAgent

agent = PersonalStylistAgent()
result = agent.chat("I need an outfit for a brunch date", thread_id="session-123")
# Returns UI components (image-choice, multi-select, etc.)

# Submit user answers
result = agent.submit_answers(thread_id="session-123", answers=[...])
```

**JourneySchema** (accumulated preferences):
- `occasion`, `style_preferences`, `colour_preferences`
- `time_of_day`, `season`, `budget_range`

### MatchMakerAgent

Matches products to user preferences using vector similarity search.

```python
from agent.src.agents.matchmaker.core import MatchMakerAgent
from agent.src.agents.schemas import JourneySchema

agent = MatchMakerAgent()
journey = JourneySchema(
    title="Brunch Date",
    occasion="casual",
    style_preferences=["minimalist"],
    colour_palette=["#000080", "#FFFFFF"]
)
result = agent.match(journey, thread_id="session-123")
# Returns MatchResult with ProductMatch items
```

### FittingAssistantAgent

Virtual fitting room visualization using text-to-image generation.

```python
from agent.src.agents.fitting_assistant.core import FittingAssistantAgent
from agent.src.agents.fitting_assistant.schemas import ProductSelections, ProductSelected, ProductSelectedSet
from agent.src.agents.schemas import JourneySchema

agent = FittingAssistantAgent()
journey = JourneySchema(title="Summer Outfit", season="summer")
selections = ProductSelections(matches=[
    ProductSelected(id="product_001"),
    ProductSelectedSet(
        title="Beach Ensemble",
        description="Complete beach look",
        product_set=[ProductSelected(id="product_002"), ProductSelected(id="product_003")]
    )
])
result = agent.fit(journey, selections, thread_id="session-123", personality="friendly")
# Returns FittingSets with generated fitting room images
```

### StyleDnaAgent

Maintains long-term user style profiles with stability weighting.

```python
from agent.src.agents.style_dna.core import StyleDnaAgent

agent = StyleDnaAgent()

# Update from OOTD (outfit-of-the-day) images
result = agent.update_from_ootd(
    user_id="user-123",
    ootd_images=["https://example.com/outfit.jpg"],
    thread_id="session-123"
)

# Update from interaction state (JourneySchema from other agents)
from agent.src.agents.schemas import JourneySchema
journey = JourneySchema(title="Casual Friday", occasion="business_casual")
result = agent.update_from_interaction(
    user_id="user-123",
    interaction_state=journey,
    thread_id="session-456"
)

# Retrieve current Style DNA
style_dna = agent.get_style_dna("user-123")
```

## Vector Database

ChromaDB with Gemini embeddings for product similarity search.

```python
from agent.src.vector_db import CatalogueVectorDb

vdb = CatalogueVectorDb("catalogue_items")
vdb.bulk_sync_catalogue()  # Sync all products + catalogue items
results = vdb.search("elegant navy dress", n_results=10)
```

## Long-Term Memory

SQLite-based persistent storage for Style DNA profiles.

```python
from agent.src.memory_utils import AgoraMemory

memory = AgoraMemory()
dna = memory.retrieve_memory("user-123")  # Get latest StyleDna
memory.update_memory("user-123", updated_dna)  # Store StyleDna
memory.clear_memory("user-123")  # Clear user's memory
```

## Running Tests

```bash
cd backend

# Test individual agents
uv run python -m agent.tests.test_matchmaker
uv run python -m agent.tests.test_personal_stylist
uv run python -m agent.tests.test_fitting_assistant
uv run python -m agent.tests.test_style_dna
uv run python -m agent.tests.test_catalogue_ingestor --pdf_path /path/to/catalogue.pdf
uv run python -m agent.tests.test_txt2img
```

## Agent Configuration

`config/agent.yml`:

```yaml
catalogue_ingestor:
  model:
    name: gemini-3-pro-preview
    params:
      temperature: 0.7
      max_tokens: 2048
      thinking_level: low
  recursion_limit: 100
  enable_google_search_tool: false

personal_stylist:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096
      thinking_level: low
  recursion_limit: 25
  enable_google_search_tool: true

matchmaker:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096
      thinking_level: low
  recursion_limit: 25
  enable_google_search_tool: true

fitting_assistant:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096
      thinking_level: low
  recursion_limit: 25
  enable_google_search_tool: false

style_dna:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096
      thinking_level: low
  recursion_limit: 15
  enable_google_search_tool: true
```
