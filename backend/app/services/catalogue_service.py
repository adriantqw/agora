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

# Add agent to Python path
agent_path = Path(__file__).parent.parent.parent / "agent"
sys.path.insert(0, str(agent_path))

from src.agents.catalogue_ingestor import CatalogueIngestor
from app.models.catalogue import Catalogue, CatalogueItem
from app.models.product import Product
from app.schemas.product import ProductCreate
from app.services.storage_service import storage_service
from app.services import product_service


# Initialize agent
catalogue_ingestor = CatalogueIngestor()


async def upload_and_ingest_catalogue(
    db: Session,
    merchant_id: str,
    file: UploadFile,
    filename: str
) -> Catalogue:
    """
    Upload a PDF catalogue, process it with the agent, and store extracted items.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        file: The uploaded PDF file
        filename: Original filename

    Returns:
        Catalogue: The created catalogue record

    Raises:
        Exception: If processing fails
    """
    start_time = time.time()
    catalogue = None
    temp_pdf_path = None

    try:
        # Step 1: Upload PDF to R2
        unique_filename = f"{uuid.uuid4()}.pdf"
        upload_result = await storage_service.upload_file(file, "catalogues", unique_filename)

        if "error" in upload_result:
            raise Exception(f"Failed to upload PDF: {upload_result['error']}")

        file_url = upload_result["url"]

        # Step 2: Create Catalogue record with status="processing"
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

        # Step 3: Download PDF to temp file for processing
        # Reset file position
        await file.seek(0)
        pdf_content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name

        # Step 4: Call agent to ingest catalogue
        final_state = catalogue_ingestor.ingest(temp_pdf_path)

        # Check for errors in final state
        if "error" in final_state and final_state["error"]:
            raise Exception(final_state["error"])

        # Step 5: Parse final state to get items with cropped images
        item_payloads = catalogue_ingestor.parse_final_state(final_state)

        # Step 6: Process each item
        items_created = 0
        for item_payload in item_payloads:
            try:
                # Upload cropped item image to R2
                image_path = item_payload.get("image_path")
                if not image_path or not os.path.exists(image_path):
                    continue

                # Create UploadFile-like object for the cropped image
                with open(image_path, 'rb') as img_file:
                    img_content = img_file.read()

                # Upload to R2
                item_image_filename = f"{uuid.uuid4()}.jpg"

                # Create a temporary file-like object for upload
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
                    print(f"Failed to upload item image: {upload_result['error']}")
                    continue

                item_image_url = upload_result["url"]

                # Create CatalogueItem record
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

                # Clean up local item image
                try:
                    os.remove(image_path)
                except:
                    pass

            except Exception as e:
                print(f"Error processing catalogue item: {e}")
                continue

        # Step 7: Update Catalogue record
        processing_time = time.time() - start_time
        catalogue.status = "completed"
        catalogue.items_extracted = items_created
        catalogue.processing_time = processing_time
        db.commit()
        db.refresh(catalogue)

        # Clean up temp PDF and page images
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

        # Clean up page images from data/catalogues/
        pdf_page_paths = final_state.get("pdf_page_paths", [])
        for page_path in pdf_page_paths:
            try:
                if os.path.exists(page_path):
                    os.remove(page_path)
                # Also try to remove the catalogue directory if empty
                page_dir = Path(page_path).parent
                if page_dir.exists() and not any(page_dir.iterdir()):
                    page_dir.rmdir()
            except:
                pass

        return catalogue

    except Exception as e:
        # Update catalogue status to failed if it was created
        if catalogue:
            catalogue.status = "failed"
            catalogue.error_message = str(e)
            db.commit()

        # Clean up temp file
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

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
    item_ids: List[str],
    default_price: float,
    default_quantity: int,
    generate_sku: bool = True,
    sku_prefix: str = "CAT-"
) -> dict:
    """
    Create products from catalogue items.

    Args:
        db: Database session
        merchant_id: The merchant's ID
        item_ids: List of catalogue item IDs
        default_price: Default price for products
        default_quantity: Default quantity for products
        generate_sku: Whether to generate SKU
        sku_prefix: Prefix for generated SKU

    Returns:
        dict with created count and errors
    """
    # Fetch catalogue items
    items = db.query(CatalogueItem).filter(
        CatalogueItem.id.in_(item_ids),
        CatalogueItem.merchant_id == merchant_id
    ).all()

    # Filter out already converted items
    items_to_convert = [item for item in items if not item.is_converted]

    created = 0
    errors = []

    for item in items_to_convert:
        try:
            # Generate SKU
            if generate_sku:
                short_uuid = str(uuid.uuid4())[:8].upper()
                sku = f"{sku_prefix}{short_uuid}"
            else:
                # Use item name as SKU base
                sku = f"{sku_prefix}{item.name.replace(' ', '-')[:20]}"

            # Merge sizes and colours into tags
            tags = []
            if item.sizes:
                tags.extend(item.sizes)
            if item.colours:
                tags.extend(item.colours)

            # Create product
            product_data = ProductCreate(
                name=item.name,
                sku=sku,
                price=default_price,
                quantity=default_quantity,
                tags=tags,
                image=item.image_url,
                description=item.description
            )

            product = product_service.create_product(db, merchant_id, product_data)

            # Update catalogue item
            item.product_id = product.id
            item.is_converted = True

            created += 1

        except Exception as e:
            errors.append({
                "itemId": item.id,
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
            # Extract filename from URL
            filename = item.image_url.split('/')[-1]
            key = f"catalogue-items/{filename}"
            storage_service.delete_image(key)
        except:
            pass

    # Delete PDF from R2
    try:
        filename = catalogue.file_url.split('/')[-1]
        key = f"catalogues/{filename}"
        storage_service.delete_image(key)
    except:
        pass

    # Delete from database (cascade will handle items)
    db.delete(catalogue)
    db.commit()

    return True
