import os
import asyncio
import argparse
from dotenv import load_dotenv

from src.agents.catalogue_ingestor.core import CatalogueIngestor

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
        print(event)

    result = event

    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(result["data"])

if __name__ == "__main__":
    asyncio.run(test_ingestor())
    