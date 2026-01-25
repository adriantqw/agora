import base64
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.config import get_stream_writer
from ...utils.yaml import load_config
from ...models.langchain_utils import load_model_from_config
from .schemas import (
    ImageChoice,
    ImageOption,
    ColourPaletteOption,
    MultiSelectTextOption,
    ScaleRating,
    FreeTextResponse,
    TextWithImageResponse
)


# ============== UI Generation Tools ==============

@tool
def generate_image_choice(question: str, options: list[dict]) -> dict:
    """
    Generate an image choice question for the user to select from visual options.

    Args:
        question: The question to ask the user
        options: List of options, each with 'id', 'label', and 'image_prompt' keys
                 Example: [{"id": "opt1", "label": "Minimalist", "image_prompt": "High-quality studio photography of a minimalist navy dress..."}]

    Returns:
        dict: The image choice UI component
    """
    image_options = [ImageOption(**opt) for opt in options]
    return ImageChoice(question=question, options=image_options).model_dump()


@tool
def generate_colour_palette(label: str, colour_hex_options: list[str]) -> dict:
    """
    Generate a colour palette selection for the user to choose preferred colors.

    Args:
        label: Label describing the palette (e.g., "Warm Earth Tones")
        colour_hex_options: List of hex color codes (e.g., ["#FF5733", "#C70039", "#900C3F"])

    Returns:
        dict: The colour palette UI component
    """
    return ColourPaletteOption(label=label, colour_hex_options=colour_hex_options).model_dump()


@tool
def generate_multi_select(question: str, options: list[str]) -> dict:
    """
    Generate a multi-select question where users can select multiple options.

    Args:
        question: The question to ask
        options: List of text options (max 5)

    Returns:
        dict: The multi-select UI component
    """
    return MultiSelectTextOption(question=question, options=options).model_dump()


@tool
def generate_scale_rating(question: str, min_label: str, max_label: str) -> dict:
    """
    Generate a scale/slider rating question.

    Args:
        question: The question to ask
        min_label: Label for the low end (e.g., "Budget-friendly")
        max_label: Label for the high end (e.g., "Luxury")

    Returns:
        dict: The scale rating UI component
    """
    return ScaleRating(question=question, min_label=min_label, max_label=max_label).model_dump()


@tool
def generate_free_text(question: str) -> dict:
    """
    Generate a free text input question for open-ended responses.

    Args:
        question: The question to ask

    Returns:
        dict: The free text UI component
    """
    return FreeTextResponse(question=question).model_dump()


@tool
def generate_text_with_image(question: str, image_prompt: str) -> dict:
    """
    Generate a text input question with an accompanying generated image for context.

    Args:
        question: The question to ask
        image_prompt: Detailed prompt for generating a contextual image

    Returns:
        dict: The text with image UI component
    """
    return TextWithImageResponse(question=question, image_prompt=image_prompt).model_dump()


# ============== Image Generation Tool ==============

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
    model_config = load_config("model")["image_model"]
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

    # Return the final result so the LLM knows the tool finished successfully
    return final_output