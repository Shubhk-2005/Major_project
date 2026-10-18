import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MsAdmit API"
    API_V1_STR: str = "/api/v1"
    
    # JWT & Auth
    SECRET_KEY: str = "msadmit-super-secret-jwt-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database: 'sql' (PostgreSQL / SQLite) or 'mongodb'
    DB_ENGINE: str = "sql"
    DATABASE_URL: str = "sqlite:///./msadmit.db"

    # MongoDB Configuration
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGODB_URI: str = ""
    MONGO_DB_NAME: str = "msadmit"

    # Firebase Auth
    FIREBASE_PROJECT_ID: str = "msadmit-2aea9"

    @property
    def effective_mongo_uri(self) -> str:
        return self.MONGODB_URI or self.MONGO_URI

    # Gemini LLM API
    GEMINI_API_KEY: str = ""

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ]

    # Redis Cache Configuration (Upstash / Redis Cloud / Local)
    REDIS_URL: str = ""
    REDIS_CACHE_ENABLED: bool = True
    REDIS_CACHE_TTL_DEFAULT: int = 3600  # 1 hour
    REDIS_CACHE_TTL_LLM: int = 86400     # 24 hours
    RATE_LIMIT_ENABLED: bool = True

    # ChromaDB Vector Store
    CHROMA_PERSIST_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_data")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
