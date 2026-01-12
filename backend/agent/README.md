## Introduction
Backend interface for the app. Contains API endpoints to interface with the front-end utilising Agentic AI under the hood.

## Contributing
### Environment management
The project uses uv for python package management. Install dependencies:

```bash
uv sync --frozen
```

### Environment variables
Create a `.env` file with the following configuration

```env
GOOGLE_API_KEY=<your_google_api_key>
```

## Launch FastAPI app
Launch the app locally:
```bash
uv run fastapi dev app.py
```

## API Reference
### Ingest Catalogue
Ingest a catalogue PDF and return extracted items.

- **URL**: `/catalogue/ingest`
- **Method**: `POST`
- **Query Parameters**:
    - `file_path` (string, required): The absolute path to the PDF file to ingest.
- **Response**: JSON object containing a list of `catalogue_items`.

### Stream Ingest Catalogue
Ingest a catalogue PDF and stream events (server-sent events / NDJSON).

- **URL**: `/catalogue/ingest/stream`
- **Method**: `POST`
- **Query Parameters**:
    - `file_path` (string, required): The absolute path to the PDF file to ingest.
- **Response**: Stream of JSON objects (NDJSON), each representing an event or extracted item.