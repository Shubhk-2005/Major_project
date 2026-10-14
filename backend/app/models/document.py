from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), default="SOP")  # SOP, Resume, LOR, Transcript
    size_kb = Column(Float, default=0.0)
    cloudinary_url = Column(String(1024), nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)
    
    extracted_text = Column(Text, nullable=True)
    feedback_json = Column(Text, nullable=True)  # JSON feedback from LLM
    status = Column(String(50), default="uploaded")  # uploaded, analyzed, finalized

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="documents")
