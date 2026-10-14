import json
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_optional_current_user
from app.models.document import Document
from app.schemas.llm import SopCritiqueRequest, SopCritiqueResponse, RoadmapRequest, RoadmapResponse
from app.services.llm_service import critique_sop, generate_admission_roadmap
from app.db.repositories import MongoDocumentRepo

router = APIRouter()


@router.post("/critique-sop", response_model=SopCritiqueResponse)
def critique_statement_of_purpose(
    payload: SopCritiqueRequest,
    current_user: Optional[Any] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform deep LLM analysis on Statement of Purpose using Gemini.
    Can evaluate raw text directly or reference an uploaded document_id.
    """
    text_to_analyze = payload.sop_text
    target_doc = None
    target_doc_id = None

    # If document_id provided, fetch extracted text from DB
    if payload.document_id:
        target_doc_id = payload.document_id
        if settings.DB_ENGINE == "mongodb":
            doc_dict = MongoDocumentRepo.get_by_id(target_doc_id)
            if not doc_dict:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced document not found.")
            text_to_analyze = doc_dict.get("extracted_text")
        else:
            try:
                target_doc = db.query(Document).filter(Document.id == int(target_doc_id)).first()
            except ValueError:
                target_doc = None
            if not target_doc:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced document not found.")
            text_to_analyze = target_doc.extracted_text

    if not text_to_analyze or len(text_to_analyze.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 50 characters of SOP text for meaningful analysis."
        )

    sop_id_val = payload.sop_id or (f"SOP-{target_doc_id}" if target_doc_id else "SOP-1")
    critique = critique_sop(
        sop_text=text_to_analyze,
        sop_id=sop_id_val,
        university=payload.university or "Target University",
        program=payload.program or "Master of Science in Computer Science",
        program_information=payload.program_information or "Standard graduate degree requirements apply."
    )

    # If linked to a document in DB, update feedback
    if target_doc_id:
        if settings.DB_ENGINE == "mongodb":
            MongoDocumentRepo.update_feedback(target_doc_id, json.dumps(critique))
        elif target_doc:
            target_doc.feedback_json = json.dumps(critique)
            target_doc.status = "analyzed"
            db.commit()

    return critique


@router.post("/generate-roadmap", response_model=RoadmapResponse)
def generate_roadmap(
    payload: RoadmapRequest,
    current_user: Optional[Any] = Depends(get_optional_current_user)
):
    """
    Synthesize profile metrics, SHAP bottlenecks, and target universities into
    a prioritized timeline roadmap powered by Gemini.
    """
    profile_data = payload.model_dump()
    roadmap = generate_admission_roadmap(
        profile_data=profile_data,
        target_unis=payload.target_universities
    )
    return roadmap
