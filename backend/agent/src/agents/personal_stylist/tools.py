import base64
import os
import tempfile
import uuid
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.config import get_stream_writer
from ...utils.yaml import load_config
from ...models.langchain_utils import load_model_from_config

@tool
async def txt2img(prompt: str, aspect_ratio: str = None, example_img_paths: list[str] = []):
    """
    Generate an image from a text prompt.

    Args:
        prompt (str): The detailed and rich text prompt to generate the image from.
        aspect_ratio (str, optional): Desired aspect ratio for the image, e.g., "16:9". Defaults to None.
        example_img_paths (list[str], optional): List of example image paths to guide the generation. Defaults to [].

    Returns:
        AsyncGenerator: An async generator yielding the image generation events.
    """
    # Load model and config
    model_config = load_config("model")["image_model"]
    if aspect_ratio:
        model_config["image_config"]["aspect_ratio"] = aspect_ratio
    model = load_model_from_config(model_config)

    # Initialise the writer
    try:
        writer = get_stream_writer()
    except (KeyError, TypeError):
        # We are running in a test or standalone script without a graph runtime
        # Create a dummy writer that just prints to stdout or does nothing
        def writer(x): print(f"[Dev Log]: {x}")
    
    # Compile example images
    image_examples = []
    image_content = []
    if example_img_paths:
        for image_path in example_img_paths:
            with open(image_path, "rb") as image_file:
                image_examples.append(image_file.read())   

        image_examples = [base64.b64encode(image_data).decode('utf-8') for image_data in image_examples]
        image_content = [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}} for img in image_examples]

    # Create message
    messages = [HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            *image_content
        ]
    )]

    # Consume the model's stream and pipe it to the writer
    final_output = None
    async for event in model.astream_events(input = messages, version="v2"):
        # We emit the event to the agent's custom stream
        writer(event) 
        
        # Capture the final result to return to the LLM agent state
        if event["event"] == "on_chat_model_end":
            final_output = event["data"]["output"]

    
    # Get the image data and save in a tempfile
    if final_output:
        content = final_output.content
        if isinstance(content, list) and len(content) > 0:
            for item in content:
                if isinstance(item, dict) and 'image_url' in item:
                    # Extract base64 from data URI: "data:image/png;base64,..."
                    data_uri: str = item['image_url']['url']
                    base64_str = data_uri.split(",")[1]

                    fd, path = tempfile.mkstemp(prefix='img-gen-', suffix='.jpeg')
                    os.close(fd)
                    with open(path, "wb") as f:
                        f.write(base64.b64decode(base64_str))

                else:
                    raise ValueError("No image_url found in the output content.")

        return {"status": "completed", "image_path": path}
