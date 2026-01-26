from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import logging
import mlflow

from ..utils.yaml import load_config
from app.database import SessionLocal
from app.models.catalogue import CatalogueItem
from app.models.product import Product

class CatalogueVectorDb:
    def __init__(self, name: str):
        """Initialize catalogue vector database"""
        mlflow.langchain.autolog()
        try:
            self.cfg = load_config('vector_db')[name]
        except KeyError:
            raise ValueError(f"Vector database '{name}' not defined in config")
        
        embeddings = GoogleGenerativeAIEmbeddings(model=self.cfg['embed_model_name'])
        persist_directory = self.cfg['persist_directory']

        # Load vector store
        self.vector_store = Chroma(
            collection_name=name,
            embedding_function=embeddings,
            persist_directory=persist_directory
        )

        logging.info(f"Loaded vector store with {len(self._get_all_product_ids())} items.")

    def index_product(self, product_id: str, text: str, metadata: dict):
        """Add or update item in vector store."""
        doc = Document(page_content=text, metadata={**metadata, "id": product_id})
        self.vector_store.add_documents([doc], ids=[product_id])

    def search(self, query: str, n_results: int = 20, filter_dict: dict = None) -> list[Document]:
        """Search for similar items."""
        return self.vector_store.similarity_search(
            query=query,
            k=n_results,
            filter=filter_dict  # e.g., {"merchant_id": "xxx"}
        )
    
    def delete_product(self, product_id: str):
        """Remove item from vector store."""
        self.vector_store.delete(ids=[product_id])

    def bulk_sync_catalogue(self):
        """Bulk sync all catalogue items and products from SQLite to vector database."""
        db = SessionLocal()
        try:
            # Get all items from both tables
            catalogue_items = db.query(CatalogueItem).all()
            products = db.query(Product).all()

            # Build combined set of IDs (prefixed to avoid collision)
            all_items_in_db = {}
            for item in catalogue_items:
                all_items_in_db[f"catalogue_{item.id}"] = ("catalogue", item)
            for product in products:
                all_items_in_db[f"product_{product.id}"] = ("product", product)

            item_ids_in_vector = set(self._get_all_product_ids())

            # Determine adds and deletes
            ids_to_add = [id for id in all_items_in_db.keys() if id not in item_ids_in_vector]
            ids_to_delete = [id for id in item_ids_in_vector if id not in all_items_in_db]

            logging.info(f"Items in DB: {len(all_items_in_db)}")
            logging.info(f"Items to add: {len(ids_to_add)}")
            logging.info(f"Items to delete: {len(ids_to_delete)}")

            # Build documents to add in batch
            docs_to_add = []
            ids_to_add_list = []
            for prefixed_id in ids_to_add:
                source, item = all_items_in_db[prefixed_id]
                if source == "catalogue":
                    text = self._build_item_text(item)
                    metadata = {
                        "source": "catalogue",
                        "merchant_id": item.merchant_id,
                        "catalogue_id": item.catalogue_id,
                        "name": item.name,
                        "image_url": item.image_url
                    }
                else:  # product
                    text = self._build_product_text(item)
                    metadata = {
                        "source": "product",
                        "merchant_id": item.merchant_id,
                        "name": item.name,
                        "image_url": item.image or "",
                        "sku": item.sku,
                        "price": item.price
                    }
                docs_to_add.append(Document(page_content=text, metadata={**metadata, "id": prefixed_id}))
                ids_to_add_list.append(prefixed_id)

            # Batch add documents
            if docs_to_add:
                self.vector_store.add_documents(docs_to_add, ids=ids_to_add_list)

            # Batch delete stale items
            if ids_to_delete:
                self.vector_store.delete(ids=ids_to_delete)

            logging.info("Bulk sync complete")
        finally:
            db.close()



    def _get_all_product_ids(self):
        """Get all product ids in vector database"""
        return self.vector_store.get()['ids']

    def _build_item_text(self, item: CatalogueItem) -> str:
        """Build searchable text from catalogue item."""
        text = f"{item.name}. {item.description or ''}. "
        text += f"Colors: {', '.join(item.colours or [])}. "
        text += f"Sizes: {', '.join(item.sizes or [])}"
        return text

    def _build_product_text(self, product: Product) -> str:
        """Build searchable text from product."""
        text = f"{product.name}. {product.description or ''}. "
        text += f"Tags: {', '.join(product.tags or [])}."
        return text
