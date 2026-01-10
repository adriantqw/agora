import io
import os
import base64
import pypdfium2 as pdfium
from dotenv import load_dotenv
import uuid
from pathlib import Path
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from src.agents.schemas import CatalogueItem, CatalogueItemList
from src.agents.states import CatalogueIngestorState
from src.models.utils import load_model_from_config
from src.utils import load_prompt_templates, load_config

load_dotenv()

class CatalogueIngestor:
    """Catalogue ingestor agent. Ingests the unstructured catalogue document and returns a structured catalogue."""
    
    def __init__(self):
        """Initialize the agent."""
        self.agent_config = load_config("agent")["catalogue_ingestor"]
        self.model = load_model_from_config(self.agent_config["model"])
        self.templates = load_prompt_templates()["catalogue_ingestor"]
        self.graph = self._compile_graph()

    def _convert_pdf_to_images(self, state: CatalogueIngestorState):
        """Convert PDF pages to images."""
        pages = []
        try:
            pdf = pdfium.PdfDocument(state["pdf_path"])
            catalogue_path = Path(f'data/catalogue-{uuid.uuid4().hex}')
            catalogue_path.mkdir(parents=True, exist_ok=True)
            for page_indices in range(len(pdf)):
                page = pdf[page_indices]
                bitmap = page.render(scale=1.5)  # Scale for better OCR quality
                pil_image = bitmap.to_pil()
                
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

    def _extract_items_from_images(self, state: CatalogueIngestorState):
        """Extract items from images."""
        idx = state["current_page_idx"]
        image_path = state["pdf_page_paths"][idx]
        
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        # Encode image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        message = HumanMessage(
            content=[
                {"type": "text", "text": self.templates},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
            ]
        )
        
        structured_output_model = self.model.with_structured_output(CatalogueItemList)
        try:
            catalogue_items = structured_output_model.invoke([message]).items
            for item in catalogue_items:
                item.page = idx
            return {"catalogue_items": catalogue_items, "current_page_idx": idx + 1}
        except Exception as e:
            print(f"Error extracting items from page {idx}: {e}")
            # Continue to next page even if one fails
            return {"current_page_idx": idx + 1}

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
        final_state = self.graph.invoke(initial_state, config={"recursion_limit": 200})
        return final_state
    
    async def stream_ingest(self, pdf_path: str):
        """Asynchronously ingest the catalogue."""
        initial_state = CatalogueIngestorState(pdf_path=pdf_path)
        return self.graph.astream_events(initial_state, config={"recursion_limit": 200})