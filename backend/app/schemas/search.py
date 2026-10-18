from typing import List, Optional
from pydantic import BaseModel, Field


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural language exploratory query (e.g. 'Universities with top AI labs and high funding')")
    top_k: int = Field(default=12, ge=1, le=50, description="Maximum number of universities to retrieve")
    country: Optional[str] = Field(default=None, description="Optional country filter (e.g. 'United States', 'Canada')")
    max_tier: Optional[int] = Field(default=None, ge=1, le=3, description="Optional maximum tier filter (1=Elite, 2=Competitive, 3=Safe)")


class SemanticUniversityItem(BaseModel):
    id: str
    name: str
    country: str
    qs_rank: int
    tier: str
    admit_rate_pct: float
    median_gpa: float
    median_gre: float
    median_toefl: float
    match_score: float
    relevance_snippet: str


class SemanticSearchResponse(BaseModel):
    query: str
    total: int
    results: List[SemanticUniversityItem]
