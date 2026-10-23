from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.search import SemanticSearchRequest, SemanticSearchResponse
from app.services.chroma_service import chroma_service
from app.services.cache_service import rate_limiter

router = APIRouter()


@router.post(
    "/semantic",
    response_model=SemanticSearchResponse,
    dependencies=[Depends(rate_limiter(max_requests=40, window_seconds=60))]
)
def semantic_search_universities(payload: SemanticSearchRequest):
    """
    Perform natural language AI semantic search over universities and programs using ChromaDB.
    Matches queries based on research strengths, labs, admissions criteria, and geographic attributes.
    Responses are cached in Redis for instantaneous repeat queries.
    """
    if not chroma_service.is_active:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ChromaDB semantic search engine is currently offline."
        )

    matched = chroma_service.semantic_search(
        query=payload.query,
        top_k=payload.top_k,
        country_filter=payload.country,
        max_tier=payload.max_tier
    )

    return {
        "query": payload.query,
        "total": len(matched),
        "results": matched
    }


@router.get("/status")
def search_status():
    """Diagnostic endpoint to inspect ChromaDB vector store health and document count."""
    if not chroma_service.is_active:
        return {"status": "inactive", "count": 0}
    count = chroma_service.count
    return {
        "status": "active",
        "collection": "universities_semantic_catalog",
        "indexed_universities": count,
        "embedding_model": "all-MiniLM-L6-v2 (ONNX local 384-dim)"
    }


@router.post("/reindex")
def reindex_catalog():
    """Rebuild and update the vector embeddings for all universities."""
    total = chroma_service.index_catalog()
    return {"status": "reindexed", "indexed_count": total}
