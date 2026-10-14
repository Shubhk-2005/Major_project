from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.db.repositories import MongoUserRepo

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account (MongoDB or SQL)."""
    if settings.DB_ENGINE == "mongodb":
        existing = MongoUserRepo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )
        user = MongoUserRepo.create_user(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name
        )
        token = create_access_token(subject=user["id"])
        return {"access_token": token, "token_type": "bearer"}

    # SQL fallback
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password and return access token."""
    if settings.DB_ENGINE == "mongodb":
        user = MongoUserRepo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
            )
        token = create_access_token(subject=user["id"])
        return {"access_token": token, "token_type": "bearer"}

    # SQL fallback
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: Any = Depends(get_current_user)):
    """Fetch authenticated user metadata."""
    return user
