import base64
import mlflow
import logging
from PIL import Image
import pypdfium2 as pdfium
import pytesseract
import re
import os
from dotenv import load_dotenv
import tempfile
from pathlib import Path
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from .schemas import CatalogueItemList
from .states import CatalogueIngestorState
from ...models.langchain_utils import load_model_from_config
from ...utils.yaml import load_prompt_templates, load_config
from ...utils.image import get_pil_box
from langchain_core.exceptions import OutputParserException

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

RECURSION_LIMIT = 200

class CatalogueIngestor:
    """Catalogue ingestor agent. Ingests the unstructured catalogue document and returns a structured catalogue."""
    
    def __init__(self):
        """Initialize the agent."""
        mlflow.langchain.autolog()
        self.agent_config = load_config("agent")["catalogue_ingestor"]
        self.model = load_model_from_config(self.agent_config["model"])
        self.templates = load_prompt_templates()["catalogue_ingestor"]
        self.graph = self._compile_graph()

    def _convert_pdf_to_images(self, state: CatalogueIngestorState):
        """Convert PDF pages to images."""
        pages = []
        try:
            # Load PDF
            pdf = pdfium.PdfDocument(state["pdf_path"])
            catalogue_path = Path(tempfile.mkdtemp(prefix='catalogue-'))

            # Convert each page to image
            for page_indices in range(len(pdf)):
                page = pdf[page_indices]
                bitmap = page.render(scale=2.0)  # Scale for better OCR quality
                pil_image = bitmap.to_pil()
                
                # Rotate image if needed
                try:
                    osd = pytesseract.image_to_osd(pil_image)
                    angle = int(re.search(r'(?<=Rotate: )\d+', osd).group(0))
                    if angle != 0:
                        pil_image = pil_image.rotate(-angle, expand=True)

                except pytesseract.TesseractNotFoundError:
                    raise Exception("Failed to rotate image due to error: tesseract is not installed or it's not in your PATH.")

                except:
                    pass # Move onto next page if no text or OCR fails

                pdf_page_path=catalogue_path / f'{page_indices}.jpeg'
                pil_image.save(
                    fp=pdf_page_path,
                    format='JPEG',
                    quality=75,
                    optimize=True
                )
                pages.append(pdf_page_path)

            return {"pdf_page_paths": pages, "total_pages": len(pages), "current_page_idx": 0}

        except Exception as e:
            return {"error": f"Failed to convert PDF to images: {str(e)}"}

        finally:
            if 'pdf' in locals():
                pdf.close()

    def _read_pdf(self, state: CatalogueIngestorState):
        """Read PDF text"""
        try:
            idx = state["current_page_idx"]
            pdf_pages = pdfium.PdfDocument(state["pdf_path"])
            try:
                return pdf_pages[idx].get_textpage().get_text_range()
            finally:
                pdf_pages.close()

        except Exception as e:
            return {"error": f"Failed to read PDF: {str(e)}"}

    def _extract_items_from_images(self, state: CatalogueIngestorState):
        """Extract items from images."""
        idx = state["current_page_idx"]
        image_path = state["pdf_page_paths"][idx]
        
        # Determine if this is a retry or fresh page
        messages = state.get("messages", [])
        if not messages or state.get("retry_count", 0) == 0:
            with open(image_path, "rb") as f:
                image_data = f.read()
            
            # Encode image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')

            # Get PDF text
            pdf_text = self._read_pdf(state)
            
            # Create message
            messages = [HumanMessage(
                content=[
                    {"type": "text", "text": self.templates.format(pdf_text=pdf_text)},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                ]
            )]
        
        structured_output_model = self.model.with_structured_output(CatalogueItemList)
        try:
            catalogue_items = structured_output_model.invoke(messages).items
            for item in catalogue_items:
                item.page = idx
            # Success: reset messages and retry count, increment page index
            return {
                "catalogue_items": catalogue_items, 
                "current_page_idx": idx + 1,
                "messages": [], # Clear messages for next page
                "retry_count": 0
            }
        
        except OutputParserException as e:
            retry_count = state.get("retry_count", 0) + 1
            if retry_count <= 3:
                logging.info(f"Validation error on page {idx} (attempt {retry_count}): {e}")
                # Feed error back to model
                messages.append(HumanMessage(content=f"Validation Error: {str(e)}\nPlease correct the output."))
                return {
                    "retry_count": retry_count,
                    "messages": messages
                } # Do not increment page index, will loop back
            else:
                logging.info(f"Max retries reached for page {idx}. Moving to next page.")
                return {
                    "current_page_idx": idx + 1,
                    "messages": [],
                    "retry_count": 0
                }

        except Exception as e:
            logging.info(f"Error extracting items from page {idx}: {e}")
            # Continue to next page even if one fails
            return {
                "current_page_idx": idx + 1,
                "messages": [],
                "retry_count": 0
            }

    def _check_if_all_pages_processed(self, state: CatalogueIngestorState):
        """Check if all pages have been processed."""
        if state["current_page_idx"] >= state["total_pages"]:
            return "end"
        return "continue"

    def _check_conversion(self, state: CatalogueIngestorState):
        """Check if PDF conversion was successful."""
        if state.get("error"):
            return "end"
        return "continue"

    def _compile_graph(self):
        """Compile the graph.""" 
        # Define the state graph
        workflow = StateGraph(CatalogueIngestorState)

        # Define the nodes
        workflow.add_node("convert_pdf", self._convert_pdf_to_images)
        workflow.add_node("extract_items", self._extract_items_from_images)
        
        # Define the edges
        workflow.set_entry_point("convert_pdf") 
        
        # Conditional edge for conversion check
        workflow.add_conditional_edges(
            "convert_pdf",
            self._check_conversion,
            {
                "continue": "extract_items",
                "end": END
            }
        )
        
        # Conditional edge loop
        workflow.add_conditional_edges(
            "extract_items",
            self._check_if_all_pages_processed,
            {
                "continue": "extract_items",
                "end": END
            }
        )

        return workflow.compile()

    def ingest(self, pdf_path: str) -> dict:
        """Ingest the catalogue."""
        initial_state = CatalogueIngestorState(pdf_path=pdf_path)
        final_state = self.graph.invoke(initial_state, config={"recursion_limit": RECURSION_LIMIT})
        return final_state
    
    async def stream_ingest(self, pdf_path: str):
        """Asynchronously ingest the catalogue."""
        initial_state = CatalogueIngestorState(pdf_path=pdf_path)
        return self.graph.astream_events(initial_state, config={"recursion_limit": RECURSION_LIMIT})

    def parse_final_state(self, final_state: CatalogueIngestorState):
        """
        Parse the final state of catalogue ingestion to extract item images and data.

        Args:
            final_state (CatalogueIngestorState): The final state after ingestion.

        Returns:
            list[dict]: A list of catalogue item payloads with image paths.
        """
        final_catalogue_items = final_state.get("catalogue_items", [])
        pdf_page_paths = final_state.get("pdf_page_paths", [])
        
        # Extract image from page and crop to bbox
        catalogue_item_payloads = list()
        for item in final_catalogue_items:
           if not item.bbox or item.page is None:
               logging.warning(f"Skipping item without bbox or page: {item}")
               continue
           
           try:
            # Extract image from page and crop to bbox
            page_img_path = pdf_page_paths[item.page]
            page_img = Image.open(page_img_path)
            item_img = page_img.crop(get_pil_box(item.bbox, page_img.width, page_img.height))

            # Save item image
            fd, item_img_path_str = tempfile.mkstemp(prefix='item-', suffix='.jpeg')
            os.close(fd)
            item_img_path = Path(item_img_path_str)
            item_img.save(item_img_path, format='JPEG', optimize=True)

            # Prepare payload
            catalogue_item_payload = item.model_dump(mode="json")
            catalogue_item_payload["image_path"] = str(item_img_path)
            catalogue_item_payloads.append(catalogue_item_payload)

           except Exception as e:
               logging.warning(f"Failed to process image for item: {item}. Error: {e}", exc_info=True)
               continue

        return catalogue_item_payloads