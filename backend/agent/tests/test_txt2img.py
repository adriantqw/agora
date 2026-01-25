import os
import asyncio
from dotenv import load_dotenv

from src.agents.personal_stylist.tools import txt2img

async def test_txt2img():
    load_dotenv()
    
    prompt = "High-quality studio photography of a navy blue silk midi-dress, minimalist elegant style, soft morning light, 4k."
    print(f"Generating image for prompt: '{prompt}'")
    
    async for event in txt2img.astream_events(prompt=prompt):
        print(event)
    
    result = event
    
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(f"Image URL: {result['image_url']}")

if __name__ == "__main__":
    asyncio.run(test_txt2img())