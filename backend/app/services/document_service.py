import os
import io
import shutil
from typing import Dict, Any, Tuple, Optional
from pypdf import PdfReader
from app.core.config import settings

# Uploads directory fallback
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted.append(text)
        return "\n\n".join(extracted).strip()
    except Exception as e:
        return f"[PDF text extraction note: Could not parse text. Error: {str(e)}]"


def upload_document_file(filename: str, file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Upload file to Cloudinary if configured; otherwise store in local uploads/ directory.
    Returns (url, public_id).
    """
    has_cloudinary = (
        bool(settings.CLOUDINARY_CLOUD_NAME)
        and bool(settings.CLOUDINARY_API_KEY)
        and bool(settings.CLOUDINARY_API_SECRET)
        and settings.CLOUDINARY_CLOUD_NAME != "msadmit"  # not dummy placeholder
    )

    if has_cloudinary:
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )

            res = cloudinary.uploader.upload(
                file_bytes,
                resource_type="auto",
                folder="msadmit_documents"
            )
            return res.get("secure_url", res.get("url")), res.get("public_id")
        except Exception:
            # Fallback to local storage if Cloudinary upload fails
            pass

    # Local fallback
    safe_name = f"{int(os.times().elapsed * 1000)}_{os.path.basename(filename)}"
    dest_path = os.path.join(UPLOADS_DIR, safe_name)
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    # Return local served URL path
    local_url = f"/api/v1/documents/files/{safe_name}"
    return local_url, safe_name
