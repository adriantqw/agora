# Multi-stage Dockerfile for FastAPI backend optimized for Cloud Run

# Stage 1: Builder - Install dependencies with uv
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy dependency files
COPY agent/pyproject.toml agent/pyproject.toml
COPY agent/uv.lock agent/uv.lock 2>/dev/null || true

# Create virtual environment and install dependencies
WORKDIR /app/agent
RUN uv venv /opt/venv
RUN uv sync --frozen 2>/dev/null || uv sync

# Stage 2: Runtime - Minimal production image with Tesseract
FROM python:3.11-slim

# Set working directory
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

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser agent ./agent
COPY --chown=appuser:appuser scripts ./scripts
COPY --chown=appuser:appuser run.py .
# Copy pre-seeded database file from repository
COPY --chown=appuser:appuser agora.db ./agora.db

# Switch to non-root user
USER appuser

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=5)" || exit 1

# Start server (database is pre-seeded in image)
# Cloud Run provides PORT environment variable, default to 8080
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --no-access-log
