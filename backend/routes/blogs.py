"""
Portfolio OS — backend/routes/blogs.py

Serves markdown blog posts from public/blogs/
- GET /blogs/        → list all posts (metadata only, no body)
- GET /blogs/{slug}  → full post with parsed frontmatter + raw markdown body
"""
import re
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

BLOGS_DIR = Path(__file__).parent.parent.parent / "public" / "blogs"


# ── Models ──────────────────────────────────────────────
class BlogMeta(BaseModel):
    slug: str
    title: str
    date: str
    tags: list[str]
    excerpt: str


class BlogPost(BlogMeta):
    content: str   # raw markdown body (after frontmatter)


# ── Helpers ─────────────────────────────────────────────
def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Parse YAML-ish frontmatter between --- delimiters."""
    meta: dict = {}
    body = text

    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            fm_block = text[3:end].strip()
            body     = text[end + 3:].strip()
            for line in fm_block.splitlines():
                if ":" in line:
                    key, _, val = line.partition(":")
                    key = key.strip()
                    val = val.strip()
                    # Handle list values like [a, b, c]
                    if val.startswith("[") and val.endswith("]"):
                        items = [i.strip().strip('"').strip("'") for i in val[1:-1].split(",")]
                        meta[key] = items
                    else:
                        meta[key] = val.strip('"').strip("'")
    return meta, body


def _load_post(path: Path) -> BlogPost:
    slug = path.stem
    raw  = path.read_text(encoding="utf-8")
    meta, body = _parse_frontmatter(raw)
    return BlogPost(
        slug    = slug,
        title   = meta.get("title",   slug.replace("-", " ").title()),
        date    = meta.get("date",    ""),
        tags    = meta.get("tags",    []),
        excerpt = meta.get("excerpt", body[:160].replace("\n", " ") + "..."),
        content = body,
    )


# ── Routes ──────────────────────────────────────────────
@router.get("/", response_model=list[BlogMeta])
async def list_posts():
    """Return all blog post metadata sorted newest-first."""
    if not BLOGS_DIR.exists():
        return []
    posts = []
    for f in sorted(BLOGS_DIR.glob("*.md"), reverse=True):
        try:
            p = _load_post(f)
            posts.append(BlogMeta(**p.model_dump()))
        except Exception as e:
            print(f"[blogs] Skipping {f.name}: {e}")
    return posts


@router.get("/{slug}", response_model=BlogPost)
async def get_post(slug: str):
    """Return a single blog post with full markdown content."""
    # Sanitize slug — no path traversal
    slug = re.sub(r"[^a-zA-Z0-9_\-]", "", slug)
    path = BLOGS_DIR / f"{slug}.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Post '{slug}' not found.")
    return _load_post(path)
