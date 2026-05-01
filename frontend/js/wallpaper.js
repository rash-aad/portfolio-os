/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — wallpaper.js
   Star field + Binary rain wallpapers
═══════════════════════════════════════════════════════ */

window.WALLPAPER = (() => {
  let current = 'stars';
  let starRAF, binaryRAF;

  /* ── STAR CANVAS ─────────────────────────────────── */
  const starCanvas = document.getElementById('star-canvas');
  const starCtx = starCanvas.getContext('2d');
  let W, H, stars = [];

  function resizeStars() {
    W = starCanvas.width  = window.innerWidth;
    H = starCanvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const n = Math.floor((W * H) / 2000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.3 + 0.15,
        alpha: Math.random() * 0.6 + 0.25,
        twOff: Math.random() * Math.PI * 2,
        twSpd: Math.random() * 0.01 + 0.003,
        drift: (Math.random() - 0.5) * 0.012,
        rise:  Math.random() * 0.06 + 0.01
      });
    }
  }

  let starFrame = 0;
  function drawStars() {
    starFrame++;
    starCtx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const tw = Math.sin(starFrame * s.twSpd + s.twOff);
      const a  = Math.max(0, s.alpha + tw * 0.15);
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(255,255,255,${a})`;
      starCtx.fill();
      s.y -= s.rise; s.x += s.drift;
      if (s.y < 0) { s.y = H; s.x = Math.random() * W; }
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
    }
    starRAF = requestAnimationFrame(drawStars);
  }

  /* ── BINARY CANVAS ───────────────────────────────── */
  const binCanvas = document.getElementById('binary-canvas');
  const binCtx = binCanvas.getContext('2d');
  const COLS_BIN = [];
  const FONT_SIZE = 14;

  function resizeBinary() {
    binCanvas.width  = window.innerWidth;
    binCanvas.height = window.innerHeight;
    const cols = Math.floor(binCanvas.width / FONT_SIZE);
    COLS_BIN.length = 0;
    for (let i = 0; i < cols; i++) COLS_BIN.push(Math.random() * binCanvas.height / FONT_SIZE | 0);
  }

  function drawBinary() {
    binCtx.fillStyle = 'rgba(5, 5, 16, 0.07)';
    binCtx.fillRect(0, 0, binCanvas.width, binCanvas.height);
    binCtx.font = FONT_SIZE + 'px "JetBrains Mono", monospace';
    for (let i = 0; i < COLS_BIN.length; i++) {
      const bit   = Math.random() > 0.5 ? '1' : '0';
      const x     = i * FONT_SIZE;
      const y     = COLS_BIN[i] * FONT_SIZE;
      const alpha = Math.random() * 0.5 + 0.1;
      binCtx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      binCtx.fillText(bit, x, y);
      if (y > binCanvas.height && Math.random() > 0.975) {
        COLS_BIN[i] = 0;
      } else {
        COLS_BIN[i]++;
      }
    }
    binaryRAF = requestAnimationFrame(drawBinary);
  }

  /* ── PUBLIC API ──────────────────────────────────── */
  function setWallpaper(name) {
    if (name === current) return;
    current = name;
    if (name === 'stars') {
      cancelAnimationFrame(binaryRAF);
      binCanvas.style.display = 'none';
      starCanvas.style.display = 'block';
      resizeStars();
      drawStars();
    } else if (name === 'binary') {
      cancelAnimationFrame(starRAF);
      starCanvas.style.display = 'none';
      binCanvas.style.display = 'block';
      resizeBinary();
      drawBinary();
    }
  }

  function init() {
    resizeStars();
    drawStars();
    resizeBinary();
    window.addEventListener('resize', () => {
      if (current === 'stars')  resizeStars();
      if (current === 'binary') resizeBinary();
    });
  }

  return { init, setWallpaper, getCurrent: () => current };
})();
