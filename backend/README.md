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