import base64
import os
import tempfile
from pydantic import BaseModel, Field
from langchain_core.tools import tool, StructuredTool
from langchain_core.messages import HumanMessage
from langgraph.config import get_stream_writer

from .schemas import UIInputType
from ...utils.yaml import load_config
from ...models.langchain_utils import load_model_from_config


class Txt2ImgGenerator:
    """
    A tool to generate images from text prompts using a specified image generation model.
    """
    def __init__(self):
        """Initialize the Txt2ImgGenerator with model configuration."""
        self.config_data = load_config("model")["image_model"]

    def _load_image_model(self, aspect_ratio: str = None):
        """Load the image generation model with optional aspect ratio."""
        model_config = self.config_data.copy()

        if aspect_ratio:
            model_config["image_config"] = model_config.get("image_config", {}).copy()
            model_config["image_config"]["aspect_ratio"] = aspect_ratio

        model = load_model_from_config(model_config)
        return model
    
    def _compile_model_messages(self, prompt: str, example_img_paths: list[str] | None = None):
        """Compile the model messages including prompt and example images."""
        image_examples = []
        image_content = []
        if example_img_paths is None:
            example_img_paths = []
        if example_img_paths:
            for image_path in example_img_paths:
                with open(image_path, "rb") as image_file:
                    image_examples.append(image_file.read())   

            image_examples = [base64.b64encode(image_data).decode('utf-8') for image_data in image_examples]
            image_content = [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}} for img in image_examples]

        messages = [HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                *image_content
            ]
        )]
        return messages
    
    def _extract_image_path_from_output(self, output) -> str | None:
        """Extract the image path from the model output and save it to a tempfile."""
        content = output.content
        if isinstance(content, list) and len(content) > 0:
            for item in content:
                if isinstance(item, dict) and 'image_url' in item:
                    # Extract base64 from data URI: "data:image/png;base64,..."
                    data_uri: str = item['image_url']['url']
                    if "," not in data_uri:
                        return None
                    base64_str = data_uri.split(",", 1)[1]

                    try:
                        fd, path = tempfile.mkstemp(prefix='img-gen-', suffix='.jpeg')
                        os.close(fd)
                        with open(path, "wb") as f:
                            f.write(base64.b64decode(base64_str))
                        return path
                    except Exception:
                        return None
        return None

    async def _generate_single_with_retry(
        self,
        model,
        prompt: str,
        writer,
        max_retries: int = 1,
        example_img_paths: list[str] | None = None
    ) -> dict:
        """
        Generate a single image with retry logic.

        Args:
            model: The image generation model
            prompt: The text prompt
            writer: Stream writer for logging
            max_retries: Number of retry attempts (default 1)
            example_img_paths: Optional example images

        Returns:
            dict with status, image_path, and optional error
        """
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                messages = self._compile_model_messages(prompt, example_img_paths)
                output = await model.ainvoke(messages)
                image_path = self._extract_image_path_from_output(output)
                if image_path:
                    return {"status": "completed", "image_path": image_path}
                last_error = "No image found in model response"
            except Exception as e:
                last_error = str(e)
                if attempt < max_retries:
                    writer({"info": f"Retry {attempt + 1}/{max_retries} for prompt"})

        return {"status": "failed", "image_path": None, "error": last_error}

    async def generate(self, prompt: str, aspect_ratio: str = None, example_img_paths: list[str] | None = None):
        """
        Generate an image from a text prompt with retry logic.

        Args:
            prompt (str): The detailed and rich text prompt to generate the image from.
            aspect_ratio (str, optional): Desired aspect ratio for the image, e.g., "16:9". Defaults to None.
            example_img_paths (list[str], optional): List of example image paths to guide the generation. Defaults to [].

        Returns:
            dict: A dictionary containing the status, path to the generated image, and optional error.
        """
        model = self._load_image_model(aspect_ratio)
        try:
            writer = get_stream_writer()
        except (KeyError, TypeError):
            # We are running in a test or standalone script without a graph runtime
            writer = lambda x: print(f"[Dev Log]: {x}")

        # Use retry logic for single image generation
        result = await self._generate_single_with_retry(
            model=model,
            prompt=prompt,
            writer=writer,
            max_retries=1,
            example_img_paths=example_img_paths
        )

        if result["status"] == "completed":
            writer({"info": "Image generation completed successfully"})
        else:
            writer({"warning": f"Image generation failed: {result.get('error', 'Unknown error')}"})

        return result
    
    async def batch(self, prompts: list[str], aspect_ratio: str = None):
        """
        Generate images from a batch of text prompts with retry logic.

        Args:
            prompts (list[str]): List of detailed and rich text prompts to generate images from.
            aspect_ratio (str, optional): Desired aspect ratio for the images, e.g., "16:9". Defaults to None.

        Returns:
            dict: Contains 'results' list and optional 'suggestion' if all failed.
        """
        model = self._load_image_model(aspect_ratio)
        try:
            writer = get_stream_writer()
        except (KeyError, TypeError):
            # We are running in a test or standalone script without a graph runtime
            writer = lambda x: print(f"[Dev Log]: {x}")

        writer({"info": f"Starting batch generation for {len(prompts)} prompts"})

        # Process each prompt with retry logic
        results = []
        for i, prompt in enumerate(prompts):
            writer({"info": f"Processing prompt {i + 1}/{len(prompts)}"})
            result = await self._generate_single_with_retry(
                model=model,
                prompt=prompt,
                writer=writer,
                max_retries=1
            )
            results.append(result)
            writer({"info": f"Prompt {i + 1}/{len(prompts)}: {result['status']}"})

        # Check if all failed and provide fallback guidance
        failed_count = sum(1 for r in results if r["status"] == "failed")
        if failed_count == len(results):
            writer({"warning": "All image generations failed. Suggesting text-based fallback."})
            return {
                "results": results,
                "all_failed": True,
                "suggestion": "Image generation is unavailable. Please use text-based UI components instead: 'multi-select' for style options, 'colour-palette' for colors, and 'scale-rating' for preferences."
            }

        writer({"info": f"Batch complete: {len(results) - failed_count}/{len(results)} succeeded"})
        return {"results": results, "all_failed": False}
    
    def get_tools(self) -> list[StructuredTool]:
        """Get the list of tools provided by this generator."""
        return [
            StructuredTool.from_function(coroutine=self.generate),
            StructuredTool.from_function(coroutine=self.batch)
        ]


class GenerateUIComponentsInput(BaseModel):
    """Input schema for generate_ui_components tool."""
    ui_inputs: list[UIInputType] = Field(
        description="List of UI components to display. Each component has a 'type' field that determines its structure."
    )


@tool(args_schema=GenerateUIComponentsInput)
def generate_ui_components(ui_inputs: list[UIInputType]) -> dict:
    """
    Generate UI components to gather user preferences.

    Call this tool when you want to present questions or options to the user.
    You should generate 2-3 components per turn to progressively build the user's style profile.

    Args:
        ui_inputs: List of UI components.

    Returns:
        dict: Contains status and the ui_components for state update
    """
    import uuid

    components = []
    for comp in ui_inputs:
        comp_dict = comp.model_dump()

        # Generate ID if not provided
        if comp_dict.get("id") is None:
            comp_dict["id"] = uuid.uuid4().hex

        # Handle nested options for image-choice
        if comp_dict.get("type") == "image-choice" and "options" in comp_dict:
            for opt in comp_dict["options"]:
                if opt.get("id") is None:
                    opt["id"] = uuid.uuid4().hex

        components.append(comp_dict)

    return {
        "status": "success",
        "ui_components": components,
        "count": len(components)
    }
