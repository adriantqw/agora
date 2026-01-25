"""Cloudflare R2 storage service for image uploads."""
import uuid
from typing import Optional
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.config import settings


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class StorageService:
    """Service for uploading files to Cloudflare R2."""

    def __init__(self):
        self._client = None

    @property
    def client(self):
        """Lazy-load S3 client for R2."""
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version="s3v4"),
                region_name="auto",
            )
        return self._client

    def _get_file_extension(self, filename: str) -> str:
        """Extract file extension from filename."""
        if "." in filename:
            return filename.rsplit(".", 1)[1].lower()
        return ""

    def _validate_file(self, file: UploadFile) -> Optional[str]:
        """Validate file type and size. Returns error message or None."""
        ext = self._get_file_extension(file.filename or "")
        if ext not in ALLOWED_EXTENSIONS:
            return f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"

        content_type = file.content_type or ""
        if not content_type.startswith("image/"):
            return "File must be an image"

        return None

    async def upload_image(self, file: UploadFile) -> dict:
        """
        Upload an image to Cloudflare R2.

        Args:
            file: The uploaded file from FastAPI

        Returns:
            dict with 'url' key on success, or 'error' key on failure
        """
        validation_error = self._validate_file(file)
        if validation_error:
            return {"error": validation_error}

        # Read file content
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            return {"error": f"File too large. Maximum size is {MAX_FILE_SIZE // 1024 // 1024}MB"}

        # Generate unique filename
        ext = self._get_file_extension(file.filename or "unknown.jpg")
        unique_filename = f"{uuid.uuid4()}.{ext}"

        try:
            self.client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=unique_filename,
                Body=content,
                ContentType=file.content_type or "image/jpeg",
            )

            # Construct public URL
            public_url = f"{settings.R2_PUBLIC_URL.rstrip('/')}/{unique_filename}"

            return {"url": public_url, "filename": unique_filename}

        except ClientError as e:
            return {"error": f"Upload failed: {str(e)}"}

    def delete_image(self, filename: str) -> bool:
        """
        Delete an image from R2.

        Args:
            filename: The filename (key) to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            self.client.delete_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=filename,
            )
            return True
        except ClientError:
            return False

    async def upload_file(self, file: UploadFile, folder: str, filename: str, max_size: int = 50 * 1024 * 1024) -> dict:
        """
        Upload any file type to R2 (not just images).

        Args:
            file: The uploaded file from FastAPI
            folder: Folder prefix (e.g., "catalogues" or "catalogue-items")
            filename: The filename to use (should include extension)
            max_size: Maximum file size in bytes (default 50MB)

        Returns:
            dict with 'url' and 'filename' keys on success, or 'error' key on failure
        """
        # Read file content
        content = await file.read()

        if len(content) > max_size:
            return {"error": f"File too large. Maximum size is {max_size // 1024 // 1024}MB"}

        # Construct key with folder prefix
        key = f"{folder.rstrip('/')}/{filename}"

        try:
            self.client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream",
            )

            # Construct public URL
            public_url = f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}"

            return {"url": public_url, "filename": key}

        except ClientError as e:
            return {"error": f"Upload failed: {str(e)}"}


# Global service instance
storage_service = StorageService()
