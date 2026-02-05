"""Tools shared across agents"""
import base64
import requests
import os
import tempfile
import asyncio
from pydantic import FilePath
from pathlib import Path

from langchain_core.tools import tool, StructuredTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langgraph.config import get_stream_writer

from ..utils.yaml import load_config
from ..models.langchain_utils import load_model_from_config

# Import storage service for R2 uploads
import sys
sys.path.insert(0, '/Users/justynlgh/Documents/agora/backend')
from app.services.storage_service import storage_service

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

class Txt2ImgGenerator:
    """A tool to generate images from text prompts using a specified image generation model."""
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
    
    def _compile_model_messages(self, prompt: str, example_img_paths: list[FilePath] | None = None):
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
        model: ChatGoogleGenerativeAI,
        prompt: str,
        writer,
        max_retries: int = 1,
        example_img_paths: list[str] | None = None
    ) -> dict:
        """
        Generate a single image with retry logic and upload to R2.

        Args:
            model: The image generation model
            prompt: The text prompt
            writer: Stream writer for logging
            max_retries: Number of retry attempts (default 1)
            example_img_paths: Optional example images

        Returns:
            dict with status, image_path (R2 URL), and optional error
        """
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                messages = self._compile_model_messages(prompt, example_img_paths)
                output = await model.ainvoke(messages)
                temp_image_path = self._extract_image_path_from_output(output)
                if temp_image_path:
                    # Upload to R2 and get public URL
                    writer({"info": f"Uploading generated image to R2..."})
                    upload_result = await storage_service.upload_file_from_path(
                        temp_image_path, 
                        folder="generated-images"
                    )
                    
                    # Clean up temp file regardless of upload success
                    try:
                        os.remove(temp_image_path)
                    except Exception:
                        pass
                    
                    if "error" in upload_result:
                        writer({"warning": f"R2 upload failed: {upload_result['error']}"})
                        last_error = f"Image generated but upload failed: {upload_result['error']}"
                        # Continue to retry if we haven't exhausted retries
                        if attempt < max_retries:
                            continue
                        return {"status": "failed", "image_path": None, "error": last_error}
                    
                    # Return R2 public URL
                    r2_url = upload_result["url"]
                    writer({"info": f"Image uploaded to R2: {r2_url}"})
                    return {"status": "completed", "image_path": r2_url}
                    
                last_error = "No image found in model response"
            except Exception as e:
                last_error = str(e)
                if attempt < max_retries:
                    writer({"info": f"Retry {attempt + 1}/{max_retries} for prompt"})

        return {"status": "failed", "image_path": None, "error": last_error}

    async def generate(self, prompt: str, aspect_ratio: str = None, reference_img_paths: list[FilePath] | None = None):
        """
        Generate an image from a text prompt with retry logic. Use this to generate 1 image at a time.
        Has the benefit of being able to use reference images to generate the image.

        Args:
            prompt (str): The detailed and rich text prompt to generate the image from.
            aspect_ratio (str, optional): Desired aspect ratio for the image, e.g., "16:9". Defaults to None.
            reference_img_paths (list[str], optional): List of reference image paths to guide the generation. Defaults to [].

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
            example_img_paths=reference_img_paths
        )

        if result["status"] == "completed":
            writer({"info": "Image generation completed successfully"})
        else:
            writer({"warning": f"Image generation failed: {result.get('error', 'Unknown error')}"})

        return result
    
    async def batch(self, prompts: list[str], aspect_ratio: str = None, reference_img_paths_list: list[list[str]] = None):
        """
        Generate images from a batch of text prompts with retry logic. Use this to generate multiple images in parallel.

        Args:
            prompts (list[str]): List of detailed and rich text prompts to generate images from.
            aspect_ratio (str, optional): Desired aspect ratio for the images, e.g., "16:9". Defaults to None.
            reference_img_paths_list (list[list[str]], optional): A list where each element is a 
                list of image paths corresponding to the prompt at the same index.

        Returns:
            dict: Contains 'results' list
        """
        model = self._load_image_model(aspect_ratio)
        try:
            writer = get_stream_writer()
        except (KeyError, TypeError):
            # We are running in a test or standalone script without a graph runtime
            writer = lambda x: print(f"[Dev Log]: {x}")

        writer({"info": f"Starting batch generation for {len(prompts)} prompts"})

        # Prepare reference images mapping
        if reference_img_paths_list is None:
            reference_img_paths_list = [None] * len(prompts)
        elif len(reference_img_paths_list) != len(prompts):
            raise ValueError("reference_img_paths_list must be the same length as prompts")

        # Create tasks for all prompts to run concurrently
        tasks = [
            self._generate_single_with_retry(
                model=model,
                prompt=prompt,
                writer=writer,
                max_retries=1,
                example_img_paths=ref_paths
            )
            for prompt, ref_paths in zip(prompts, reference_img_paths_list)
        ]

        # Execute all tasks in parallel
        results = await asyncio.gather(*tasks)

        failed_count = sum(1 for r in results if r["status"] == "failed")
        if failed_count == len(results):
            writer({"warning": "All image generations failed."})
            return {
                "results": results,
                "all_failed": True,
            }

        writer({"info": f"Batch complete: {len(results) - failed_count}/{len(results)} succeeded"})
        return {"results": results, "all_failed": False}
    
    def get_tools(self) -> list[StructuredTool]:
        """Get the list of tools provided by this generator."""
        return [
            StructuredTool.from_function(coroutine=self.generate),
            StructuredTool.from_function(coroutine=self.batch)
        ]