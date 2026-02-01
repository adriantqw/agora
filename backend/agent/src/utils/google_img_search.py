import os
import base64
import requests
import tempfile
from serpapi import GoogleSearch

SERP_API_KEY = os.getenv("SERP_API_KEY")

def search_images(query: str) -> list[str]:
    """
    Find top 3 images using google image search and returns a 
    list of local file paths to the downloaded images.

    Args:
        query: A descriptive image search query
    """
    search_results = GoogleSearch({
        "engine": "google_images",
        "q": query,
        "api_key": SERP_API_KEY
    }).get_dict()

    image_paths = []

    if not search_results.get("images_results"):
        return image_paths

    for sr in search_results["images_results"][:3]:
        image_url = sr.get("original") or sr.get("thumbnail")
        try:
            # 1. Fetch the image
            response = requests.get(image_url, timeout=15)
            response.raise_for_status()
            
            # 2. Convert to Base64 Data URI (to match your extraction pattern)
            image_data = base64.b64encode(response.content).decode('utf-8')
            ext = image_url.split('.')[-1].split('?')[0].lower()
            if ext not in ["png", "jpg", "jpeg", "webp"]:
                ext = "jpeg"
            data_uri = f"data:image/{ext};base64,{image_data}"

            # 3. Follow your specific pattern: Split and Save via mkstemp
            if "," in data_uri:
                base64_str = data_uri.split(",", 1)[1]
                
                fd, path = tempfile.mkstemp(prefix='img-search-', suffix='.jpeg')
                os.close(fd) # Close file descriptor immediately to write with 'open'
                
                with open(path, "wb") as f:
                    f.write(base64.b64decode(base64_str))
                
                image_paths.append(path)

        except Exception:
            continue # Skip failed images and try the next one

    return image_paths