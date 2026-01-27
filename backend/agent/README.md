# Agent Module

AI-powered agents for the Agora platform using LangGraph and Google Gemini.

## Directory Structure

```
agent/
├── config/
│   ├── agent.yml           # Agent configurations
│   ├── model.yml           # LLM model settings
│   └── vector_db.yml       # ChromaDB vector store config
├── src/
│   ├── agents/
│   │   ├── catalogue_ingestor/  # PDF catalogue extraction
│   │   ├── personal_stylist/    # Interactive style gathering
│   │   └── matchmaker/          # Product matching via vector search
│   ├── models/
│   │   └── langchain_utils.py   # Model loading utilities
│   ├── prompts/
│   │   └── templates.yml        # System prompts for all agents
│   ├── utils/
│   │   ├── yaml.py              # Config/template loaders
│   │   ├── image.py             # Image processing
│   │   └── stream.py            # Streaming utilities
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
from agent.src.agents.personal_stylist.schemas import JourneySchema

agent = MatchMakerAgent()
journey = JourneySchema(
    title="Brunch Date",
    occasion="brunch",
    style_preferences=["minimalist", "elegant"],
    colour_preferences=["navy", "white"]
)
result = agent.match(journey, thread_id="session-123")
# Returns MatchResult with ProductMatch items
```

## Vector Database

ChromaDB with Gemini embeddings for product similarity search.

```python
from agent.src.vector_db import CatalogueVectorDb

vdb = CatalogueVectorDb("catalogue_items")
vdb.bulk_sync_catalogue()  # Sync all products + catalogue items
results = vdb.search("elegant navy dress", n_results=10)
```

## Running Tests

```bash
cd backend

# Test individual agents
python -m agent.tests.test_matchmaker
python -m agent.tests.test_personal_stylist
python -m agent.tests.test_catalogue_ingestor --pdf_path /path/to/catalogue.pdf
```

## Agent Configuration

`config/agent.yml`:

```yaml
catalogue_ingestor:
  model:
    name: gemini-3-pro-preview
    params:
      temperature: 0.7
      max_tokens: 1024

personal_stylist:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096

matchmaker:
  model:
    name: gemini-3-pro-preview
    params:
      max_tokens: 4096
```
