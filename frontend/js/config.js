/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — config.js
   Single place to set your backend URL.
   Change BACKEND_URL to your Render URL after deploying.
═══════════════════════════════════════════════════════ */

const CONFIG = {
  // LOCAL dev:  http://localhost:8000
  // PRODUCTION: https://portfolio-os-backend.onrender.com  ← change this after deploy
  BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://portfolio-os-backend.onrender.com',   // ← replace with your actual Render URL
};

window.CONFIG = CONFIG;
