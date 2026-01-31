"""Tools shared across agents"""
import base64
import requests
from pathlib import Path

from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

@tool
def load_image(image_url: str) -> list[dict]:
    """
    Load image from URL or file path for visual analysis.
    Returns multimodal content with the image embedded for the LLM to see.

    Args:
        image_url: Image URL or local file path to load

    Returns:
        List containing text summary and image content for LLM vision analysis
    """
    content = [{"type": "text", "text": f"Loaded image: {image_url} for visual analysis:"}]

    try:
        path = Path(image_url)
        if path.exists():
            with open(path, "rb") as f:
                image_data = f.read()
        else:
            response = requests.get(image_url, timeout=20)
            response.raise_for_status()
            image_data = response.content

        image_base64 = base64.b64encode(image_data).decode('utf-8')
        content_type = "image/png" if image_url.lower().endswith(".png") else "image/jpeg"
        
        content = [{"type": "text", "text": f"Loaded image: {image_url} for visual analysis:"}]
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:{content_type};base64,{image_base64}"}
        })

    except Exception as e:
        content.append({"type": "text", "text": f"Failed to load {image_url}: {e}"})

    return content

@tool
def google_search(query: str):
    """Use this to search for real-time information, weather, or current fashion trends."""
    # Define search model
    search_model = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview", 
        thinking_level="minimal", 
        max_tokens=2048,
        temperature=0
    )
    search_grounding = search_model.bind_tools([{"google_search": {}}])
    
    # This model call handles the search internally and returns text
    res = search_grounding.invoke(query)
    return res.model_dump_json()