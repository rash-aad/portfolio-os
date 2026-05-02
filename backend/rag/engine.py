"""
Portfolio OS — backend/rag/engine.py

RAG engine using:
  - ChromaDB  (local vector store)
  - Ollama    (local LLM — nomic-embed-text for embeddings, llama3 for generation)

On first run it ingests all .txt files from data/
"""
import os
import glob
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions
import requests
import json

# ── Config ──────────────────────────────────────────────
DATA_DIR       = Path(__file__).parent.parent.parent / "data"
CHROMA_PATH    = Path(__file__).parent.parent / "chroma_db"
COLLECTION_NAME = "portfolio_rag"
OLLAMA_BASE    = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
EMBED_MODEL    = os.getenv("EMBED_MODEL",  "nomic-embed-text")
CHAT_MODEL     = os.getenv("CHAT_MODEL",   "phi-mini")
CHUNK_SIZE     = 500   # characters
CHUNK_OVERLAP  = 80
TOP_K          = 4

# ── ChromaDB client ──────────────────────────────────────
_client: chromadb.ClientAPI | None = None
_collection = None


def _get_ollama_embedder():
    """Embedding function that calls Ollama's /api/embeddings endpoint."""
    class OllamaEmbedder(embedding_functions.EmbeddingFunction):
        def __call__(self, input: list[str]) -> list[list[float]]:
            results = []
            for text in input:
                resp = requests.post(
                    f"{OLLAMA_BASE}/api/embeddings",
                    json={"model": EMBED_MODEL, "prompt": text},
                    timeout=60,
                )
                resp.raise_for_status()
                results.append(resp.json()["embedding"])
            return results
    return OllamaEmbedder()


def get_collection():
    """Lazy-init ChromaDB collection."""
    global _client, _collection
    if _collection is not None:
        return _collection
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    _client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    embedder = _get_ollama_embedder()
    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection


def _chunk_text(text: str, source: str) -> list[dict]:
    """Split text into overlapping chunks."""
    chunks = []
    start  = 0
    idx    = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append({
            "id":      f"{source}_{idx}",
            "text":    chunk,
            "source":  source,
        })
        start += CHUNK_SIZE - CHUNK_OVERLAP
        idx   += 1
    return chunks


def ingest_data(force: bool = False):
    """Ingest all .txt files from data/ into ChromaDB."""
    collection = get_collection()
    existing   = collection.count()
    if existing > 0 and not force:
        print(f"[RAG] Collection already has {existing} chunks, skipping ingest.")
        return

    txt_files = list(DATA_DIR.glob("*.txt"))
    if not txt_files:
        print(f"[RAG] No .txt files found in {DATA_DIR}")
        return

    all_ids, all_docs, all_metas = [], [], []
    for fpath in txt_files:
        source = fpath.stem
        text   = fpath.read_text(encoding="utf-8", errors="ignore")
        chunks = _chunk_text(text, source)
        for c in chunks:
            all_ids.append(c["id"])
            all_docs.append(c["text"])
            all_metas.append({"source": c["source"]})
        print(f"[RAG] Ingested {fpath.name} → {len(chunks)} chunks")

    # Upsert in batches of 50
    batch = 50
    for i in range(0, len(all_ids), batch):
        collection.upsert(
            ids=all_ids[i:i+batch],
            documents=all_docs[i:i+batch],
            metadatas=all_metas[i:i+batch],
        )
    print(f"[RAG] Total chunks in DB: {collection.count()}")


def query_rag(question: str) -> dict:
    """Query the RAG pipeline and return answer + sources."""
    collection = get_collection()

    # Retrieve top-k relevant chunks
    results = collection.query(query_texts=[question], n_results=TOP_K)
    docs     = results["documents"][0] if results["documents"] else []
    metas    = results["metadatas"][0] if results["metadatas"] else []
    sources  = list({m.get("source", "unknown") for m in metas})

    if not docs:
        return {
            "answer": "I don't have enough information to answer that. Try asking something about Rashaad's skills, projects, or experience.",
            "sources": [],
        }

    context = "\n\n---\n\n".join(docs)

    system_prompt = """You ARE Rashaad N Mohammed. Speak in first person as Rashaad himself.
A recruiter or visitor is asking you questions through your portfolio terminal.
Answer using ONLY the provided context. Never say "Rashaad" — say "I" or "my" or "me".
Be confident, concise, and personable — like you're in an actual conversation with a recruiter.
If the context doesn't contain the answer, say something like "That's not something I've documented here, but feel free to reach out at rashaadnmohammed@gmail.com".
Keep responses under 200 words unless more detail is asked for."""

    user_prompt = f"""Context from Rashaad's portfolio:
{context}

Question: {question}

Answer:"""

    # Call Ollama chat API
    payload = {
        "model": CHAT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        "stream": False,
    }

    resp = requests.post(
        f"{OLLAMA_BASE}/api/chat",
        json=payload,
        timeout=120,
    )
    resp.raise_for_status()
    data   = resp.json()
    answer = data.get("message", {}).get("content", "No response from model.")

    return {"answer": answer.strip(), "sources": sources}
