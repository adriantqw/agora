from agent.src.vector_db import CatalogueVectorDb
import logging

logger = logging.getLogger(__name__)

def main():
    """Sync all catalogue items and products to vector database"""
    try:
        logger.info("Starting vector database sync...")
        catalogue_vector_db = CatalogueVectorDb(name="catalogue_items")
        catalogue_vector_db.bulk_sync_catalogue()
        logger.info("✅ Vector DB sync complete.")
    except Exception as e:
        logger.error(f"Error syncing vector database: {e}")
        raise

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    main()