"""
Portfolio OS — backend/routes/gallery.py
"""
import re
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()

GALLERY_DIR  = Path(__file__).parent.parent.parent / "public" / "gallery"
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

CATEGORY_META = {
    "aiml":     {"label": "AI / ML",  "icon": "🤖"},
    "security": {"label": "Security", "icon": "🔐"},
    "edge-ai":  {"label": "Edge AI",  "icon": "📡"},
    "research": {"label": "Research", "icon": "📚"},
    "gaming":   {"label": "Gaming",   "icon": "🎮"},
    "coffee":   {"label": "Coffee",   "icon": "☕"},
    "linux":    {"label": "Linux",    "icon": "🐧"},
    "building": {"label": "Building", "icon": "🛠️"},
}

class GalleryCategory(BaseModel):
    slug:        str
    label:       str
    icon:        str
    image_count: int
    preview_url: str | None

class GalleryImage(BaseModel):
    filename: str
    caption:  str
    url:      str

def _is_image(path: Path) -> bool:
    return path.suffix.lower() in ALLOWED_EXTS

def _caption(filename: str) -> str:
    return Path(filename).stem.replace("-", " ").replace("_", " ").title()

@router.get("/", response_model=list[GalleryCategory])
async def list_categories():
    if not GALLERY_DIR.exists():
        return []
    cats = []
    for folder in sorted(GALLERY_DIR.iterdir()):
        if not folder.is_dir():
            continue
        images = [f for f in sorted(folder.iterdir()) if _is_image(f)]
        meta   = CATEGORY_META.get(folder.name, {"label": folder.name.title(), "icon": "📁"})
        cats.append(GalleryCategory(
            slug        = folder.name,
            label       = meta["label"],
            icon        = meta["icon"],
            image_count = len(images),
            preview_url = f"/gallery/{folder.name}/{images[0].name}" if images else None,
        ))
    return cats

@router.get("/image/{category}/{filename}")
async def serve_image(category: str, filename: str):
    path = GALLERY_DIR / category / filename
    if not path.exists() or not _is_image(path):
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(path)

@router.get("/{category}", response_model=list[GalleryImage])
async def list_images(category: str):
    folder = GALLERY_DIR / category
    if not folder.exists():
        raise HTTPException(status_code=404, detail="Category not found.")
    images = []
    for f in sorted(folder.iterdir()):
        if _is_image(f):
            images.append(GalleryImage(
                filename = f.name,
                caption  = _caption(f.name),
                url      = f"/gallery/image/{category}/{f.name}",
            ))
    return images
