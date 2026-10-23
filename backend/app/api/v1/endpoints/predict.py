from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.schemas.prediction import PredictRequest, PredictResponse, RecommendResponse
from app.services.ml_service import compute_prediction_and_shap, format_ranked_universities
from app.services.cache_service import cache, rate_limiter
from app.core.config import settings

router = APIRouter()


@router.post("/score", response_model=PredictResponse, dependencies=[Depends(rate_limiter(max_requests=60, window_seconds=60))])
def predict_score(payload: PredictRequest):
    """
    Run XGBoost + SHAP feature attribution to score applicant competitiveness.
    Backed by Redis in-memory caching to eliminate duplicate matrix computations.
    """
    data = payload.model_dump()
    cache_key = cache.make_ml_cache_key("cache:ml:score", data)
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result

    res = compute_prediction_and_shap(data)
    response_data = {
        "score": res["score"],
        "percentile": res["percentile"],
        "factors": res["factors"],
        "summary": res["summary"]
    }

    cache.set(cache_key, response_data, ttl=settings.REDIS_CACHE_TTL_DEFAULT)
    return response_data


@router.post("/recommend", response_model=RecommendResponse, dependencies=[Depends(rate_limiter(max_requests=40, window_seconds=60))])
def recommend_universities(payload: PredictRequest):
    """
    Generate calibrated 3-3-3 portfolio (Target, Consider, Reach) with
    TreeSHAP bottleneck and strength diagnostics.
    Cached in Redis to serve repeat page views in under 5ms.
    """
    data = payload.model_dump()
    cache_key = cache.make_ml_cache_key("cache:ml:recommend", data)
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result

    res = compute_prediction_and_shap(data)
    ranked = format_ranked_universities(res["raw_portfolio"])

    counts = {
        "total_target": len([r for r in ranked if r["fit"]["tier"] == "target"]),
        "total_consider": len([r for r in ranked if r["fit"]["tier"] == "consider"]),
        "total_reach": len([r for r in ranked if r["fit"]["tier"] == "reach"])
    }

    response_data = {
        "score": res["score"],
        "factors": res["factors"],
        "ranked": ranked,
        "portfolio_summary": counts
    }

    cache.set(cache_key, response_data, ttl=settings.REDIS_CACHE_TTL_DEFAULT)
    return response_data
