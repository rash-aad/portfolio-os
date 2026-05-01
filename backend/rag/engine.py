"""
Portfolio OS — backend/rag/engine.py

RAG engine using:
  - ChromaDB              (vector store — persistent on Render disk / local)
  - Sentence Transformers (embeddings — runs locally, no API needed)
  - Groq API              (LLM — llama3, free, fast)

On first run it ingests all .txt files from data/
"""
import os
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions
from groq import Groq

# ── Config ──────────────────────────────────────────────
DATA_DIR        = Path(__file__).parent.parent.parent / "data"
CHROMA_PATH     = Path(os.getenv("CHROMA_PATH", str(Path(__file__).parent.parent / "chroma_db")))
COLLECTION_NAME = "portfolio_rag"
GROQ_API_KEY    = os.getenv("GROQ_API_KEY", "")
CHAT_MODEL      = os.getenv("CHAT_MODEL", "llama3-8b-8192")   # or llama3-70b-8192
CHUNK_SIZE      = 500
CHUNK_OVERLAP   = 80
TOP_K           = 3    # 3 is enough and faster than 4

# ── Groq client ──────────────────────────────────────────
_groq: Groq | None = None

def get_groq():
    global _groq
    if _groq is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable not set.")
        _groq = Groq(api_key=GROQ_API_KEY)
    return _groq

# ── ChromaDB — use sentence-transformers for embeddings ──
# (no external API needed, runs on CPU fine)
_client     = None
_collection = None

def get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    _client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"   # tiny, fast, good quality
    )
    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection

# ── Chunking ──────────────────────────────────────────────
def _chunk_text(text: str, source: str) -> list[dict]:
    chunks = []
    start, idx = 0, 0
    while start < len(text):
        chunk = text[start:start + CHUNK_SIZE]
        chunks.append({"id": f"{source}_{idx}", "text": chunk, "source": source})
        start += CHUNK_SIZE - CHUNK_OVERLAP
        idx   += 1
    return chunks

# ── Ingest ────────────────────────────────────────────────
def ingest_data(force: bool = False):
    collection = get_collection()
    existing   = collection.count()
    if existing > 0 and not force:
        print(f"[RAG] Already {existing} chunks, skipping ingest.")
        return
    txt_files = list(DATA_DIR.glob("*.txt"))
    if not txt_files:
        print(f"[RAG] No .txt files in {DATA_DIR}")
        return
    all_ids, all_docs, all_metas = [], [], []
    for fpath in txt_files:
        source = fpath.stem
        text   = fpath.read_text(encoding="utf-8", errors="ignore")
        for c in _chunk_text(text, source):
            all_ids.append(c["id"])
            all_docs.append(c["text"])
            all_metas.append({"source": c["source"]})
        print(f"[RAG] {fpath.name} ingested")
    for i in range(0, len(all_ids), 50):
        collection.upsert(
            ids=all_ids[i:i+50],
            documents=all_docs[i:i+50],
            metadatas=all_metas[i:i+50],
        )
    print(f"[RAG] Total chunks: {collection.count()}")

# ── Query ─────────────────────────────────────────────────
def query_rag(question: str) -> dict:
    collection = get_collection()
    results    = collection.query(query_texts=[question], n_results=TOP_K)
    docs       = results["documents"][0] if results["documents"] else []
    metas      = results["metadatas"][0]  if results["metadatas"]  else []
    sources    = list({m.get("source", "unknown") for m in metas})

    if not docs:
        return {
            "answer": "I don't have that documented here yet, but feel free to reach out at rashaadnmohammed@gmail.com!",
            "sources": [],
        }

    context = "\n\n---\n\n".join(docs)

    system_prompt = """You ARE Rashaad N Mohammed. Speak in first person as Rashaad himself.
A recruiter or visitor is talking to you through your portfolio terminal.
Answer using ONLY the provided context. Never say "Rashaad" — say "I", "my", or "me".
Be confident, concise, and personable — like you're in a real conversation with a recruiter.
If the context doesn't contain the answer, say: "That's not something I've documented here yet, but feel free to reach out at rashaadnmohammed@gmail.com"
Keep responses under 150 words unless more detail is asked for."""

    user_prompt = f"""Context from my portfolio:
{context}

Question: {question}

Answer as Rashaad in first person:"""

    chat = get_groq().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=250,
        temperature=0.7,
    )
    answer = chat.choices[0].message.content.strip()
    return {"answer": answer, "sources": sources}
