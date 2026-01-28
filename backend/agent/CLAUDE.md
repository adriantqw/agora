# Agent Module

LangGraph-based AI agents for the Agora platform.

## Structure

```
agent/
├── config/
│   ├── agent.yml        # Agent configs (model params, recursion limits)
│   ├── model.yml        # LLM model configurations
│   └── vector_db.yml    # ChromaDB vector store config
├── src/
│   ├── agents/
│   │   ├── catalogue_ingestor/  # PDF catalogue extraction agent
│   │   ├── personal_stylist/    # Interactive style preference gathering
│   │   └── matchmaker/          # Product matching via vector search
│   ├── models/
│   │   └── langchain_utils.py   # Model loading utilities
│   ├── prompts/
│   │   └── templates.yml        # System prompts for all agents
│   ├── utils/
│   │   ├── yaml.py              # Config/template loaders
│   │   ├── image.py             # Image processing utilities
│   │   └── stream.py            # Streaming utilities
│   └── vector_db/
│       └── catalogue.py         # CatalogueVectorDb (ChromaDB + Gemini embeddings)
└── tests/
```

## Agent Pattern

All agents follow a consistent LangGraph pattern:

```python
class AgentName:
    def __init__(self):
        self.agent_config = load_config("agent")["agent_name"]
        self.model = load_model_from_config(self.agent_config["model"])
        self.checkpointer = MemorySaver()
        self.tools = [...]
        self.agent = self._compile_graph()

    def _compile_graph(self):
        workflow = StateGraph(AgentState)
        # Add nodes, edges, conditional routing
        return workflow.compile(checkpointer=self.checkpointer)
```

## Agents

### PersonalStylistAgent
Gathers user style preferences via interactive UI components.

- **Entry**: `chat(message, thread_id)` or `submit_answers(thread_id, answers)`
- **State**: `messages`, `journey` (JourneySchema), `ui_inputs`, `ui_answers`
- **Tools**: `Txt2ImgGenerator` (batch image generation)
- **Output**: `UIInputList` with questions for the user

### MatchMakerAgent
Matches products to user preferences using vector search.

- **Entry**: `match(journey, thread_id)` or `match_stream(journey, thread_id)`
- **State**: `messages`, `journey`, `matches`, `iteration_count`
- **Tools**: `search_products` (vector similarity search)
- **Output**: `MatchResult` with `ProductMatch` or `ProductMatchSet` items

### CatalogueIngestorAgent
Extracts product data from PDF catalogue pages.

- **Entry**: Direct invocation with page image
- **Output**: Structured product data with bounding boxes

## Key Schemas

### JourneySchema (personal_stylist)
```python
title: str
time_of_day: Optional["morning"|"afternoon"|"evening"|"night"]
season: Optional["winter"|"autumn"|"spring"|"summer"]
occasion: Optional[str]
style_preferences: Optional[list[str]]
colour_preferences: Optional[list[str]]
budget_range: Optional[int]
```

### ProductMatch (matchmaker)
```python
id: str
name: str
description: Optional[str]
image_url: Optional[str]
score: Optional[float]
```

## Vector Database

`CatalogueVectorDb` syncs SQLite catalogue items and products to ChromaDB.

```python
from agent.src.vector_db import CatalogueVectorDb

vdb = CatalogueVectorDb("catalogue_items")
vdb.bulk_sync_catalogue()  # Sync all items
vdb.search("elegant navy dress", n_results=10)  # Similarity search
```

- **Embedding model**: `models/gemini-embedding-001`
- **Persist directory**: `./data/vector_db`
- **ID format**: `catalogue_{id}` or `product_{id}`

## Running Tests

```bash
cd backend
python -m agent.tests.test_matchmaker
python -m agent.tests.test_personal_stylist
```

## Adding a New Agent

1. Create folder: `src/agents/new_agent/`
2. Add files: `core.py`, `schemas.py`, `states.py`, `tools.py`
3. Add config to `config/agent.yml`
4. Add prompts to `src/prompts/templates.yml`
5. Follow the LangGraph pattern from existing agents
