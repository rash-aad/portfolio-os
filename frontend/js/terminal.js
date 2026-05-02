/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — terminal.js
   Terminal logic + RAG via local Ollama backend
═══════════════════════════════════════════════════════ */

const termInput  = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');

/* ── STATIC COMMANDS ────────────────────────────────── */
const commands = {
  help: () => [
    { type: 'info',     text: '╔══ Available Commands ══════════════════╗' },
    { type: 'response', text: '  whoami      → about me' },
    { type: 'response', text: '  skills      → my tech stack' },
    { type: 'response', text: '  projects    → what I\'ve built' },
    { type: 'response', text: '  education   → academic background' },
    { type: 'response', text: '  experience  → work history' },
    { type: 'response', text: '  publications → my papers' },
    { type: 'response', text: '  contact     → get in touch' },
    { type: 'response', text: '  open <name> → open a window' },
    { type: 'response', text: '               (resume | blog | gallery |' },
    { type: 'response', text: '                projects | timeline)' },
    { type: 'response', text: '  ask <query> → ask my RAG assistant' },
    { type: 'response', text: '  clear       → clear terminal' },
    { type: 'info',     text: '╚════════════════════════════════════════╝' },
    { type: 'rag',      text: '💡 Tip: Just type any question and I\'ll answer using RAG!' },
  ],

  whoami: () => [
    { type: 'info',     text: '── Rashaad N Mohammed ──────────────────' },
    { type: 'response', text: '  ML Engineer & AI Researcher' },
    { type: 'response', text: '  Bangalore / Mangaluru, India' },
    { type: 'response', text: '  B.Tech AI & ML @ A.I.E.T (2022–2026)' },
    { type: 'response', text: '' },
    { type: 'response', text: '  Building intelligent systems at the' },
    { type: 'response', text: '  intersection of LLMs, RAG & edge AI.' },
    { type: 'response', text: '  Currently open to full-time roles.' },
  ],

  skills: () => [
    { type: 'info',     text: '── Tech Stack ─────────────────────────' },
    { type: 'response', text: '  Languages  →  Python (primary), C, Shell' },
    { type: 'response', text: '  ML / AI    →  TensorFlow, Scikit-learn' },
    { type: 'response', text: '              →  OpenCV, HF Transformers' },
    { type: 'response', text: '  LLMs / NLP →  Fine-tuning, RAG, Prompt Eng.' },
    { type: 'response', text: '  Databases  →  MongoDB, SQL, Pinecone' },
    { type: 'response', text: '  Infra      →  Docker, Git, Linux' },
    { type: 'response', text: '              →  AWS (EC2, S3, Lambda)' },
    { type: 'response', text: '  Design     →  Microservice Architectures' },
  ],

  education: () => [
    { type: 'info',     text: '── Education ───────────────────────────' },
    { type: 'response', text: '  B.Tech — AI & Machine Learning' },
    { type: 'response', text: '  A.I.E.T, Mangaluru  (Sep 2022 – Jun 2026)' },
  ],

  experience: () => [
    { type: 'info',     text: '── Experience ──────────────────────────' },
    { type: 'response', text: '  Machine Learning Engineer' },
    { type: 'response', text: '  Startup (Freelance) · Dec 2025 – Mar 2026' },
    { type: 'response', text: '  Bangalore, Karnataka' },
    { type: 'response', text: '' },
    { type: 'response', text: '  • ML models for web vulnerability classification' },
    { type: 'response', text: '  • Microservice architecture for multi-agent system' },
    { type: 'response', text: '  • Fine-tuned LLMs → 18% accuracy improvement' },
    { type: 'response', text: '  • Reduced scan time by 65% vs sequential' },
  ],

  publications: () => [
    { type: 'info',     text: '── Publications ────────────────────────' },
    { type: 'response', text: '  [1] Enhanced Comparative Study of Summarization' },
    { type: 'response', text: '      Methods for Legal Assistants.' },
    { type: 'response', text: '      ISCCSC — Dec 2025' },
    { type: 'response', text: '' },
    { type: 'response', text: '  [2] Fine-Tuning Techniques for Large Language' },
    { type: 'response', text: '      Models: A Comprehensive Survey.' },
    { type: 'response', text: '      IEEE CONECCT — Jul 2025' },
  ],

  contact: () => [
    { type: 'info',     text: '── Contact ─────────────────────────────' },
    { type: 'response', text: '  Email    →  rashaadnmohammed@gmail.com' },
    { type: 'response', text: '  Phone    →  +91 7411369136' },
    { type: 'response', text: '  GitHub   →  github.com/rash-aad' },
    { type: 'response', text: '  LinkedIn →  linkedin.com/in/rashaadn' },
    { type: 'response', text: '  Location →  Bangalore / Mangaluru, India' },
  ],

  clear: () => { termOutput.innerHTML = ''; return []; },

  projects: () => { openWindow('projects'); return [{ type: 'info', text: 'Opening projects...' }]; },
  resume:   () => { openWindow('resume');   return [{ type: 'info', text: 'Opening resume...' }]; },
  timeline: () => { openWindow('timeline'); return [{ type: 'info', text: 'Opening timeline...' }]; },
  blog:     () => { openWindow('blog');     return [{ type: 'info', text: 'Opening blog...' }]; },
  gallery:  () => { openWindow('gallery');  return [{ type: 'info', text: 'Opening gallery...' }]; },
};

/* ── RAG QUERY via Ollama backend ───────────────────── */
async function queryRAG(question) {
  appendTermLine('thinking', '⟳ Consulting RAG assistant...');
  try {
    const resp = await fetch('https://suites-crop-kits-breath.trycloudflare.com/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    // Remove the "thinking" line
    const lines = termOutput.querySelectorAll('.term-line.thinking');
    lines.forEach(l => l.remove());
    appendTermLine('rag', '🤖 RAG Assistant:');
    // Split answer into lines for readability
    const answer = data.answer || data.response || 'No answer returned.';
    answer.split('\n').forEach(line => {
      if (line.trim()) appendTermLine('rag', '   ' + line);
    });
    if (data.sources && data.sources.length) {
      appendTermLine('info', `   [sources: ${data.sources.join(', ')}]`);
    }
  } catch (err) {
    const lines = termOutput.querySelectorAll('.term-line.thinking');
    lines.forEach(l => l.remove());
    appendTermLine('error', '✗ RAG backend not reachable. Start the backend first:');
    appendTermLine('error', '  cd backend && uvicorn main:app --reload');
    appendTermLine('info',  '  (or check README.md for setup instructions)');
  }
}

/* ── COMMAND HANDLER ────────────────────────────────── */
async function handleCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  const parts = trimmed.split(' ');
  const cmd   = parts[0].toLowerCase();
  const rest  = parts.slice(1).join(' ');

  appendTermLine('prompt', trimmed);

  // open <window>
  if (cmd === 'open' && rest) {
    const allowed = ['terminal','resume','blog','gallery','projects','timeline'];
    if (allowed.includes(rest.toLowerCase())) {
      openWindow(rest.toLowerCase());
      appendTermLine('info', `Opening ${rest}...`);
    } else {
      appendTermLine('error', `Unknown window: "${rest}". Try: ${allowed.join(', ')}`);
    }
    return;
  }

  // ask <question> — explicit RAG
  if (cmd === 'ask' && rest) {
    await queryRAG(rest);
    return;
  }

  // static commands
  if (commands[cmd]) {
    const lines = commands[cmd]();
    lines.forEach(l => appendTermLine(l.type, l.text));
    return;
  }

  // Treat unknown input as a RAG question
  await queryRAG(trimmed);
}

/* ── APPEND LINE ────────────────────────────────────── */
function appendTermLine(type, text) {
  const div = document.createElement('div');
  div.className = 'term-line ' + type;
  div.textContent = text;
  termOutput.appendChild(div);
  termOutput.scrollTop = termOutput.scrollHeight;
}

/* ── INPUT LISTENER ─────────────────────────────────── */
const history = [];
let histIdx = -1;

termInput.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const val = termInput.value;
    if (val.trim()) { history.unshift(val); histIdx = -1; }
    termInput.value = '';
    termInput.disabled = true;
    await handleCommand(val);
    termInput.disabled = false;
    termInput.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) { histIdx++; termInput.value = history[histIdx]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; termInput.value = history[histIdx]; }
    else { histIdx = -1; termInput.value = ''; }
  }
});

/* Focus terminal input when window clicked */
document.getElementById('win-terminal')?.addEventListener('click', () => termInput.focus());
