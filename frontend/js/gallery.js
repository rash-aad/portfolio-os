/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — gallery.js
   Dynamic gallery: category grid → polaroid photo viewer
═══════════════════════════════════════════════════════ */

const GALLERY_API = 'https://db82-2405-201-d021-1815-1a03-73ff-fe81-c14b.ngrok-free.app/gallery';
const NGROK_HEADERS = {'ngrok-skip-browser-warning': 'true'};

let currentCategory = null;

const galleryBody  = () => document.getElementById('gallery-body');
const galleryTitle = () => document.querySelector('#win-gallery .win-title');

async function loadImageAsBlob(src) {
  try {
    const resp = await fetch(src, {headers: NGROK_HEADERS});
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch(e) {
    return '';
  }
}

async function loadGalleryCategories() {
  const body = galleryBody();
  if (!body) return;
  body.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);padding:20px 0;text-align:center;"><span style="color:var(--green)">⟳</span> Loading...</div>';
  try {
    const resp = await fetch(GALLERY_API + '/', {headers: NGROK_HEADERS});
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const cats = await resp.json();
    renderGalleryGrid(cats);
  } catch(err) {
    body.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:#f87171;padding:12px 0;">✗ Could not load gallery.<br><span style="color:var(--text-dim)">Make sure the backend is running.</span></div>';
  }
}

function renderGalleryGrid(cats) {
  const body = galleryBody();
  if (!body) return;
  galleryTitle().textContent = 'gallery — what I love';
  body.innerHTML = '<div class="gallery-grid">' +
    cats.map(function(cat) {
      return '<div class="gallery-card" onclick="openGalleryCategory(\'' + cat.slug + '\',this)" data-slug="' + cat.slug + '">' +
        '<div class="gallery-card-icon">' + cat.icon + '</div>' +
        '<div class="gallery-card-label">' + cat.label + '</div>' +
        '<div class="gallery-card-count">' + cat.image_count + ' photo' + (cat.image_count !== 1 ? 's' : '') + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

async function openGalleryCategory(slug, el) {
  currentCategory = slug;
  const body = galleryBody();
  if (!body) return;
  body.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);padding:20px 0;text-align:center;"><span style="color:var(--green)">⟳</span> Loading photos...</div>';
  try {
    const resp = await fetch(GALLERY_API + '/' + slug, {headers: NGROK_HEADERS});
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const images = await resp.json();
    const cat = {slug: slug, label: slug, icon: '📁'};
    renderPolaroids(images, cat);
  } catch(err) {
    body.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:#f87171;">✗ Could not load photos.<br>Failed to fetch</div>';
  }
}

async function renderPolaroids(images, cat) {
  const body = galleryBody();
  if (!body) return;
  galleryTitle().textContent = 'gallery — ' + cat.icon + ' ' + cat.label;
  const backBtn = '<div style="margin-bottom:16px;"><span onclick="backToGalleryGrid()" class="gallery-back-btn">← all categories</span></div>';
  if (images.length === 0) {
    body.innerHTML = backBtn + '<div class="gallery-empty">No photos yet.</div>';
    return;
  }
  const rots = [-2.5, 1.8, -1.2, 2.8, -0.8, 2.1, -2.2, 1.5];
  body.innerHTML = backBtn + '<div class="polaroid-grid">' +
    images.map(function(img, i) {
      var rot = rots[i % rots.length];
      return '<div class="polaroid" style="--rot:' + rot + 'deg" id="polaroid-' + i + '" onclick="openLightbox(\'' + GALLERY_API + '/image/' + currentCategory + '/' + img.filename + '\',\'' + img.caption.replace(/'/g, "\\'") + '\')">' +
        '<div class="polaroid-img-wrap">' +
          '<img id="img-' + i + '" src="" style="width:100%;height:100%;object-fit:cover;" alt="' + img.caption + '" onerror="this.parentElement.innerHTML=\'<div class=polaroid-broken>🖼️</div>\'" />' +
        '</div>' +
        '<div class="polaroid-caption">' + img.caption + '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  // Load images as blobs to bypass ngrok CORS
  images.forEach(async function(img, i) {
    var src = GALLERY_API + '/image/' + currentCategory + '/' + img.filename;
    var blobUrl = await loadImageAsBlob(src);
    var el = document.getElementById('img-' + i);
    if (el && blobUrl) el.src = blobUrl;
  });
}

function backToGalleryGrid() {
  currentCategory = null;
  loadGalleryCategories();
}

function openLightbox(src, caption) {
  document.getElementById('gallery-lightbox') && document.getElementById('gallery-lightbox').remove();
  var lb = document.createElement('div');
  lb.id = 'gallery-lightbox';
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;';
  lb.onclick = function() { lb.remove(); };
  lb.innerHTML = '<img src="" style="max-width:90vw;max-height:80vh;border-radius:4px;box-shadow:0 8px 40px rgba(0,0,0,0.8);" id="lb-img" />' +
    '<div style="color:rgba(255,255,255,0.6);font-family:var(--font-mono);font-size:12px;margin-top:12px;">' + caption + '</div>' +
    '<span onclick="event.stopPropagation();document.getElementById(\'gallery-lightbox\').remove()" style="position:absolute;top:20px;right:24px;color:#fff;font-size:24px;cursor:pointer;opacity:0.7;">×</span>';
  document.body.appendChild(lb);
  loadImageAsBlob(src).then(function(blobUrl) {
    var el = document.getElementById('lb-img');
    if (el) el.src = blobUrl;
  });
}

const _origOpenWindowGallery = window.openWindow;
window.openWindow = function(name) {
  _origOpenWindowGallery(name);
  if (name === 'gallery') loadGalleryCategories();
};

window.openGalleryCategory = openGalleryCategory;
window.backToGalleryGrid   = backToGalleryGrid;
window.openLightbox        = openLightbox;
