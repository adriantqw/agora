from langchain_core.tools import tool
from ...vector_db.catalogue import CatalogueVectorDb

catalogue_vector_db = CatalogueVectorDb("catalogue_items")

@tool
def search_products(query: str):
    """
    Similarity search for available catalogue items and products.

    Args:
        query: Natural language search query describing desired products

    Returns:
        List of matching products with metadata (id, name, image_url, etc.)
    """
    return catalogue_vector_db.search(query, n_results=10)


@tool 
def load_images(img_paths: list[str]):
    """
    Load image based on image path

    Args:
        img_paths (list[str]):

    Returns:
        
    """
    pass