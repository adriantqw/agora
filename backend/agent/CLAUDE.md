# Agent Module

LangGraph-based AI agents for the Agora platform.

## Structure

```
agent/
├── config/
│   ├── agent.yml        # Agent configs (model params, recursion limits)
│   ├── model.yml        # LLM model configurations
│   ├── personality.yml  # Personality configurations for agents
│   └── vector_db.yml    # ChromaDB vector store config
├── src/
│   ├── agents/
│   │   ├── catalogue_ingestor/  # PDF catalogue extraction agent
│   │   ├── personal_stylist/    # Interactive style preference gathering
│   │   ├── matchmaker/          # Product matching via vector search
│   │   ├── fitting_assistant/   # Virtual fitting room visualization
│   │   ├── style_dna/           # Long-term user style profile management
│   │   ├── schemas.py           # Shared schemas (JourneySchema, StyleDna, enums)
│   │   └── tools.py             # Shared tools (load_image, Txt2ImgGenerator, google_search)
│   ├── models/
│   │   └── langchain_utils.py   # Model loading utilities
│   ├── prompts/
│   │   └── templates.yml        # System prompts for all agents
│   ├── utils/
│   │   ├── yaml.py              # Config/template loaders
│   │   ├── image.py             # Image processing utilities
│   │   ├── google_img_search.py # Google image search utility
│   │   └── stream.py            # Streaming utilities
│   ├── memory_utils.py          # AgoraMemory (SQLite-based long-term memory)
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
- **Tools**: `Txt2ImgGenerator` (batch image generation), `google_search`
- **Output**: `UIInputList` with questions for the user

### MatchMakerAgent
Matches products to user preferences using vector search.

- **Entry**: `match(journey, thread_id)` or `match_stream(journey, thread_id)`
- **State**: `messages`, `journey`, `matches`, `iteration_count`
- **Tools**: `search_products` (vector similarity search), `google_search`
- **Output**: `MatchResult` with `ProductMatch` or `ProductMatchSet` items

### FittingAssistantAgent
Virtual fitting room visualization using text-to-image generation.

- **Entry**: `fit(journey, product_selections, thread_id)` or `fit_stream(...)`
- **State**: `messages`, `journey`, `product_selections`, `product_details`, `fitting_sets`, `personality`
- **Tools**: `Txt2ImgGenerator`, `load_image`, `get_product_details`, `google_search` (optional)
- **Output**: `FittingSets` with generated fitting room images
- **Features**: Personality support, multimodal product image input

### StyleDnaAgent
Maintains long-term user style profiles using a stability protocol.

- **Entry**: `update_from_ootd(user_id, ootd_images, thread_id)` or `update_from_interaction(user_id, interaction_state, thread_id)`
- **State**: `messages`, `user_id`, `ootd_images`, `interaction_state`, `current_style_dna`, `updated_style_dna`
- **Tools**: `load_image`, `google_search` (optional)
- **Output**: `StyleDna` with updated style profile
- **Memory**: Uses `AgoraMemory` for persistent storage
- **Features**: 85%/15% stability weighting, celebrity style twin matching with Google image search

### CatalogueIngestorAgent
Extracts product data from PDF catalogue pages.

- **Entry**: Direct invocation with page image
- **Output**: Structured product data with bounding boxes

## Key Schemas

### JourneySchema (shared)
```python
title: str
summary: str
time_of_day: Optional[TimeOfDay]  # morning, afternoon, evening, night
season: Optional[Season]  # winter, autumn, spring, summer, transitional
occasion: Optional[OccasionType]  # casual, formal, semi_formal, business_casual, party, date_night, wedding, black_tie, workout, lounging, festival
location: Optional[LocationType]  # indoors, outdoors, beach, office, gym, restaurant, nightclub, mountains, airport, urban, resort
fit_preference: Optional[FitType]  # slim, compression, oversized, regular, relaxed, tailored, cropped
style_preferences: Optional[list[StyleType]]  # bohemian, classic, minimalist, streetwear, grunge, preppy, athleisure, dark_academia, old_money, gorpcore, y2k, vintage, cyberpunk, cottagecore
colour_palette: Optional[list[str]]  # Hex colors, max 5
mood_board_path: Optional[FilePath | FileUrl]
budget_rating: Optional[int]  # 1-5
other: Optional[str]
```

### StyleDna (style_dna)
```python
title: str
description: str
style_preferences: Optional[list[StyleType]]
colour_palette: Optional[list[str]]  # Hex colors, max 5
brand_preferences: Optional[list[str]]
primary_silhoutte: Optional[FitType]
budget_rating: Optional[int]  # 1-5
celebrity_style_twin: str
celebrity_twin_reasoning: str
celebrity_twin_images: Optional[list[FilePath | FileUrl]]
mood_board_path: Optional[FilePath | FileUrl]
reasoning: str  # Internal reasoning
```

### ProductMatch (matchmaker)
```python
id: str
name: str
description: Optional[str]
image_url: Optional[str]
score: Optional[float]
```

### ProductSelections (fitting_assistant)
```python
matches: list[ProductSelected | ProductSelectedSet]

# ProductSelected
id: str

# ProductSelectedSet
title: str
description: str
product_set: list[ProductSelected]
```

### FittingSets (fitting_assistant output)
```python
message: str
fitting_sets: list[FittingSetObject]

# FittingSetObject
title: str
description: str
product_ids: list[str]
image_path: list[FilePath | FileUrl]
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

## Long-Term Memory

`AgoraMemory` provides SQLite-based persistent storage for StyleDna.

```python
from agent.src.memory_utils import AgoraMemory

memory = AgoraMemory()
memory.retrieve_memory(user_id)  # Get latest StyleDna
memory.update_memory(user_id, style_dna)  # Store updated StyleDna
memory.clear_memory(user_id)  # Clear user's memory
```

- **Storage**: SQLite (`agora_memory.db`)
- **Namespace**: `(user_id, "memories")`

## Running Tests

```bash
cd backend
uv run python -m agent.tests.test_matchmaker
uv run python -m agent.tests.test_personal_stylist
uv run python -m agent.tests.test_fitting_assistant
uv run python -m agent.tests.test_style_dna
```

## Adding a New Agent

1. Create folder: `src/agents/new_agent/`
2. Add files: `core.py`, `schemas.py`, `states.py`, `tools.py` (optional), `__init__.py`
3. Add config to `config/agent.yml`
4. Add prompts to `src/prompts/templates.yml`
5. Add personality config to `config/personality.yml` (if using personalities)
6. Follow the LangGraph pattern from existing agents
7. Add test file: `tests/test_new_agent.py`
