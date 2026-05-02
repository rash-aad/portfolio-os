"""
Portfolio OS — backend/routes/gallery.py

Serves gallery categories and images from public/gallery/
- GET /gallery/              → list all categories with image count
- GET /gallery/{category}    → list all images in a category
- GET /gallery/{category}/{filename} → serve the actual image file
"""
import re
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()

GALLERY_DIR   = Path(__file__).parent.parent.parent / "public" / "gallery"
ALLOWED_EXTS  = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Category display names and icons
CATEGORY_META = {
    "aiml":     {"label": "AI / ML",    "icon": "🤖"},
    "security": {"label": "Security",   "icon": "🔐"},
    "edge-ai":  {"label": "Edge AI",    "icon": "📡"},
    "research": {"label": "Research",   "icon": "📚"},
    "gaming":   {"label": "Gaming",     "icon": "🎮"},
    "coffee":   {"label": "Coffee",     "icon": "☕"},
    "linux":    {"label": "Linux",      "icon": "🐧"},
    "building": {"label": "Building",   "icon": "🛠️"},
}


# ── Models ──────────────────────────────────────────────
class GalleryCategory(BaseModel):
    slug:        str
    label:       str
    icon:        str
    image_count: int
    preview_url: str | None   # first image as preview thumbnail


class GalleryImage(BaseModel):
    filename: str
    caption:  str             # cleaned-up filename
    url:      str             # /gallery/{category}/{filename}


# ── Helpers ─────────────────────────────────────────────
def _caption_from_filename(filename: str) -> str:
    """my-cool-photo.jpg  →  My Cool Photo"""
    stem = Path(filename).stem
    return stem.replace("-", " ").replace("_", " ").title()


def _is_image(path: Path) -> bool:
    return path.suffix.lower() in ALLOWED_EXTS


def _safe_slug(s: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-]", "", s)


# ── Routes ──────────────────────────────────────────────
@router.get("/", response_model=list[GalleryCategory])
async def list_categories():
    """Return all category folders with image counts."""
    if not GALLERY_DIR.exists():
        return []
    categories = []
    for folder in sorted(GALLERY_DIR.iterdir()):
        if not folder.is_dir():
            continue
        slug   = folder.name
        images = [f for f in sorted(folder.iterdir()) if _is_image(f)]
        meta   = CATEGORY_META.get(slug, {"label": slug.replace("-", " ").title(), "icon": "📁"})
        preview = f"/gallery/{slug}/{images[0].name}" if images else None
        categories.append(GalleryCategory(
            slug        = slug,
            label       = meta["label"],
            icon        = meta["icon"],
            image_count = len(images),
            preview_url = preview,
        ))
    return categories


@router.get("/{category}/{filename:path}")
async def serve_image(category: str, filename: str):
    """Serve the actual image file."""
    category = _safe_slug(category)
    filename = re.sub(r"[^a-zA-Z0-9_\-\.]", "", filename)
    path     = GALLERY_DIR / category / filename
    if not path.exists() or not _is_image(path):
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(path)


@router.get("/{category}", response_model=list[GalleryImage])
async def list_images(category: str):
    """Return all images inside a category folder."""
    category = _safe_slug(category)
    folder   = GALLERY_DIR / category
    if not folder.exists() or not folder.is_dir():
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found.")
    images = []
    for f in sorted(folder.iterdir()):
        if _is_image(f):
            images.append(GalleryImage(
                filename = f.name,
                caption  = _caption_from_filename(f.name),
                url      = f"/gallery/{category}/{f.name}",
            ))
    return images



