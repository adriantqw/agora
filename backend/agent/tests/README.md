# Agent Tests

This folder contains test scripts for the Agora AI agents.

## Test Files

| File | Description |
|------|-------------|
| `test_catalogue_ingestor.py` | Tests for PDF catalogue extraction agent |
| `test_personal_stylist.py` | Tests for interactive style preference gathering agent |
| `test_matchmaker.py` | Tests for product recommendation agent |
| `test_fitting_assistant.py` | Tests for virtual fitting room visualization agent |
| `test_style_dna.py` | Tests for long-term style profile management agent |
| `test_txt2img.py` | Tests for text-to-image generation tools |

## Running Tests

### Prerequisites

1. Activate the virtual environment:
   ```bash
   cd backend
   source .venv/bin/activate
   ```

2. Ensure environment variables are set (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

### Run Individual Tests

```bash
# From the backend directory
uv run python -m agent.tests.test_fitting_assistant
uv run python -m agent.tests.test_matchmaker
uv run python -m agent.tests.test_personal_stylist
uv run python -m agent.tests.test_style_dna
uv run python -m agent.tests.test_catalogue_ingestor
uv run python -m agent.tests.test_txt2img
```

### Test Structure

Each test file follows a consistent pattern:

1. **Unit Tests** - Run without API calls
   - Agent initialization
   - Schema validation
   - Personality validation
   - State management

2. **Integration Tests** - Require valid API keys
   - Streaming invocation (`fit_stream()`, `match_stream()`, etc.)
   - End-to-end workflows

## Test Data

Tests use mock data that mirrors production schemas:

### JourneySchema (User Preferences)
```python
JourneySchema(
    title="Summer Beach Vacation",
    summary="A relaxed bohemian beach look",
    occasion="casual",                              # Enum: casual, formal, semi_formal, business_casual, party, date_night, wedding, black_tie, workout, lounging, festival
    location="beach",                               # Enum: indoors, outdoors, beach, office, gym, restaurant, nightclub, mountains, airport, urban, resort
    style_preferences=["bohemian", "minimalist"],   # Enum: bohemian, classic, minimalist, streetwear, grunge, preppy, athleisure, dark_academia, old_money, gorpcore, y2k, vintage, cyberpunk, cottagecore
    fit_preference="relaxed",                       # Enum: slim, compression, oversized, regular, relaxed, tailored, cropped
    colour_palette=["#FFFFFF", "#F5F5DC"],          # Hex colors (max 5)
    time_of_day="afternoon",                        # Enum: morning, afternoon, evening, night
    season="summer",                                # Enum: winter, autumn, spring, summer, transitional
    budget_rating=3                                 # 1-5
)
```

### StyleDna (Long-term Profile)
```python
StyleDna(
    title="Bohemian Minimalist",
    description="A clean, earthy aesthetic with relaxed silhouettes",
    style_preferences=["bohemian", "minimalist"],
    colour_palette=["#FFFFFF", "#F5F5DC", "#8B7355"],
    brand_preferences=["Everlane", "Reformation"],
    primary_silhoutte="relaxed",
    budget_rating=3,
    celebrity_style_twin="Zoe Kravitz",
    celebrity_twin_reasoning="Shares your preference for effortless, minimalist pieces with bohemian touches",
    celebrity_twin_images=["https://example.com/celeb.jpg"],
    reasoning="Internal analysis notes..."
)
```

### ProductSelections (Fitting Assistant Input)
```python
ProductSelections(
    matches=[
        ProductSelected(id="product_001"),
        ProductSelectedSet(
            title="Beach Day Ensemble",
            description="A complete beach-ready look",
            product_set=[
                ProductSelected(id="product_003"),
                ProductSelected(id="product_004"),
            ]
        ),
    ]
)
```

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Google Gemini API key for LLM and embeddings |

## Notes

- Integration tests make real API calls and may incur costs
- Image generation tests create temporary files that are cleaned up automatically
- Thread IDs are generated with UUIDs to ensure test isolation
- Streaming tests output progress to console for debugging
