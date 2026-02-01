"""Test script for CatalogueIngestor agent."""
import os
import json
import asyncio
import argparse
from dotenv import load_dotenv

from ..src.agents.catalogue_ingestor.core import CatalogueIngestor
from ..src.utils.stream import AgentEventParser
from .utils import extract_tool_call, print_tool_call


parser = argparse.ArgumentParser(description="Test Catalogue Ingestor Agent")
parser.add_argument("--pdf_path", type=str, required=True, help="Path to the catalogue PDF file")
args = parser.parse_args()


async def test_ingestor():
    """Test catalogue ingestion with streaming and AgentEventParser."""
    load_dotenv()
    ingestor = CatalogueIngestor()
    event_parser = AgentEventParser("catalogue_ingestor")

    sample_pdf = args.pdf_path
    if not os.path.exists(sample_pdf):
        print(f"Please provide a sample PDF at {sample_pdf} to test the ingestor.")
        return

    print(f"\n{'=' * 60}")
    print("CATALOGUE INGESTOR STREAM TEST")
    print("=" * 60)
    print(f"PDF Path: {sample_pdf}")
    print("=" * 60)

    print("\n[PROCESSING]")
    print("-" * 60)

    final_event = None

    async for event in await ingestor.stream_ingest(pdf_path=sample_pdf):
        # Parse with AgentEventParser
        metadata = event_parser.parse(event)

        # Print thinking messages
        if metadata["thinking_messages"]:
            for msg in metadata["thinking_messages"]:
                print(msg, end="", flush=True)

        # Print progress updates
        if metadata["current_page"] is not None:
            print(f"\n[PAGE] Processing page {metadata['current_page']}")

        if metadata["item_count"] is not None and metadata["item_count"] > 0:
            print(f"[ITEMS] Found {metadata['item_count']} items so far")

        # Log tool calls
        tool_call = extract_tool_call(event)
        if tool_call:
            print_tool_call(tool_call)

        # Capture final event
        final_event = event

    # Process final result
    print("\n\n" + "=" * 60)
    print("[FINAL OUTPUT]")
    print("=" * 60)

    if final_event and "error" in final_event.get("data", {}).get("output", {}):
        print(f"Error: {final_event['data']['output']['error']}")
    elif final_event:
        final_state = final_event.get("data", {}).get("output", {})
        items = ingestor.parse_final_state(final_state)

        print(f"\nExtracted {len(items)} items:")
        for i, item in enumerate(items, 1):
            print(f"  {i}. {item.get('name', 'Unknown')} (page {item.get('page', '?')})")
            if item.get('sizes'):
                print(f"     Sizes: {', '.join(item['sizes'])}")
            if item.get('colours'):
                print(f"     Colours: {', '.join(item['colours'])}")

        print("\n[RAW JSON OUTPUT]")
        print(json.dumps(items, indent=2))

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_ingestor())
