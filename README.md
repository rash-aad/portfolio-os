# Portfolio OS 🖥️

A desktop-OS-style developer portfolio for **Rashaad N Mohammed** featuring:

- 🤖 **RAG-powered terminal** — ask anything about Rashaad, answered by a local LLM
- 🪟 **Draggable, resizable windows** — terminal, resume, projects, timeline, blog, gallery
- 🗓️ **Timeline** — education, work, projects, and publications all in one view
- 🌌 **Wallpaper switcher** — Stars (default) and Binary Rain animated wallpapers
- 📌 **Sticky note** — note to recruiters, draggable
- ⏱️ **Live clock** in taskbar
- 🖱️ **Right-click context menu**

---

## Project Structure

```
portfolio-os/
├── frontend/
│   ├── index.html          ← Main page (open this in browser)
│   ├── css/
│   │   ├── main.css        ← Variables, reset
│   │   ├── os.css          ← Desktop chrome, taskbar, icons
│   │   └── app.css         ← Window styles, terminal, timeline, etc.
│   └── js/
│       ├── app.js          ← Shared data constants
│       ├── wallpaper.js    ← Star & binary rain canvases
│       ├── os.js           ← Window management, clock, drag, toast
│       ├── terminal.js     ← Terminal logic + RAG fetch calls
│       └── timeline.js     ← Timeline data + render
├── backend/
│   ├── main.py             ← FastAPI app
│   ├── requirements.txt
│   ├── routes/
│   │   ├── rag.py          ← POST /rag/query endpoint
│   │   └── chat.py         ← POST /chat endpoint
│   └── rag/
│       └── engine.py       ← ChromaDB + Ollama RAG engine
├── data/                   ← RAG knowledge base (.txt files)
│   ├── resume.txt
│   ├── projects.txt
│   └── about.txt
├── public/
│   └── RASHAAD_N_MOHAMMED_Machine_Learning_Engineer.pdf
└── .env.example
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend |
| pip | latest | Python packages |
| Ollama | latest | Local LLM |
| A modern browser | — | Frontend |

---

## Setup Instructions

### Step 1 — Install Ollama

Download from [https://ollama.com](https://ollama.com) and install for your OS.

Then pull the required models:

```bash
# LLM for generation (can substitute mistral, phi3, etc.)
ollama pull llama3

# Embedding model (required for RAG)
ollama pull nomic-embed-text
```

Verify Ollama is running:
```bash
ollama list
```

### Step 2 — Set Up Python Backend

```bash
cd portfolio-os/backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# .\venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 3 — Configure Environment (optional)

```bash
cp ../.env.example .env
# Edit .env if you want to change models or ports
```

### Step 4 — Start the Backend

```bash
# From portfolio-os/backend/ with venv active
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On first start, it will **automatically ingest** all files from `data/` into ChromaDB.
You'll see output like:
```
[RAG] Ingested resume.txt → 12 chunks
[RAG] Ingested projects.txt → 18 chunks
[RAG] Ingested about.txt → 9 chunks
[RAG] Total chunks in DB: 39
```

### Step 5 — Open the Frontend

Open `frontend/index.html` directly in your browser:

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

> **Note:** For full functionality (resume PDF download), serve from a local HTTP server:
> ```bash
> cd portfolio-os
> python3 -m http.server 3000
> # Then open http://localhost:3000/frontend/
> ```

---

## Using the Terminal

The terminal has two modes:

### Static Commands
| Command | Description |
|---------|-------------|
| `help` | List all commands |
| `whoami` | About Rashaad |
| `skills` | Tech stack |
| `experience` | Work history |
| `education` | Academic background |
| `publications` | Research papers |
| `contact` | Contact details |
| `projects` | Open projects window |
| `timeline` | Open timeline window |
| `open <name>` | Open any window |
| `clear` | Clear terminal |

### RAG Mode (requires backend)
Type **any natural language question** and the RAG assistant will answer:

```
What kind of ML projects has he worked on?
Does he have experience with LLMs?
What are his publications about?
Is he open to work?
What tech stack does he use?
```

Or use the explicit `ask` prefix:
```
ask What's his experience with Docker?
```

---

## Adding More RAG Knowledge

Just add `.txt` files to the `data/` folder, then re-ingest:

```bash
# Using the API endpoint
curl -X POST http://localhost:8000/rag/ingest?force=true

# Or restart the backend (ingest runs on startup)
```

---

## Customizing Content

| What | Where |
|------|-------|
| Projects | `frontend/index.html` — `#win-projects` section |
| Blog posts | `frontend/index.html` — `#win-blog` section |
| Gallery items | `frontend/index.html` — `#win-gallery` section |
| Timeline data | `frontend/js/timeline.js` — `TIMELINE_DATA` array |
| Resume info | `frontend/index.html` — `#win-resume` section |
| Sticky note text | `frontend/index.html` — `.sticky-note` div |
| RAG knowledge | `data/*.txt` files |

---

## Changing the LLM Model

Edit `.env` or set environment variables:

```bash
# Use Mistral instead of Llama3
CHAT_MODEL=mistral uvicorn main:app --reload

# Use a smaller model
CHAT_MODEL=phi3 uvicorn main:app --reload
```

---

## Troubleshooting

**RAG not working / "backend not reachable"**
- Make sure backend is running: `uvicorn main:app --reload --port 8000`
- Check Ollama is running: `ollama list`
- Check CORS — browser must be on `localhost` or `127.0.0.1`

**Ollama model not found**
- Run: `ollama pull llama3` and `ollama pull nomic-embed-text`

**ChromaDB errors on startup**
- Delete `backend/chroma_db/` folder and restart to re-ingest

**Frontend can't load files**
- Serve via `python3 -m http.server 3000` instead of opening directly

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS, JetBrains Mono + Syne fonts |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Vector DB | ChromaDB (local, persistent) |
| LLM | Ollama (llama3 / any compatible model) |
| Embeddings | nomic-embed-text via Ollama |

---

Built by Rashaad N Mohammed · [github.com/rash-aad](https://github.com/rash-aad)
