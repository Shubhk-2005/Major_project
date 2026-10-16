from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class CriterionItem(BaseModel):
    score: Optional[float] = Field(default=None, description="Score 0 to 10, or None if unassessable")
    evidence: str = Field(default="", description="Supporting evidence quoted or referenced from the SOP")
    strength: str = Field(default="", description="Main strength identified")
    weakness: str = Field(default="", description="Important weakness or missing information")


class CriteriaMap(BaseModel):
    academic_preparation: CriterionItem = Field(default_factory=CriterionItem)
    concrete_quantified_evidence: CriterionItem = Field(default_factory=CriterionItem)
    experience_meaning: CriterionItem = Field(default_factory=CriterionItem)
    specificity_of_goals: CriterionItem = Field(default_factory=CriterionItem)
    program_fit: CriterionItem = Field(default_factory=CriterionItem)
    non_technical_strengths: CriterionItem = Field(default_factory=CriterionItem)
    narrative_quality: CriterionItem = Field(default_factory=CriterionItem)
    compliance: CriterionItem = Field(default_factory=CriterionItem)


class SopCritiqueRequest(BaseModel):
    sop_text: Optional[str] = None
    document_id: Optional[Union[str, int]] = None
    sop_id: Optional[str] = "SOP-1"
    university: Optional[str] = "Target University"
    program: Optional[str] = "Master of Science in Computer Science"
    program_information: Optional[str] = "Standard graduate degree requirements apply."


class SopCritiqueResponse(BaseModel):
    sop_id: str
    university: str
    program: str
    criteria: CriteriaMap
    overall_strengths: List[str] = Field(default_factory=list)
    overall_weaknesses: List[str] = Field(default_factory=list)
    improvement_suggestions: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    
    # Calculated separately by evaluation program
    weighted_score_10: float = Field(default=0.0, description="Weighted composite score out of 10")
    weighted_score_100: float = Field(default=0.0, description="Weighted composite score out of 100")
    # Compatibility aliases for UI
    overall_score: int = Field(default=0, description="Integer score out of 100 for dashboard displays")
    summary: str = Field(default="", description="Executive overview summary")


class RoadmapAction(BaseModel):
    area: str
    action_item: str
    timeline: str
    expected_score_lift: str


class RoadmapRequest(BaseModel):
    gpa: float
    gre: Optional[float] = 315.0
    toefl: Optional[float] = 104.0
    publications: int = 0
    work_months: int = 0
    target_universities: List[str] = []


class RoadmapResponse(BaseModel):
    overview: str
    key_priorities: List[RoadmapAction]
    suggested_timeline_months: int
    executive_advice: str
