from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    gpa: float = Field(..., ge=0.0, le=10.0, description="Undergraduate GPA on 10.0 or 4.0 scale")
    gre: Optional[float] = Field(default=315.0, ge=0.0, le=340.0)
    toefl: Optional[float] = Field(default=104.0, ge=0.0, le=120.0)
    work_months: int = Field(default=0, ge=0)
    internships: int = Field(default=0, ge=0)
    publications: int = Field(default=0, ge=0)
    institution_tier: int = Field(default=3, ge=1, le=3)
    undergrad: Optional[str] = Field(default=None, description="Undergraduate institution name")
    intake_term: str = Field(default="Fall", description="Fall or Spring")


class ShapFactor(BaseModel):
    key: str
    label: str
    value: str
    contribution: float
    explanation: str


class FitReason(BaseModel):
    key: str
    label: str
    impact: float
    text: str


class FitResult(BaseModel):
    fit: float
    tier: str  # target | consider | reach
    reasons: List[FitReason] = []


class UniversitySchema(BaseModel):
    id: str
    name: str
    program: str
    course: str
    country: str
    city: str
    rank: int
    acceptance: float
    avgGre: float
    avgGpa: float
    avgToefl: float
    tuition: float
    living: float
    deadline: str
    bar: float
    researchWeight: str


class RankedUniversitySchema(BaseModel):
    university: UniversitySchema
    fit: FitResult


class PredictResponse(BaseModel):
    score: float
    percentile: float
    factors: List[ShapFactor]
    summary: str


class RecommendResponse(BaseModel):
    score: float
    factors: List[ShapFactor]
    ranked: List[RankedUniversitySchema]
    portfolio_summary: Dict[str, int]
