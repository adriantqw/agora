## Catalogue Ingestor Agent

AI-powered agent for processing product catalogue PDFs using LangGraph and Google Gemini.

## Directory Structure

```
agent/
├── src/                     # Agent source code
│   ├── agents/
│   │   ├── catalogue_ingestor.py    # Main agent class
│   │   ├── schemas.py               # Pydantic schemas
│   │   └── states.py                # LangGraph states
│   ├── models/
│   │   └── utils.py                 # Model loading utilities
│   └── utils/
│       ├── image.py                 # Image processing
│       └── yaml.py                  # Config loading
├── config/
│   └── agent.yml           # Agent configuration
├── tests/
│   └── test_catalogue_ingestor.py
├── main.py                 # Public API functions
└── README.md
```

## Development Setup

**Dependencies are managed at the backend root level** (`backend/pyproject.toml`), not in this subdirectory.

To set up the development environment:

```bash
# From the backend directory
cd backend

# Create virtual environment and install all dependencies
uv venv
uv sync

# Activate virtual environment
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows
```

**Note**: You will need to separately install Tesseract OCR:
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- macOS: `brew install tesseract`
- Linux: `sudo apt-get install tesseract-ocr`

## Environment Variables

Environment variables are configured in `backend/.env` (not in this directory):

```env
GOOGLE_API_KEY=<your_google_api_key>  # Gemini API key from Google AI Studio
TESSERACT_PATH=/usr/bin/tesseract     # Path to Tesseract binary
```

Get your Google API key from: https://makersuite.google.com/app/apikey

## Usage

### As Part of Backend API

The agent is integrated into the FastAPI backend and used via the `/api/catalogues/upload` endpoint.

### Standalone Testing

Test the agent directly:

```bash
# From backend directory with venv activated
python agent/tests/test_catalogue_ingestor.py --pdf_path /path/to/catalogue.pdf
```

### Programmatic Usage

```python
from agent.src.agents.catalogue_ingestor import CatalogueIngestor

# Initialize the agent
ingestor = CatalogueIngestor()

# Process a PDF
final_state = await ingestor.ingest(pdf_path="catalogue.pdf")

# Parse results
items = ingestor.parse_final_state(final_state)
```

## Core Functionality

Located in `main.py`:

- `ingest_catalogue(file_path)` - Synchronous PDF ingestion
- `ingest_catalogue_stream(file_path)` - Async streaming ingestion
- `parse_final_agent_state(state)` - Extract structured items from agent state

## Agent Configuration

Agent behavior is configured in `config/agent.yml`:

```yaml
catalogue_ingestor:
  model:
    name: gemini-3-pro-preview
    params:
      temperature: 0.7
      max_tokens: 1024
```