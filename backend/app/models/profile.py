from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    undergrad = Column(String(255), default="B.Tech Computer Science")
    degree = Column(String(255), default="Master of Science in Computer Science")
    institution_tier = Column(Integer, default=3)
    target_program = Column(String(255), default="MS in Computer Science")
    intake = Column(String(100), default="Fall 2026")
    target_countries = Column(String(500), default="all", nullable=True)
    
    # Quantitative factors
    gpa = Column(Float, default=8.4)
    gre = Column(Float, default=320.0)
    toefl = Column(Float, default=108.0)
    english_test_type = Column(String(20), default="toefl")
    ielts_score = Column(Float, nullable=True)
    publications = Column(Integer, default=1)
    work_months = Column(Integer, default=12)
    internships = Column(Integer, default=2)
    lor_strength = Column(Float, default=0.0)
    sop_quality = Column(Float, default=0.0)

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
