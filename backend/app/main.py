from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.services.cache_service import cache
import app.models  # Ensure all models are registered with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.DB_ENGINE == "mongodb":
        from app.db.mongo import get_mongo_db
        try:
            db = get_mongo_db()
            db.command("ping")
            print(f" Successfully connected to MongoDB Atlas database: '{db.name}'")
        except Exception as e:
            print(f" MongoDB Atlas connection warning: {e}")
    else:
        Base.metadata.create_all(bind=engine)

    cache_stat = cache.get_status()
    print(f"⚡ Cache Subsystem: {cache_stat['mode']} [{cache_stat['active_backend']}]")

    print("🧠 Vector Store: ChromaDB configured for on-demand lazy initialization")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__, "trace": traceback.format_exc().split("\n")}
    )

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    from app.services.chroma_service import chroma_service
    return {
        "status": "healthy",
        "cache": cache.get_status(),
        "vector_store": {
            "status": "active" if chroma_service.is_active else "inactive",
            "indexed_universities": chroma_service.count,
            "engine": "ChromaDB (all-MiniLM-L6-v2 ONNX)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
