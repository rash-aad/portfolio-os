"""
Portfolio OS — backend/routes/rag.py
FastAPI router for RAG queries
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.engine import query_rag, ingest_data

router = APIRouter()


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


@router.on_event("startup")
async def startup_event():
    """Ingest data on startup (skips if already indexed)."""
    try:
        ingest_data(force=False)
    except Exception as e:
        print(f"[RAG] Startup ingest warning: {e}")


@router.post("/query", response_model=QueryResponse)
async def rag_query(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        result = query_rag(req.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {str(e)}")


@router.post("/ingest")
async def trigger_ingest(force: bool = False):
    """Manually trigger data ingestion."""
    try:
        ingest_data(force=force)
        return {"status": "ok", "message": "Ingestion complete."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
