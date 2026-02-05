# Stage 1: Builder
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# --- FIX 1: Use the official uv binary instead of the curl script ---
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock ./

# --- FIX 2: Create the venv properly using uv ---
# We set UV_PROJECT_ENVIRONMENT so uv knows exactly where to put the venv
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
RUN uv sync --frozen --no-install-project

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install Tesseract OCR and runtime dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TESSERACT_PATH=/usr/bin/tesseract

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser agent ./agent
COPY --chown=appuser:appuser scripts ./scripts
COPY --chown=appuser:appuser run.py .
COPY --chown=appuser:appuser agora.db ./agora.db

USER appuser
EXPOSE 8080

# Health check (Ensure 'requests' is in your pyproject.toml)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=5)" || exit 1

# --- FIX 3: Solve the JSONArgsRecommended warning ---
# To use environment variables like ${PORT} in JSON format, we call the shell explicitly
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --no-access-log"]