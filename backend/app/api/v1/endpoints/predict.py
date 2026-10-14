from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.schemas.prediction import PredictRequest, PredictResponse, RecommendResponse
from app.services.ml_service import compute_prediction_and_shap, format_ranked_universities

router = APIRouter()


@router.post("/score", response_model=PredictResponse)
def predict_score(
    payload: PredictRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Run XGBoost + SHAP feature attribution to score applicant competitiveness.
    Works for authenticated users and anonymous guest explorations.
    """
    data = payload.model_dump()
    res = compute_prediction_and_shap(data)

    return {
        "score": res["score"],
        "percentile": res["percentile"],
        "factors": res["factors"],
        "summary": res["summary"]
    }


@router.post("/recommend", response_model=RecommendResponse)
def recommend_universities(
    payload: PredictRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate calibrated 3-3-3 portfolio (Target, Consider, Reach) with
    TreeSHAP bottleneck and strength diagnostics.
    """
    data = payload.model_dump()
    res = compute_prediction_and_shap(data)
    ranked = format_ranked_universities(res["raw_portfolio"])

    counts = {
        "total_target": len([r for r in ranked if r["fit"]["tier"] == "target"]),
        "total_consider": len([r for r in ranked if r["fit"]["tier"] == "consider"]),
        "total_reach": len([r for r in ranked if r["fit"]["tier"] == "reach"])
    }

    return {
        "score": res["score"],
        "factors": res["factors"],
        "ranked": ranked,
        "portfolio_summary": counts
    }
