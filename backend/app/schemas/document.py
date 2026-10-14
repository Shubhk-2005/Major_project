from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel


class DocumentBase(BaseModel):
    filename: str
    file_type: str = "SOP"
    size_kb: float = 0.0


class DocumentResponse(DocumentBase):
    id: Union[str, int]
    user_id: Union[str, int]
    cloudinary_url: Optional[str] = None
    extracted_text_preview: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
