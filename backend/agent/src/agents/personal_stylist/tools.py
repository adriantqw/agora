import base64
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from ...utils.yaml import load_config
from ...models.langchain_utils import load_model_from_config

@tool
async def txt2img(prompt: str, example_img_paths: list[str] = []):
    """
    Generate an image from a text prompt.

    Args:
        prompt (str): The text prompt to generate the image from.
        example_img_paths (list[str], optional): List of example image paths to guide the generation. Defaults to [].

    Returns:
        AsyncGenerator: An async generator yielding the image generation events.
    """
    # Load model and config
    config = load_config("model")["image_model"]
    model = load_model_from_config(config)
    image_config = {
        "aspect_ratio": "16:9",
        "media_resolution": "MEDIA_RESOLUTION_LOW",
    }
    
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

    # Call model
    return model.astream_events(messages=messages, image_config=image_config)