from agent.src.vector_db import CatalogueVectorDb
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

catalogue_vector_db = CatalogueVectorDb(name="catalogue_items")

def main():
    catalogue_vector_db.bulk_sync_catalogue()
    logging.info("✅ Vector DB sync complete.")

if __name__ == "__main__":
    main()