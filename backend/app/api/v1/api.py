from fastapi import APIRouter
from app.api.v1.endpoints import auth, profile, predict, documents, llm

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(predict.router, prefix="/predict", tags=["ML Predictions & Recommendations"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents & Cloudinary"])
api_router.include_router(llm.router, prefix="/llm", tags=["LLM Advisory & SOP"])
