from typing import Optional, Union, List
from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    is_onboarded: bool = False
    undergrad: str = ""
    degree: str = ""
    institution_tier: int = Field(default=3, ge=1, le=3)
    target_program: str = "MS Computer Science"
    intake: str = "Fall 2027"
    target_countries: Optional[Union[List[str], str]] = None
    gpa: float = Field(default=0.0, ge=0.0, le=10.0)
    gre: float = Field(default=0.0, ge=0.0, le=340.0)
    toefl: float = Field(default=0.0, ge=0.0, le=120.0)
    english_test_type: Optional[str] = "toefl"
    ielts_score: Optional[float] = Field(default=None, ge=0.0, le=9.0)
    publications: int = Field(default=0, ge=0)
    work_months: int = Field(default=0, ge=0)
    internships: int = Field(default=0, ge=0)
    lor_strength: float = Field(default=0.0, ge=0.0, le=5.0)
    sop_quality: float = Field(default=0.0, ge=0.0, le=100.0)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    is_onboarded: Optional[bool] = None
    undergrad: Optional[str] = None
    degree: Optional[str] = None
    institution_tier: Optional[int] = Field(default=None, ge=1, le=3)
    target_program: Optional[str] = None
    intake: Optional[str] = None
    target_countries: Optional[Union[List[str], str]] = None
    gpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    gre: Optional[float] = Field(default=None, ge=0.0, le=340.0)
    toefl: Optional[float] = Field(default=None, ge=0.0, le=120.0)
    english_test_type: Optional[str] = None
    ielts_score: Optional[float] = Field(default=None, ge=0.0, le=9.0)
    publications: Optional[int] = Field(default=None, ge=0)
    work_months: Optional[int] = Field(default=None, ge=0)
    internships: Optional[int] = Field(default=None, ge=0)
    lor_strength: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    sop_quality: Optional[float] = Field(default=None, ge=0.0, le=100.0)


from typing import Optional, Union

class ProfileResponse(ProfileBase):
    id: Optional[Union[str, int]] = None
    user_id: Union[str, int]

    class Config:
        from_attributes = True
