from src.models.utils import load_model_from_config

class CatalogueIngestor:
    """Catalogue ingestor agent. Ingests the unstructured catalogue document and returns a structured catalogue."""
    def __init__(self, config: dict):
        """Initialize the agent."""
        self.model = load_model_from_config(config["model"])    

    def _compile_graph(self):
        """Compile the graph."""    
        return 
    
    def ingest(self, data: dict) -> dict:
        """Ingest the catalogue."""
        return self.model.invoke(data)  