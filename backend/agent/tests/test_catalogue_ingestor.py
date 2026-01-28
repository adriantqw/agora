import os
import json
import asyncio
import argparse
from dotenv import load_dotenv

from ..src.agents.catalogue_ingestor.core import CatalogueIngestor

parser = argparse.ArgumentParser(description="Test Catalogue Ingestor Agent")
parser.add_argument("--pdf_path", type=str, required=True, help="Path to the catalogue PDF file")
args = parser.parse_args()

async def test_ingestor():
    load_dotenv()
    ingestor = CatalogueIngestor()
    
    # Check if a sample PDF exists, otherwise create a dummy or skip
    sample_pdf = args.pdf_path
    if not os.path.exists(sample_pdf):
        print(f"Please provide a sample PDF at {sample_pdf} to test the ingestor.")
        return

    print(f"Starting ingestion for {sample_pdf}...")
    async for event in await ingestor.stream_ingest(pdf_path=sample_pdf):
        event_type = event.get("event")

        if event_type == "on_chat_model_stream":
            chunk = event.get("data", {}).get("chunk")
            if chunk and hasattr(chunk, "content"):
                # Iterate rather than assuming index 0
                for block in chunk.content:
                    if isinstance(block, dict) and block.get("type") == "thinking":
                        print(block.get("thinking", ""), end="", flush=True)
                    elif hasattr(block, "type") and block.type == "thinking":
                        print(block.thinking, end="", flush=True)

    result = event

    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(result["data"])

        print("Items ingested:\n")
        print(json.dumps(ingestor.parse_final_state(result["data"]["output"]), indent=2))

if __name__ == "__main__":
    asyncio.run(test_ingestor())
    