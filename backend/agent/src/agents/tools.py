"""Tools shared across agents"""
import base64
import requests
from pathlib import Path
from langchain_core.tools import tool

@tool
def load_images(image_urls: list[str]) -> list[dict]:
    """
    Load product images from URLs or file paths for visual analysis.
    Returns multimodal content with the images embedded for the LLM to see.

    Args:
        image_urls: List of image URLs or local file paths to load

    Returns:
        List containing text summary and image content for LLM vision analysis
    """
    content = [{"type": "text", "text": f"Loaded {len(image_urls)} product images for visual analysis:"}]

    for url in image_urls:
        try:
            path = Path(url)
            if path.exists():
                with open(path, "rb") as f:
                    image_data = f.read()
            else:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                image_data = response.content

            image_base64 = base64.b64encode(image_data).decode('utf-8')
            content_type = "image/png" if url.lower().endswith(".png") else "image/jpeg"

            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{content_type};base64,{image_base64}"}
            })
        except Exception as e:
            content.append({"type": "text", "text": f"Failed to load {url}: {e}"})

    return content