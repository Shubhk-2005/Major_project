import os
import json
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.document import Document
from app.models.profile import UserProfile
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.document_service import extract_text_from_pdf, upload_document_file, UPLOADS_DIR
from app.services.llm_service import parse_resume
from app.db.repositories import MongoDocumentRepo, MongoProfileRepo

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    file_type: str = Form("SOP"),
    user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload SOP, Resume, or LOR PDF.
    - Extracts text for LLM analysis.
    - If document is a Resume/CV: automatically invokes Gemini to extract work experience,
      research publications, and internships, then syncs them into the user's profile for the ML model!
    - Uploads to Cloudinary (or local fallback).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currently, only PDF documents are supported for automated extraction."
        )

    content = await file.read()
    size_kb = round(len(content) / 1024.0, 1)

    # 1. Extract text from PDF
    extracted_text = extract_text_from_pdf(content)

    # 2. Upload to Cloudinary or local storage
    url, public_id = upload_document_file(file.filename, content)

    # 3. Check if document is a Resume/CV
    is_resume = (
        file_type.lower() in ["resume", "cv"]
        or "resume" in file.filename.lower()
        or "cv" in file.filename.lower()
    )

    parsed_feedback = None
    doc_status = "uploaded"

    if is_resume and extracted_text and len(extracted_text.strip()) > 30:
        parsed_resume = parse_resume(extracted_text)
        parsed_feedback = json.dumps(parsed_resume)
        doc_status = "parsed"

        exp_years = float(parsed_resume.get("work_experience_years", 0.0))
        pubs = int(parsed_resume.get("research_publications", 0))
        internships = int(parsed_resume.get("internships_count", 0))
        work_months = int(round(exp_years * 12.0))

        # Auto-update profile in database so stacked ML model picks up real metrics
        if settings.DB_ENGINE == "mongodb":
            MongoProfileRepo.update_profile(
                str(user.id),
                {
                    "work_months": work_months,
                    "publications": pubs,
                    "internships": internships
                }
            )
        else:
            profile = db.query(UserProfile).filter(UserProfile.user_id == int(user.id)).first()
            if profile:
                profile.work_months = work_months
                profile.publications = pubs
                profile.internships = internships
                db.commit()

    # 4. Save to database (MongoDB or SQL)
    if settings.DB_ENGINE == "mongodb":
        doc_dict = MongoDocumentRepo.create_document(
            user_id=str(user.id),
            filename=file.filename,
            file_type="Resume" if is_resume else file_type,
            size_kb=size_kb,
            cloudinary_url=url,
            cloudinary_public_id=public_id,
            extracted_text=extracted_text
        )
        if parsed_feedback:
            MongoDocumentRepo.update_feedback(doc_dict["id"], parsed_feedback, status="parsed")

        return DocumentResponse(
            id=doc_dict["id"],
            user_id=doc_dict["user_id"],
            filename=doc_dict["filename"],
            file_type="Resume" if is_resume else doc_dict["file_type"],
            size_kb=doc_dict["size_kb"],
            cloudinary_url=doc_dict["cloudinary_url"],
            extracted_text_preview=doc_dict["extracted_text"][:300] if doc_dict.get("extracted_text") else None,
            status=doc_status,
            created_at=doc_dict["created_at"],
            updated_at=doc_dict["updated_at"]
        )

    doc = Document(
        user_id=int(user.id),
        filename=file.filename,
        file_type="Resume" if is_resume else file_type,
        size_kb=size_kb,
        cloudinary_url=url,
        cloudinary_public_id=public_id,
        extracted_text=extracted_text,
        feedback_json=parsed_feedback,
        status=doc_status
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        file_type=doc.file_type,
        size_kb=doc.size_kb,
        cloudinary_url=doc.cloudinary_url,
        extracted_text_preview=doc.extracted_text[:300] if doc.extracted_text else None,
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )


@router.get("/list", response_model=DocumentListResponse)
def list_documents(
    user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all uploaded documents for the current user."""
    if settings.DB_ENGINE == "mongodb":
        docs = MongoDocumentRepo.get_user_documents(str(user.id))
        resp_list = [
            DocumentResponse(
                id=d["id"],
                user_id=d["user_id"],
                filename=d["filename"],
                file_type=d["file_type"],
                size_kb=d["size_kb"],
                cloudinary_url=d.get("cloudinary_url"),
                extracted_text_preview=d["extracted_text"][:200] if d.get("extracted_text") else None,
                status=d["status"],
                created_at=d["created_at"],
                updated_at=d["updated_at"]
            )
            for d in docs
        ]
        return DocumentListResponse(documents=resp_list, total=len(resp_list))

    docs = db.query(Document).filter(Document.user_id == int(user.id)).order_by(Document.created_at.desc()).all()
    resp_list = [
        DocumentResponse(
            id=d.id,
            user_id=d.user_id,
            filename=d.filename,
            file_type=d.file_type,
            size_kb=d.size_kb,
            cloudinary_url=d.cloudinary_url,
            extracted_text_preview=d.extracted_text[:200] if d.extracted_text else None,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in docs
    ]
    return DocumentListResponse(documents=resp_list, total=len(resp_list))


@router.get("/files/{filename}")
def serve_local_file(filename: str):
    """Serve local uploaded files fallback."""
    file_path = os.path.join(UPLOADS_DIR, os.path.basename(filename))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)
