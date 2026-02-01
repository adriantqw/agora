"""Catalogue service for handling catalogue ingestion and product creation."""
import sys
import uuid
import time
import tempfile
import os
from pathlib import Path
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile
from PIL import Image
import asyncio
import logging

logger = logging.getLogger(__name__)

from agent.src.agents.catalogue_ingestor.core import CatalogueIngestor
from agent.src.utils.stream import AgentEventParser
from app.models.catalogue import Catalogue, CatalogueItem
from app.schemas.product import ProductCreate
from app.schemas.catalogue import CreateProductsItem
from app.services.storage_service import storage_service
from app.services import product_service
from app.database import SessionLocal
import json
import pypdfium2 as pdfium


# Initialize agent
catalogue_ingestor = CatalogueIngestor()


async def process_catalogue_background(
    catalogue_id: str,
    merchant_id: str,
    file_url: str,
    pdf_content: bytes,
    filename: str
):
    """
    Background task to process catalogue with AI agent using real-time streaming.

    Args:
        catalogue_id: The catalogue's ID
        merchant_id: The merchant's ID
        file_url: URL of uploaded PDF in R2
        pdf_content: Raw PDF file content
        filename: Original filename
    """

    db = SessionLocal()
    temp_pdf_path = None
    start_time = time.time()

    try:
        # Get catalogue record
        catalogue = db.query(Catalogue).filter(Catalogue.id == catalogue_id).first()
        if not catalogue:
            return

        # Save PDF to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name

        # Get total pages
        pdf_doc = pdfium.PdfDocument(temp_pdf_path)
        total_pages = len(pdf_doc)
        pdf_doc.close()

        catalogue.total_pages = total_pages
        catalogue.status = "processing"
        catalogue.current_page = 0
        db.commit()

        # Use streaming ingest to capture real-time events
        current_page = 0
        items_count = 0
        final_state = None
        event_parser = AgentEventParser("catalogue_ingestor")

        async for event in await catalogue_ingestor.stream_ingest(temp_pdf_path):
            # Extract metadata from the event
            metadata = event_parser.parse(event)
            
            # Debug: log what metadata was extracted
            if metadata["current_page"] is not None or metadata["item_count"] is not None:
                logger.info(f"Extracted metadata: current_page={metadata['current_page']}, item_count={metadata['item_count']}")
                logger.info(f"Extracted thinking messages: {metadata['thinking_messages']}")
            
            # Track page progress
            if metadata["current_page"] is not None and metadata["current_page"] > current_page:
                current_page = metadata["current_page"]
                catalogue.current_page = current_page
                db.commit()
                logger.info(f"Updated current_page to {current_page}")

            # Track items extracted
            if metadata["item_count"] is not None:
                items_count = metadata["item_count"]
                catalogue.items_extracted = items_count
                db.commit()
                logger.info(f"Updated items_extracted to {items_count}")
            
            # Update thinking message (truncate to first 100 characters)
            if metadata["thinking_messages"]:
                latest_thinking = metadata["thinking_messages"][-1]  # Get the last thinking message
                # Truncate to first 100 characters or first sentence
                truncated = latest_thinking[:100]
                if len(latest_thinking) > 100:
                    truncated += "..."
                catalogue.thinking_message = truncated
                db.commit()
                logger.info(f"Updated thinking_message: {truncated}")
            
            # Capture the final complete state from on_chain_end event
            if event.get('event') == 'on_chain_end' and event.get('name') == 'LangGraph':
                final_state = event.get('data', {}).get('output', {})
                logger.info(f"Captured final state with {len(final_state.get('catalogue_items', []))} items")

        # Verify we got a final state
        if not final_state:
            logger.error("No final state captured from streaming")
            catalogue.status = "failed"
            catalogue.error_message = "Failed to capture final state from ingestion"
            db.commit()
            return

        # Check for errors
        if "error" in final_state and final_state["error"]:
            catalogue.status = "failed"
            catalogue.error_message = str(final_state["error"])
            db.commit()
            return

        # Parse results
        item_payloads = catalogue_ingestor.parse_final_state(final_state)

        # Process each item
        items_created = 0
        for item_payload in item_payloads:
            try:
                image_path = item_payload.get("image_path")
                if not image_path or not os.path.exists(image_path):
                    continue

                # Upload cropped image to R2
                with open(image_path, 'rb') as img_file:
                    img_content = img_file.read()

                item_image_filename = f"{uuid.uuid4()}.jpg"

                import io
                from fastapi import UploadFile as FastAPIUploadFile

                img_upload = FastAPIUploadFile(
                    filename=item_image_filename,
                    file=io.BytesIO(img_content)
                )

                upload_result = await storage_service.upload_file(
                    img_upload,
                    "catalogue-items",
                    item_image_filename
                )

                if "error" in upload_result:
                    continue

                item_image_url = upload_result["url"]

                # Create catalogue item
                catalogue_item = CatalogueItem(
                    id=str(uuid.uuid4()),
                    catalogue_id=catalogue.id,
                    merchant_id=merchant_id,
                    name=item_payload.get("name", ""),
                    description=item_payload.get("description"),
                    sizes=item_payload.get("sizes", []),
                    colours=item_payload.get("colours", []),
                    page=item_payload.get("page", 0),
                    image_url=item_image_url,
                    bbox_data=item_payload.get("bbox", {}),
                    is_converted=False
                )
                db.add(catalogue_item)
                items_created += 1

                # Clean up temp image
                try:
                    os.remove(image_path)
                except Exception as e:
                    logger.warning(f"Failed to remove temp image {image_path}: {e}")

            except Exception as e:
                logger.error(f"Error processing item for catalogue {catalogue_id}: {e}", exc_info=True)
                continue

        # Update catalogue status
        catalogue.status = "completed"
        catalogue.items_extracted = items_created
        catalogue.current_page = total_pages
        catalogue.thinking_message = "Processing complete"
        catalogue.processing_time = time.time() - start_time
        db.commit()

        # Cleanup
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp PDF file: {e}")

        # Clean up page images
        pdf_page_paths = final_state.get("pdf_page_paths", [])
        for page_path in pdf_page_paths:
            try:
                if os.path.exists(page_path):
                    os.remove(page_path)
                page_dir = Path(page_path).parent
                if page_dir.exists() and not any(page_dir.iterdir()):
                    page_dir.rmdir()
            except Exception as e:
                logger.warning(f"Failed to clean up page images/directories: {e}")

    except Exception as e:
        # Log the full error
        logger.exception(f"Background processing failed for catalogue {catalogue_id}")
        
        # Mark as failed
        try:
            catalogue = db.query(Catalogue).filter(Catalogue.id == catalogue_id).first()
            if catalogue:
                catalogue.status = "failed"
                catalogue.error_message = str(e)
                db.commit()
        except:
            pass

        # Cleanup temp file
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception as e:
                logger.warning(f"Failed to remove temp PDF during error handling: {e}")
    finally:
        db.close()


async def upload_and_ingest_catalogue(
    db: Session,
    merchant_id: str,
    file: UploadFile,
    filename: str
) -> Catalogue:
    """
    Upload a PDF catalogue and start background processing.
    Returns immediately with status='processing'.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        file: The uploaded PDF file
        filename: Original filename

    Returns:
        Catalogue: The created catalogue record with status='processing'

    Raises:
        Exception: If upload fails
    """
    try:
        # Step 1: Upload PDF to R2
        unique_filename = f"{uuid.uuid4()}.pdf"
        upload_result = await storage_service.upload_file(file, "catalogues", unique_filename)

        if "error" in upload_result:
            raise Exception(f"Failed to upload PDF: {upload_result['error']}")

        file_url = upload_result["url"]

        # Step 2: Read PDF content for background processing
        await file.seek(0)
        pdf_content = await file.read()

        # Step 3: Create Catalogue record with status="processing"
        catalogue = Catalogue(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            filename=filename,
            file_url=file_url,
            status="processing",
            items_extracted=0
        )
        db.add(catalogue)
        db.commit()
        db.refresh(catalogue)

        # Step 4: Start background processing (non-blocking)
        asyncio.create_task(
            process_catalogue_background(
                catalogue.id,
                merchant_id,
                file_url,
                pdf_content,
                filename
            )
        )

        return catalogue

    except Exception as e:
        raise e


def get_catalogues(
    db: Session,
    merchant_id: str,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Catalogue], int]:
    """
    Get paginated list of catalogues for a merchant.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        page: Page number (1-indexed)
        limit: Items per page

    Returns:
        Tuple of (catalogues, total_count)
    """
    offset = (page - 1) * limit

    query = db.query(Catalogue).filter(Catalogue.merchant_id == merchant_id)
    total_count = query.count()

    catalogues = query.order_by(Catalogue.created_at.desc()).offset(offset).limit(limit).all()

    return catalogues, total_count


def get_catalogue_by_id(
    db: Session,
    merchant_id: str,
    catalogue_id: str
) -> Optional[Catalogue]:
    """
    Get a single catalogue by ID, verifying merchant ownership.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        catalogue_id: The catalogue's ID

    Returns:
        Catalogue or None
    """
    return db.query(Catalogue).filter(
        Catalogue.id == catalogue_id,
        Catalogue.merchant_id == merchant_id
    ).first()


def get_catalogue_items(
    db: Session,
    merchant_id: str,
    catalogue_id: str,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[CatalogueItem], int, Optional[Catalogue]]:
    """
    Get paginated list of items for a catalogue.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        catalogue_id: The catalogue's ID
        page: Page number (1-indexed)
        limit: Items per page

    Returns:
        Tuple of (items, total_count, catalogue)
    """
    # Verify catalogue belongs to merchant
    catalogue = get_catalogue_by_id(db, merchant_id, catalogue_id)
    if not catalogue:
        return [], 0, None

    offset = (page - 1) * limit

    query = db.query(CatalogueItem).filter(
        CatalogueItem.catalogue_id == catalogue_id,
        CatalogueItem.merchant_id == merchant_id
    )
    total_count = query.count()

    items = query.order_by(CatalogueItem.page.asc(), CatalogueItem.created_at.asc()).offset(offset).limit(limit).all()

    return items, total_count, catalogue


def create_products_from_items(
    db: Session,
    merchant_id: str,
    items: List[CreateProductsItem],
    default_price: float,
    default_quantity: int,
    generate_sku: bool = True,
    sku_prefix: str = "CAT-"
) -> dict:
    """
    Create products from catalogue items with overrides.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        items: List of item payload with overrides
        default_price: Default price for products
        default_quantity: Default quantity for products
        generate_sku: Whether to generate SKU
        sku_prefix: Prefix for generated SKU

    Returns:
        dict with created count and errors
    """
    # Extract IDs
    item_ids = [item.id for item in items]
    
    # Fetch catalogue items
    db_items = db.query(CatalogueItem).filter(
        CatalogueItem.id.in_(item_ids),
        CatalogueItem.merchant_id == merchant_id
    ).all()
    
    # Map DB items for O(1) lookup
    db_items_map = {item.id: item for item in db_items}

    created = 0
    errors = []

    for item_input in items:
        db_item = db_items_map.get(item_input.id)
        
        if not db_item:
            errors.append({
                "itemId": item_input.id,
                "error": "Item not found"
            })
            continue

        if db_item.is_converted:
            # Skip already converted items
            continue

        try:
            # Determine SKU
            if item_input.sku:
                 sku = item_input.sku
            elif generate_sku:
                short_uuid = str(uuid.uuid4())[:8].upper()
                sku = f"{sku_prefix}{short_uuid}"
            else:
                # Use item name as SKU base
                name_base = item_input.name or db_item.name
                sku = f"{sku_prefix}{name_base.replace(' ', '-')[:20]}"

            # Determine fields (override > db > default)
            name = item_input.name or db_item.name
            description = item_input.description or db_item.description
            price = item_input.price if item_input.price is not None else default_price
            quantity = item_input.quantity if item_input.quantity is not None else default_quantity
            
            # Merge sizes and colours into tags
            tags = []
            if db_item.sizes:
                tags.extend(db_item.sizes)
            if db_item.colours:
                tags.extend(db_item.colours)
            
            # Add extra tags from input if any
            if item_input.tags:
                tags.extend([t for t in item_input.tags if t not in tags])

            # Create product
            product_data = ProductCreate(
                name=name,
                sku=sku,
                price=price,
                quantity=quantity,
                tags=tags,
                image=db_item.image_url,
                description=description
            )

            product = product_service.create_product(db, merchant_id, product_data)

            # Update catalogue item
            db_item.product_id = product.id
            db_item.is_converted = True

            created += 1

        except Exception as e:
            errors.append({
                "itemId": db_item.id,
                "error": str(e)
            })

    db.commit()

    return {
        "created": created,
        "errors": errors
    }


def delete_catalogue(
    db: Session,
    merchant_id: str,
    catalogue_id: str
) -> bool:
    """
    Delete a catalogue and all associated items and R2 objects.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        catalogue_id: The catalogue's ID

    Returns:
        True if deleted successfully
    """
    # Verify ownership
    catalogue = get_catalogue_by_id(db, merchant_id, catalogue_id)
    if not catalogue:
        return False

    # Get all items to delete their images
    items = db.query(CatalogueItem).filter(
        CatalogueItem.catalogue_id == catalogue_id
    ).all()

    # Delete item images from R2
    for item in items:
        try:
            if not item.image_url:
                continue
            # Extract filename from URL
            filename = item.image_url.split('/')[-1]
            key = f"catalogue-items/{filename}"
            storage_service.delete_image(key)
        except Exception as e:
            logger.warning(f"Failed to delete item image. Url: {item.image_url}. Error: {e}")

    # Delete PDF from R2
    try:
        if catalogue.file_url:
            filename = catalogue.file_url.split('/')[-1]
            key = f"catalogues/{filename}"
            storage_service.delete_image(key)
    except Exception as e:
        logger.warning(f"Failed to delete catalogue PDF. Url: {catalogue.file_url}. Error: {e}")

    # Delete from database (cascade will handle items)
    db.delete(catalogue)
    db.commit()

    return True
