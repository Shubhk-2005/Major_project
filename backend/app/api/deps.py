from typing import Optional, Any, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.db.repositories import MongoUserRepo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
_google_request = google_requests.Request()


class UserWrapper:
    """Unified user adapter providing object attribute access for MongoDB and SQL."""
    def __init__(self, data: dict):
        self.id = str(data.get("id"))
        self.email = data.get("email")
        self.hashed_password = data.get("hashed_password")
        self.full_name = data.get("full_name")
        self.created_at = data.get("created_at")

    def __getitem__(self, item):
        return getattr(self, item)


def verify_token_payload(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify bearer token:
    1. Checks if token is a valid Firebase ID Token (Google OAuth/Email).
    2. Falls back to standard JWT token verification.
    """
    # 1. Try Firebase verification
    if settings.FIREBASE_PROJECT_ID:
        try:
            fb_payload = google_id_token.verify_firebase_token(
                token, _google_request, audience=settings.FIREBASE_PROJECT_ID
            )
            if fb_payload and fb_payload.get("sub"):
                return {
                    "sub": fb_payload["sub"],
                    "email": fb_payload.get("email"),
                    "name": fb_payload.get("name"),
                    "is_firebase": True
                }
        except Exception:
            pass

    # 2. Try custom JWT
    jwt_payload = decode_access_token(token)
    if jwt_payload and jwt_payload.get("sub"):
        return {
            "sub": jwt_payload["sub"],
            "is_firebase": False
        }

    return None


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Any:
    """Validate bearer token (Firebase or JWT) and return/sync user in MongoDB Atlas."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token_payload(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_sub = str(payload.get("sub"))
    email = payload.get("email")
    name = payload.get("name")

    if settings.DB_ENGINE == "mongodb":
        # Search by id or email
        user_doc = MongoUserRepo.get_by_id(user_sub)
        if not user_doc and email:
            user_doc = MongoUserRepo.get_by_email(email)

        # If user authenticated via Firebase for the first time, auto-create in MongoDB
        if not user_doc and payload.get("is_firebase") and email:
            user_doc = MongoUserRepo.create_user(
                email=email,
                hashed_password="FIREBASE_EXTERNAL_AUTH",
                full_name=name or email.split("@")[0]
            )

        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User associated with token not found"
            )
        return UserWrapper(user_doc)

    else:
        # SQL fallback
        try:
            uid_int = int(user_sub)
            user = db.query(User).filter(User.id == uid_int).first()
        except ValueError:
            user = None
        if not user and email:
            user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User associated with token not found"
            )
        return user


def get_optional_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[Any]:
    """Return user if token is provided and valid, otherwise None."""
    if not token:
        return None
    try:
        return get_current_user(db=db, token=token)
    except Exception:
        return None
