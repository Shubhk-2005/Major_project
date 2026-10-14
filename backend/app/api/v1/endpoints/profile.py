from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.profile import UserProfile
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.db.repositories import MongoProfileRepo

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve applicant metrics for the authenticated user (MongoDB or SQL)."""
    if settings.DB_ENGINE == "mongodb":
        profile = MongoProfileRepo.get_by_user_id(str(user.id))
        return profile

    profile = db.query(UserProfile).filter(UserProfile.user_id == int(user.id)).first()
    if not profile:
        profile = UserProfile(user_id=int(user.id))
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    patch: ProfileUpdate,
    user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile metrics (GPA, GRE, TOEFL, publications, etc.)."""
    patch_data = patch.model_dump(exclude_unset=True)

    if settings.DB_ENGINE == "mongodb":
        updated = MongoProfileRepo.update_profile(str(user.id), patch_data)
        return updated

    profile = db.query(UserProfile).filter(UserProfile.user_id == int(user.id)).first()
    if not profile:
        profile = UserProfile(user_id=int(user.id))
        db.add(profile)

    for field, val in patch_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile
