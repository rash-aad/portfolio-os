/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — app.js
   Projects, blog, gallery content  (Rashaad's real data)
═══════════════════════════════════════════════════════ */

/* ── No dynamic loading needed — content in HTML ─────
   This file is for any shared utilities or data that
   multiple windows might reference.
═══════════════════════════════════════════════════════ */

// Data constants used by windows
const RASHAAD = {
  name:     'Rashaad N Mohammed',
  role:     'ML ENGINEER · AI RESEARCHER',
  email:    'rashaadnmohammed@gmail.com',
  phone:    '+91 7411369136',
  github:   'github.com/rash-aad',
  linkedin: 'linkedin.com/in/rashaadn',
  location: 'Bangalore / Mangaluru, India',
};

// Expose globally
window.RASHAAD = RASHAAD;
