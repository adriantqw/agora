import asyncio
import base64
import os
from dotenv import load_dotenv
from ..src.agents.personal_stylist.tools import txt2img

async def test_txt2img():
    load_dotenv()
    
    prompt = "High-quality studio photography of a navy blue silk midi-dress, minimalist elegant style, soft morning light, 4k."
    print(f"🚀 Invoking tool for: '{prompt}'")
    
    # 1. Simply await the tool invocation.
    # Since the tool internally handles the astream_events loop, 
    # result will be the final AIMessage/AIMessageChunk.
    result = await txt2img.ainvoke({
        "prompt": prompt,
        "example_img_paths": []
    })

    print(f"\n✅ Tool execution complete.")

    # 2. Extract and display/save the output
    try:
        # result.content is usually a list for multimodal Gemini models
        content = result.content
        
        # Check if we have the structured list format
        if isinstance(content, list) and len(content) > 0:
            for item in content:
                if isinstance(item, dict) and 'image_url' in item:
                    # Extract base64 from data URI: "data:image/png;base64,..."
                    data_uri = item['image_url']['url']
                    base64_str = data_uri.split(",")[1]
                    
                    filename = "output_image.png"
                    with open(filename, "wb") as f:
                        f.write(base64.b64decode(base64_str))
                    
                    print(f"📂 Image detected and saved to: {os.path.abspath(filename)}")
                else:
                    print(f"📄 Text component: {item}")
        else:
            # Fallback if it returned raw text or a different format
            print(f"📝 Raw Content: {content}")

    except Exception as e:
        print(f"❌ Error processing output: {e}")
        print(f"Full Result Object: {result}")

if __name__ == "__main__":
    asyncio.run(test_txt2img())