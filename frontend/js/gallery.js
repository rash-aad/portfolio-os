/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — gallery.js
   Dynamic gallery: category grid → polaroid photo viewer
═══════════════════════════════════════════════════════ */

const GALLERY_API = 'https://7330-2405-201-d021-1815-1a03-73ff-fe81-c14b.ngrok-free.app/gallery';

// ── State ────────────────────────────────────────────────
let allCategories   = [];
let currentCategory = null;

// ── DOM ──────────────────────────────────────────────────
const galleryBody  = () => document.getElementById('gallery-body');
const galleryTitle = () => document.querySelector('#win-gallery .win-title');

// ── Load categories ──────────────────────────────────────
async function loadGalleryCategories() {
  const body = galleryBody();
  if (!body) return;

  body.innerHTML = '<div class="gallery-loading">⟳ Loading...</div>';

  try {
    const resp = await fetch(GALLERY_API + '/', {
  headers: {'ngrok-skip-browser-warning': 'true'}
});
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    allCategories = await resp.json();
    renderCategoryGrid(allCategories);
  } catch (err) {
    body.innerHTML = '<div class="gallery-error">✗ Could not load gallery.<br><span>Make sure the backend is running.</span></div>';
  }
}

// ── Render category grid ─────────────────────────────────
function renderCategoryGrid(cats) {
  const body = galleryBody();
  if (!body) return;
  galleryTitle().textContent = 'gallery — what I love';

  if (cats.length === 0) {
    body.innerHTML = '<div class="gallery-empty">No categories yet.<br><span>Add folders to <code>public/gallery/</code></span></div>';
    return;
  }

  body.innerHTML = '<div class="gallery-grid">' +
    cats.map(function(cat) {
      return '<div class="gallery-card" onclick="openGalleryCategory(\'' + cat.slug + '\')">' +
        '<div class="gallery-card-icon">' + cat.icon + '</div>' +
        '<div class="gallery-card-label">' + cat.label + '</div>' +
        '<div class="gallery-card-count">' + cat.image_count + ' photo' + (cat.image_count !== 1 ? 's' : '') + '</div>' +
        '</div>';
    }).join('') +
  '</div>';
}

// ── Open a category ──────────────────────────────────────
async function openGalleryCategory(slug) {
  const body = galleryBody();
  if (!body) return;

  body.innerHTML = '<div class="gallery-loading">⟳ Loading photos...</div>';

  try {
    const resp = await fetch(GALLERY_API + '/' + slug);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const images = await resp.json();
    const cat    = allCategories.find(function(c) { return c.slug === slug; }) || { label: slug, icon: '📁' };
    currentCategory = slug;
    renderPolaroids(images, cat);
  } catch (err) {
    body.innerHTML = '<div class="gallery-error">✗ Could not load photos.<br><span>' + err.message + '</span></div>';
  }
}

// ── Render polaroids ─────────────────────────────────────
function renderPolaroids(images, cat) {
  const body = galleryBody();
  if (!body) return;
  galleryTitle().textContent = 'gallery — ' + cat.icon + ' ' + cat.label;

  const backBtn = '<div style="margin-bottom:16px;"><span onclick="backToGalleryGrid()" class="gallery-back-btn">← all categories</span></div>';

  if (images.length === 0) {
    body.innerHTML = backBtn + '<div class="gallery-empty">No photos yet.<br><span>Drop images into <code>public/gallery/' + currentCategory + '/</code></span></div>';
    return;
  }

  const rots = [-2.5, 1.8, -1.2, 2.8, -0.8, 2.1, -2.2, 1.5];

  body.innerHTML = backBtn + '<div class="polaroid-grid">' +
    images.map(function(img, i) {
      var rot = rots[i % rots.length];
      var src = 'https://7330-2405-201-d021-1815-1a03-73ff-fe81-c14b.ngrok-free.app/gallery/' + currentCategory + '/' + img.filename;
      return '<div class="polaroid" style="--rot:' + rot + 'deg" onclick="openLightbox(\'' + src + '\',\'' + img.caption.replace(/'/g, "\\'") + '\')">' +
        '<div class="polaroid-img-wrap">' +
          '<img src="' + src + '" alt="' + img.caption + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=polaroid-broken>🖼️</div>\'" />' +
        '</div>' +
        '<div class="polaroid-caption">' + img.caption + '</div>' +
        '</div>';
    }).join('') +
  '</div>';
}

// ── Lightbox ─────────────────────────────────────────────
function openLightbox(src, caption) {
  document.getElementById('gallery-lightbox') && document.getElementById('gallery-lightbox').remove();
  var lb = document.createElement('div');
  lb.id = 'gallery-lightbox';
  lb.className = 'gallery-lightbox';
  lb.innerHTML =
    '<div class="lightbox-backdrop" onclick="closeLightbox()"></div>' +
    '<div class="lightbox-inner">' +
      '<div class="lightbox-close" onclick="closeLightbox()">✕</div>' +
      '<img src="' + src + '" alt="' + caption + '" />' +
      '<div class="lightbox-caption">' + caption + '</div>' +
    '</div>';
  document.getElementById('win-gallery').appendChild(lb);
}

function closeLightbox() {
  var lb = document.getElementById('gallery-lightbox');
  if (lb) lb.remove();
}

// ── Back to grid ─────────────────────────────────────────
function backToGalleryGrid() {
  currentCategory = null;
  galleryTitle().textContent = 'gallery — what I love';
  renderCategoryGrid(allCategories);
}

// ── Hook into openWindow ─────────────────────────────────
var _origOpenWindowGallery = window.openWindow;
window.openWindow = function(name) {
  _origOpenWindowGallery(name);
  if (name === 'gallery' && !currentCategory) {
    loadGalleryCategories();
  }
};

window.openGalleryCategory = openGalleryCategory;
window.backToGalleryGrid   = backToGalleryGrid;
window.openLightbox        = openLightbox;
window.closeLightbox       = closeLightbox;
