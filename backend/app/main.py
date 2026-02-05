from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes import auth, products, catalogues, consumer_auth, journeys, stylist, wishlist, profile, style_profile, curate_my_fit
import app.models  # Import models to register them with SQLAlchemy
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
app.include_router(stylist.router)
app.include_router(consumer_auth.router)
app.include_router(journeys.router)
app.include_router(wishlist.router)
app.include_router(profile.router)
app.include_router(style_profile.router)
app.include_router(curate_my_fit.router)


@app.on_event("startup")
def on_startup():
    """Initialize database and vector database on application startup."""
    # Initialize database
    init_db()

    # Sync vector database
    try:
        logging.info("Syncing vector database with catalogue...")
        from scripts.bulk_sync_vector_db import main as sync_vector_db
        sync_vector_db()
        logging.info("Vector database sync completed successfully")
    except Exception as e:
        logging.error(f"Failed to sync vector database: {e}")
        # Log error but allow app to start without vector DB
        logging.warning("App starting without vector DB sync. Search functionality may be limited.")


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
