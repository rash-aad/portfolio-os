/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — os.js
   Window management, taskbar, clock, context menu, toast
═══════════════════════════════════════════════════════ */

/* ── CLOCK ──────────────────────────────────────────── */
function updateClock() {
  const now   = new Date();
  let h       = now.getHours();
  const m     = String(now.getMinutes()).padStart(2, '0');
  const ampm  = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('dt-time').textContent = `${h}:${m} ${ampm}`;
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('dt-date').textContent =
    `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── WINDOW MANAGEMENT ──────────────────────────────── */
let zBase = 200;
const ALL_WINDOWS = ['terminal','resume','blog','gallery','projects','timeline'];

function openWindow(name) {
  const el = document.getElementById('win-' + name);
  if (!el) return;
  if (el.classList.contains('visible')) { bringToFront(el); return; }
  const vw = window.innerWidth, vh = window.innerHeight;
  const ww = el.offsetWidth || 580, wh = el.offsetHeight || 440;
  const jitter = (Math.random() - 0.5) * 60;
  el.style.left = Math.max(100, (vw - ww) / 2 + jitter) + 'px';
  el.style.top  = Math.max(60,  (vh - wh) / 2 + jitter - 20) + 'px';
  el.classList.add('visible');
  bringToFront(el);
  updatePills();
}

function closeWindow(name) {
  const el = document.getElementById('win-' + name);
  if (el) { el.classList.remove('visible'); updatePills(); }
}

function minimizeWindow(name) { closeWindow(name); }

function bringToFront(el) { zBase++; el.style.zIndex = zBase; }

function updatePills() {
  ALL_WINDOWS.forEach(name => {
    const pill = document.getElementById('pill-' + name);
    const win  = document.getElementById('win-' + name);
    if (!pill || !win) return;
    pill.classList.toggle('active', win.classList.contains('visible'));
  });
}

/* ── DRAG WINDOWS ───────────────────────────────────── */
document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.win-titlebar');
  if (!bar) return;
  let dragging = false, ox = 0, oy = 0;
  bar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('win-ctrl')) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    bringToFront(win); e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    let nx = e.clientX - ox, ny = e.clientY - oy;
    nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - win.offsetHeight - 48));
    win.style.left = nx + 'px'; win.style.top = ny + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
  win.addEventListener('mousedown', () => bringToFront(win));
});

/* ── DRAG STICKY NOTE ───────────────────────────────── */
(function() {
  const note = document.getElementById('sticky-note');
  if (!note) return;
  let dragging = false, ox = 0, oy = 0;
  note.addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - note.offsetLeft;
    oy = e.clientY - note.offsetTop;
    note.style.cursor = 'grabbing';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    note.style.left = (e.clientX - ox) + 'px';
    note.style.top  = (e.clientY - oy) + 'px';
    note.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => {
    dragging = false; note.style.cursor = 'grab';
  });
})();

/* ── CONTEXT MENU ───────────────────────────────────── */
const ctxMenu = document.getElementById('context-menu');
document.getElementById('desktop').addEventListener('contextmenu', e => {
  if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.closest('.icon-item')) return;
  e.preventDefault();
  const x = Math.min(e.clientX, window.innerWidth  - 200);
  const y = Math.min(e.clientY, window.innerHeight - 220);
  ctxMenu.style.left = x + 'px'; ctxMenu.style.top = y + 'px';
  ctxMenu.classList.add('visible');
});
document.addEventListener('click', () => ctxMenu.classList.remove('visible'));

/* ── WALLPAPER SWITCHER ─────────────────────────────── */
function cycleWallpaper() {
  const next = WALLPAPER.getCurrent() === 'stars' ? 'binary' : 'stars';
  WALLPAPER.setWallpaper(next);
  showToast(next === 'stars' ? '✨ Stars wallpaper' : '🖥️ Binary rain wallpaper');
  const btn = document.getElementById('wp-btn');
  if (btn) btn.textContent = next === 'stars' ? '🌌 Wallpaper' : '💻 Wallpaper';
}

/* ── TOAST ──────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── INIT ───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  WALLPAPER.init();
});
