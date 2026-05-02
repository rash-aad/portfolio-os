/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — blog.js
   Fetches blog posts from backend /blogs API
   Renders list view + in-window post reader
═══════════════════════════════════════════════════════ */

const BLOG_API = 'https://deeper-lying-comp-cruise.trycloudflare.com/blogs';

// ── State ────────────────────────────────────────────────
let allPosts   = [];
let viewingPost = null;

// ── DOM refs ─────────────────────────────────────────────
const blogBody    = () => document.getElementById('blog-body');
const blogTitle   = () => document.querySelector('#win-blog .win-title');

// ── Fetch post list ──────────────────────────────────────
async function loadBlogList() {
  const body = blogBody();
  if (!body) return;

  body.innerHTML = `<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);padding:20px 0;text-align:center;">
    <span style="color:var(--green)">⟳</span> Loading posts...
  </div>`;

  try {
    const resp = await fetch(BLOG_API + '/');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    allPosts = await resp.json();
    renderBlogList(allPosts);
  } catch (err) {
    body.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:12px;color:#f87171;padding:12px 0;">
        ✗ Could not load blog posts.<br>
        <span style="color:var(--text-dim)">Make sure the backend is running:<br>
        <span style="color:var(--green)">cd backend && uvicorn main:app --reload</span></span>
      </div>`;
  }
}

// ── Render list ──────────────────────────────────────────
function renderBlogList(posts) {
  const body = blogBody();
  if (!body) return;
  blogTitle().textContent = `blog — ${posts.length} post${posts.length !== 1 ? 's' : ''}`;

  if (posts.length === 0) {
    body.innerHTML = `<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);padding:20px 0;">
      No posts yet. Drop a .md file in <span style="color:var(--green)">public/blogs/</span>
    </div>`;
    return;
  }

  body.innerHTML = posts.map(p => `
    <div class="blog-post" data-slug="${p.slug}" onclick="openBlogPost('${p.slug}')">
      <div class="blog-date">${formatDate(p.date)}</div>
      <div class="blog-title">${escHtml(p.title)}</div>
      <div class="blog-excerpt">${escHtml(p.excerpt)}</div>
      <div style="margin-top:6px;">
        ${(p.tags || []).map(t => `<span class="blog-tag">${escHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ── Open a post ──────────────────────────────────────────
async function openBlogPost(slug) {
  const body = blogBody();
  if (!body) return;

  body.innerHTML = `<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);padding:20px 0;text-align:center;">
    <span style="color:var(--green)">⟳</span> Loading post...
  </div>`;

  try {
    const resp = await fetch(`${BLOG_API}/${slug}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const post = await resp.json();
    viewingPost = post;
    renderPost(post);
  } catch (err) {
    body.innerHTML = `<div style="font-family:var(--font-mono);font-size:12px;color:#f87171;">
      ✗ Could not load post.<br><span style="color:var(--text-dim)">${err.message}</span>
    </div>`;
  }
}

// ── Render full post ─────────────────────────────────────
function renderPost(post) {
  const body = blogBody();
  if (!body) return;
  blogTitle().textContent = `blog — ${post.title}`;

  const html = markdownToHtml(post.content);

  body.innerHTML = `
    <!-- Back button -->
    <div style="margin-bottom:16px;">
      <span onclick="backToBlogList()" style="
        font-family:var(--font-mono);font-size:11px;
        color:var(--blue);cursor:pointer;
        border:1px solid rgba(96,165,250,0.2);
        padding:4px 12px;border-radius:4px;
        transition:background 0.15s;
      " onmouseover="this.style.background='rgba(96,165,250,0.1)'"
         onmouseout="this.style.background='transparent'">
        ← back to posts
      </span>
    </div>

    <!-- Post header -->
    <div style="margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <div style="font-family:var(--font-mono);font-size:10px;color:rgba(251,191,36,0.6);letter-spacing:0.1em;margin-bottom:6px;">
        ${formatDate(post.date)}
      </div>
      <div style="font-family:var(--font-display);font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;line-height:1.3;">
        ${escHtml(post.title)}
      </div>
      <div>
        ${(post.tags || []).map(t => `<span class="blog-tag">${escHtml(t)}</span>`).join('')}
      </div>
    </div>

    <!-- Post body -->
    <div class="blog-markdown-body">
      ${html}
    </div>
  `;
}

// ── Back to list ─────────────────────────────────────────
function backToBlogList() {
  viewingPost = null;
  blogTitle().textContent = `blog — ${allPosts.length} posts`;
  renderBlogList(allPosts);
}

// ── Minimal markdown → HTML ──────────────────────────────
function markdownToHtml(md) {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs — blank line separation
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap loose <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>)+/gs, match => `<ul>${match}</ul>`);

  return `<p>${html}</p>`;
}

// ── Utils ────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  } catch { return dateStr; }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Auto-load when blog window opens ────────────────────
// Hook into the existing openWindow function
const _origOpenWindow = window.openWindow;
window.openWindow = function(name) {
  _origOpenWindow(name);
  if (name === 'blog') {
    // Reload list if not currently viewing a post
    if (!viewingPost) loadBlogList();
  }
};

// Expose globals needed by inline HTML handlers
window.openBlogPost   = openBlogPost;
window.backToBlogList = backToBlogList;
