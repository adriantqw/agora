from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes import auth, products, catalogues, consumer_auth, journeys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Create FastAPI application
app = FastAPI(
    title="Agora MerchantHub API",
    description="Backend API for Agora MerchantHub - Merchant Authentication & Profile Management",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(catalogues.router)
app.include_router(consumer_auth.router)
app.include_router(journeys.router)


@app.on_event("startup")
def on_startup():
    """Initialize database on application startup."""
    init_db()


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Agora MerchantHub API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint for liveness probes."""
    return {"status": "healthy"}


@app.get("/ready")
def readiness_check():
    """Readiness check endpoint for Cloud Run."""
    return {"status": "ready"}
