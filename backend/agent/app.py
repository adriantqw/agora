from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import json
import os
from src.agents.catalogue_ingestor import CatalogueIngestor
from src.agents.schemas import CatalogueItemList

app = FastAPI()

@app.post("/catalogue/ingest", response_model=CatalogueItemList)
async def ingest_catalogue(file_path: str):
    """
    Ingest a catalogue PDF and return extracted items.

    Args:
        file_path (str): The absolute path to the PDF file to ingest.

    Returns:
        CatalogueItemList: List of extracted items from the PDF.
    """
    if not file_path.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        ingestor = CatalogueIngestor()
        # The ingest method returns a state dict, we need to extract the items
        result_state = ingestor.ingest(file_path)
        
        if "error" in result_state:
             raise HTTPException(status_code=500, detail=result_state["error"])
             
        # Create CatalogueItemList from the list of items in the state
        items = result_state.get("catalogue_items", [])
        return CatalogueItemList(items=items)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/catalogue/ingest/stream")
async def ingest_catalogue_stream(file_path: str):
    """
    Ingest a catalogue PDF and stream events.
    
    Args:
        file_path (str): The absolute path to the PDF file to ingest.
    """
    if not file_path.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    async def event_generator(path):
        try:
            ingestor = CatalogueIngestor()
            # stream_ingest is async and returns the async generator
            async_gen = await ingestor.stream_ingest(path)
            async for event in async_gen:
                yield json.dumps(event) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(event_generator(file_path), media_type="application/x-ndjson")