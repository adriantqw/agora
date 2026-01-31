# Agent Tests

This folder contains test scripts for the Agora AI agents.

## Test Files

| File | Description |
|------|-------------|
| `test_catalogue_ingestor.py` | Tests for PDF catalogue extraction agent |
| `test_personal_stylist.py` | Tests for interactive style preference gathering agent |
| `test_matchmaker.py` | Tests for product recommendation agent |
| `test_fitting_assistant.py` | Tests for virtual fitting room visualization agent |
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
    occasion="vacation",
    location="beach",
    style_preferences=["bohemian", "minimalist"],  # Enum: bohemian, classic, classy, minimalist, streetwear
    fit_preferences=["relaxed"],                    # Enum: slim, oversized, regular, relaxed, tailored
    colour_preferences=["#FFFFFF", "#F5F5DC"],      # Hex colors
    time_of_day="afternoon",                        # Enum: morning, afternoon, evening, night
    season="summer",                                # Enum: winter, autumn, spring, summer
    budget_rating=3                                 # 1-5
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
