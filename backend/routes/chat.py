"""
Portfolio OS — backend/routes/chat.py
Simple direct chat with Ollama (no RAG context)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os

router = APIRouter()

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CHAT_MODEL  = os.getenv("CHAT_MODEL", "llama3")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        resp = requests.post(
            f"{OLLAMA_BASE}/api/chat",
            json={
                "model": CHAT_MODEL,
                "messages": [{"role": "user", "content": req.message}],
                "stream": False,
            },
            timeout=60,
        )
        resp.raise_for_status()
        content = resp.json().get("message", {}).get("content", "")
        return {"response": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
