import os
import json
from src.agents.catalogue_ingestor import CatalogueIngestor
from src.agents.schemas import CatalogueItemList

ingestor = CatalogueIngestor()

def ingest_catalogue(file_path: str):
    """
    Ingest a catalogue PDF and return extracted items.

    Args:
        file_path (str): The absolute path to the PDF file to ingest.

    Returns:
        CatalogueItemList: List of extracted items from the PDF.
    """
    if not file_path.endswith('.pdf'):
        raise ValueError("File must be a PDF")
    
    if not os.path.exists(file_path):
        raise ValueError("File not found")

    try:
        # The ingest method returns a state dict, we need to extract the items
        result_state = ingestor.ingest(file_path)
        
        if "error" in result_state:
             raise ValueError(result_state["error"])
             
        # Create CatalogueItemList from the list of items in the state
        items = result_state.get("catalogue_items", [])
        return CatalogueItemList(items=items)

    except Exception as e:
        raise ValueError(str(e))

async def ingest_catalogue_stream(file_path: str):
    """
    Ingest a catalogue PDF and stream events.
    
    Args:
        file_path (str): The absolute path to the PDF file to ingest.

    Yields:
        AsyncGenerator[str, None]: Async generator of events. Final event contains the CatalogueItemList.
    """
    if not file_path.endswith('.pdf'):
        raise ValueError("File must be a PDF")

    if not os.path.exists(file_path):
        raise ValueError("File not found")

    async def event_generator(path):
        try:
            # stream_ingest is async and returns the async generator
            async_gen = await ingestor.stream_ingest(path)
            async for event in async_gen:
                yield json.dumps(event) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return event_generator(file_path)

def parse_final_agent_state(state: dict):
    """
    Parse the final state of the agent to extract catalogue items with image paths.

    Args:
        state (dict): The final state dictionary from the agent.

    Returns:
        list[dict]: A list of catalogue item payloads with image paths.
    """
    return ingestor.parse_final_state(state)