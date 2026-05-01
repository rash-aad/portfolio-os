/* ═══════════════════════════════════════════════════════
   PORTFOLIO OS — timeline.js
   Rashaad's full timeline data + render logic
═══════════════════════════════════════════════════════ */

const TIMELINE_DATA = [
  {
    type: 'education',
    year: 'SEP 2022 – JUN 2026',
    title: 'B.Tech — Artificial Intelligence & Machine Learning',
    sub: 'A.I.E.T · Mangaluru, Karnataka',
    bullets: [
      'Pursuing full-time undergraduate degree in AI/ML',
      'Core coursework: Deep Learning, NLP, Computer Vision, Algorithms',
      'Active research interest in LLMs, RAG systems, and edge AI',
    ]
  },
  {
    type: 'publication',
    year: 'JUL 2025',
    title: 'Fine-Tuning Techniques for LLMs: A Comprehensive Survey',
    sub: 'IEEE CONECCT · 11th International Conference on Electronics, Computing and Communication Technologies',
    bullets: [
      'Comprehensive survey of fine-tuning approaches for large language models',
      'Covers PEFT, LoRA, instruction tuning, RLHF and more',
    ]
  },
  {
    type: 'project',
    year: 'AUG 2025',
    title: 'Multi-Agent Lead Intelligence Pipeline',
    sub: 'Python · Gemini API · Pandas · Microservices',
    bullets: [
      'Extracted 3–5 verified contacts per company, improving lead coverage by 40%',
      'Architected Python agents for company research, contact discovery, LLM-driven message generation',
      'Engineered domain-prioritized search algorithm → 35% better retrieval accuracy',
      'Handled noisy Excel inputs with robust Pandas preprocessing pipeline',
    ]
  },
  {
    type: 'project',
    year: 'NOV 2025',
    title: 'Context-Aware AI Bot (Edge RAG on Raspberry Pi)',
    sub: 'Raspberry Pi · RAG · Whisper · TTS · Quantized LLM',
    bullets: [
      'Sub-800ms response latency for edge-based voice interactions',
      'RAG pipeline with persistent memory — 25% better relevance, 90% recall accuracy',
      'Integrated STT + TTS for natural real-time voice interactions',
      'Quantization & pruning → 60% model size reduction on <2GB RAM hardware',
      'Supported 1,000+ conversational interactions per session',
    ]
  },
  {
    type: 'publication',
    year: 'DEC 2025',
    title: 'Enhanced Comparative Study of Summarization Methods for Legal Assistants',
    sub: 'ISCCSC · 2nd International Conference on Smart Computing and Communication for Sustainable Convergence',
    bullets: [
      'Benchmarked extractive vs abstractive summarization for legal document use cases',
      'Evaluated models including BART, T5, and LexRank on Indian legal corpora',
    ]
  },
  {
    type: 'work',
    year: 'DEC 2025 – MAR 2026',
    title: 'Machine Learning Engineer',
    sub: 'Startup (Freelance) · Bangalore, Karnataka',
    bullets: [
      'Designed & trained ML models for web vulnerability classification → 30% triage efficiency gain',
      'Engineered microservice architecture for real-time multi-agent scanning → 65% faster than sequential',
      'Fine-tuned LLMs on security datasets → 18% accuracy improvement, 30% fewer false positives',
      'Generated structured pentest reports with ML-based risk scoring & remediation recommendations',
      'Built end-to-end ML pipeline containerized with Docker for consistent deployments',
    ]
  },
];

/* ── RENDER TIMELINE ─────────────────────────────────── */
function renderTimeline(filter = 'all') {
  const container = document.getElementById('timeline-items');
  if (!container) return;
  container.innerHTML = '';

  const filtered = filter === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(item => item.type === filter);

  // reverse so newest first
  [...filtered].reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `
      <div class="timeline-dot ${item.type}"></div>
      <div class="timeline-year ${item.type}">${item.year}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-sub">${item.sub}</div>
      ${item.bullets.length ? `<ul class="timeline-bullets">${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
    `;
    container.appendChild(div);
  });
}

/* ── FILTER BUTTONS ─────────────────────────────────── */
document.querySelectorAll('.tl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTimeline(btn.dataset.filter);
  });
});

/* init */
document.addEventListener('DOMContentLoaded', () => renderTimeline('all'));
