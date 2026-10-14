from typing import Optional
from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    undergrad: str = "B.Tech Computer Science"
    degree: str = "Master of Science in Computer Science"
    institution_tier: int = Field(default=2, ge=1, le=3)
    target_program: str = "MS in Computer Science"
    intake: str = "Fall 2026"
    gpa: float = Field(default=8.4, ge=0.0, le=10.0)
    gre: float = Field(default=320.0, ge=260.0, le=340.0)
    toefl: float = Field(default=108.0, ge=0.0, le=120.0)
    publications: int = Field(default=1, ge=0)
    work_months: int = Field(default=12, ge=0)
    internships: int = Field(default=2, ge=0)
    lor_strength: float = Field(default=4.0, ge=1.0, le=5.0)
    sop_quality: float = Field(default=80.0, ge=0.0, le=100.0)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    undergrad: Optional[str] = None
    degree: Optional[str] = None
    institution_tier: Optional[int] = Field(default=None, ge=1, le=3)
    target_program: Optional[str] = None
    intake: Optional[str] = None
    gpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    gre: Optional[float] = Field(default=None, ge=260.0, le=340.0)
    toefl: Optional[float] = Field(default=None, ge=0.0, le=120.0)
    publications: Optional[int] = Field(default=None, ge=0)
    work_months: Optional[int] = Field(default=None, ge=0)
    internships: Optional[int] = Field(default=None, ge=0)
    lor_strength: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    sop_quality: Optional[float] = Field(default=None, ge=0.0, le=100.0)


from typing import Optional, Union

class ProfileResponse(ProfileBase):
    id: Optional[Union[str, int]] = None
    user_id: Union[str, int]

    class Config:
        from_attributes = True
