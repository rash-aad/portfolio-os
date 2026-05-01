"""
Portfolio OS — backend/main.py
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, rag, blogs, gallery

app = FastAPI(title="Portfolio OS Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,    prefix="/chat",    tags=["chat"])
app.include_router(rag.router,     prefix="/rag",     tags=["rag"])
app.include_router(blogs.router,   prefix="/blogs",   tags=["blogs"])
app.include_router(gallery.router, prefix="/gallery", tags=["gallery"])


@app.get("/")
async def root():
    return {"status": "Portfolio OS backend running", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
