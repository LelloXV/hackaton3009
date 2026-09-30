import './style.css';
import { sources, questions, criteria, score } from './data.js';

const icons = {
  passport: '<rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6M9 10h6M12 7v6"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  send: '<path d="m12 19 0-14m-6 6 6-6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  warning: '<path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4v.1"/>',
  users: '<circle cx="10" cy="8" r="3"/><path d="M4 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 2 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-12 5h.1m5 0h.1"/>',
  building: '<path d="M6 21V3h12v18M3 21h18M9 7h.1m5 0h.1M9 11h.1m5 0h.1M9 15h.1m5 0h.1M10 21v-3h4v3"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let busy = false;
let generated = false;
let activeTab = 'Overview';
let activeRefs = [];
let runId = 0;
const app = document.querySelector('#app');
app.innerHTML = `
  <header class="topbar"><a class="brand" href="./" aria-label="Passport home"><span class="brand-mark">${icon('passport')}</span>passport<span class="brand-dot">.</span></a><div class="top-center">A little clarity goes a long way.</div><div class="demo-tag"><span></span> Interactive demo</div></header>
  <main><div class="page-heading"><div><div class="eyebrow">SCATTERED KNOWLEDGE. ONE CLEAR PICTURE.</div><h1>Your next answer comes with a passport.</h1><p>Ask a question. Connect the sources. Know what you can trust.</p></div><div class="heading-note">${icon('layers')}<span>4 demo sources<br><strong>One connected workspace</strong></span></div></div>
  <div class="workspace">
    <aside class="chat-panel"><div class="panel-heading"><div class="heading-icon">${icon('chat')}</div><div><h2>Ask your knowledge</h2><p>Your project copilot</p></div><button class="text-button" id="reset" title="Start a new conversation">Reset</button></div>
      <div id="chat-messages" class="messages" aria-live="polite"><div class="assistant-intro"><span class="bot-avatar">${icon('spark')}</span><div><strong>Let’s connect the dots.</strong><p>I can bring together project documents, discussions and updates into one clear passport.</p><p class="muted">Try a question about Global Payroll Harmonisation.</p></div></div></div>
      <div class="suggestions-heading">${icon('spark')} TRY A QUESTION <span>10 options</span></div><div class="suggestions" id="suggestions">${questions.map((q, i) => `<button class="question" data-question="${i}"><span>${q.label}</span>${icon('chevron')}</button>`).join('')}</div>
      <form class="composer" id="chat-form"><label class="sr-only" for="question-input">Ask a project question</label><input id="question-input" placeholder="Ask about your project…" autocomplete="off" maxlength="500"/><button class="send-button" type="submit" aria-label="Send question">${icon('send')}</button></form><div class="chat-footnote">Fictional data · No external AI connection</div>
    </aside>
    <section class="passport-area" id="passport-area" aria-label="Project passport"><div class="empty-state"><div class="empty-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="floating-source source-sp">SP</span><span class="floating-source source-teams">T</span><span class="floating-source source-excel">X</span><div class="mini-passport">${icon('passport')}<span>KNOWLEDGE PASSPORT</span><div></div><div></div><div></div><span class="mini-stamp">${icon('check')} Connected</span></div></div><div class="eyebrow">FROM QUESTION TO CLARITY</div><h2>Meet your project’s passport.</h2><p>A living snapshot of what’s known, who owns it,<br class="desktop-break"/> and what still needs a second look.</p><div class="empty-steps"><span><b>01</b> Ask a question</span>${icon('arrow')}<span><b>02</b> Connect sources</span>${icon('arrow')}<span><b>03</b> Get clarity</span></div><button class="primary-button" data-question="0">Try your first question ${icon('arrow')}</button><div class="empty-caption">Built from documents. Grounded in context.</div></div></section>
  </div><footer><span>${icon('passport')} A passport for every piece of knowledge.</span><span>Concept demo · Fictional project and people</span></footer></main>
  <dialog id="source-dialog"><div id="dialog-content"></div></dialog>`;

function sourceList() {
  return `<div class="source-list">${sources.map(s => `<button class="source-row ${activeRefs.includes(s.id) ? 'cited' : ''}" data-source="${s.id}"><span class="source-logo ${s.color}">${s.short}</span><span class="source-text"><strong>${s.name}</strong><small>${s.type} · ${s.date}</small></span><span class="source-ref">[${s.id}]</span>${icon('chevron')}</button>`).join('')}</div>`;
}
function renderPassport() {
  const area = document.querySelector('#passport-area');
  area.innerHTML = `<div class="passport"><div class="passport-toolbar"><span class="passport-id">${icon('passport')} PASSPORT / GP-0241</span><button id="export" class="export-button">${icon('download')} <span>Export</span></button></div><div class="passport-header"><div class="project-label"><span></span> PROJECT KNOWLEDGE</div><h2>Global Payroll<br class="title-break"/> Harmonisation</h2><p>Harmonising payroll processes across countries to improve efficiency, compliance and data quality.</p><div class="project-chips"><span class="status-pill">${icon('check')} On track</span><span class="neutral-pill">Version 1.2</span><span class="neutral-pill">4 sources connected</span></div></div><div class="tabs" role="tablist" aria-label="Passport views">${['Overview','Sources','Activity'].map(tab => `<button role="tab" aria-selected="${activeTab === tab}" class="tab ${activeTab === tab ? 'active' : ''}" data-tab="${tab}">${tab}${tab === 'Sources' ? '<span>4</span>' : ''}</button>`).join('')}</div><div class="passport-body">${activeTab === 'Overview' ? overview() : activeTab === 'Sources' ? `<div class="section-heading"><h3>Connected sources</h3><span>4 resources</span></div><p class="section-description">The documents and discussions behind this passport. Select one to read its demo content.</p>${sourceList()}<div class="source-disclaimer">${icon('info')} All resources are fictional and available locally in this demo.</div>` : activity()}</div><div class="passport-bottom"><span><span class="live-dot"></span> Consolidated from 4 demo sources</span><span>As of 30 Sep 2026</span></div></div>`;
}
function overview() {
  return `<div class="overview-grid"><div class="project-details"><div class="section-heading"><h3>The essentials</h3><span>Project context</span></div>${[
    ['building','Department','Pay · Payroll Operations',''],
    ['users','Owner (unit)','Transformation Office','Accountable for accuracy and updates'],
    ['calendar','Last updated','12 Sep 2026','By Jane De Smet'],
    ['globe','Applies to','BE, NL, FR, DE, ES +10','15 of 17 countries documented'],
  ].map(([i,label,value,sub])=>`<div class="detail-row">${icon(i)}<div><small>${label}</small><strong>${value}</strong>${sub ? `<p>${sub}</p>` : ''}</div></div>`).join('')}</div><div class="confidence-card"><div class="confidence-title">Confidence score<button class="info-button" id="score-info" aria-label="How confidence is calculated">${icon('info')}</button></div><div class="score">${score}<span>%</span></div><div class="score-track"><div style="width:${score}%"></div></div><span class="confidence-caption">Useful, with a few loose ends</span><div class="confidence-note">${icon('warning')} Some details need confirmation</div></div></div><div class="section-heading criteria-heading"><h3>What to consider</h3><span>7 confidence checks</span></div><div class="criteria-table-wrap"><table><thead><tr><th>Criteria</th><th>Status</th><th>Details</th></tr></thead><tbody>${criteria.map(c=>`<tr><td>${c.name}</td><td><span class="table-status ${c.status.toLowerCase()}"><span>${c.status === 'OK' ? '✓' : c.status === 'Conflict' || c.status === 'Missing' ? '×' : '!'}</span>${c.status}</span></td><td>${c.detail}</td></tr>`).join('')}</tbody></table></div><div class="insight-note">${icon('warning')}<div><strong>A little follow-up will go a long way.</strong><p>Confirm the go-live date: the project plan says <button data-source="1">1 Nov [1]</button>, while Teams proposes <button data-source="2">15 Nov [2]</button>. Ask the owner to complete the scope and review the passport.</p></div></div><div class="section-heading sources-heading"><h3>${icon('layers')} Key sources</h3><button class="text-button" data-tab="Sources">View all 4 ${icon('arrow')}</button></div>${sourceList()}`;
}
function activity() {
  return `<div class="section-heading"><h3>Project activity</h3><span>Source timeline</span></div><div class="timeline">${[
    ['15 Sep 2026','A different go-live date proposed','The Teams discussion proposes 15 November. This conflicts with the approved plan.',2],
    ['12 Sep 2026','Project status updated','Jane De Smet records the project as on track in the change log.',4],
    ['01 Sep 2026','Project plan published','Version 1.4 sets a target go-live of 1 November 2026.',1],
    ['20 Aug 2026','Country scope documented','The scope matrix covers 15 of 17 countries; Norway and Finland remain pending.',3],
  ].map(([date,title,desc,id])=>`<div class="timeline-item"><span class="timeline-dot"></span><small>${date}</small><h4>${title}</h4><p>${desc}</p><button class="text-button" data-source="${id}">Read source [${id}] ${icon('arrow')}</button></div>`).join('')}</div>`;
}
const messages = document.querySelector('#chat-messages');
function scrollChat() { messages.scrollTop = messages.scrollHeight; }
function setBusy(value) {
  busy = value;
  document.querySelectorAll('[data-question], .send-button').forEach(b => b.disabled = value);
  document.querySelector('#question-input').disabled = value;
}
async function ask(index, custom) {
  if (busy) return;
  const q = questions[index];
  const question = custom || q.label;
  const token = ++runId;
  messages.insertAdjacentHTML('beforeend', `<div class="user-message">${escape(question)}</div>`);
  if (!q) {
    messages.insertAdjacentHTML('beforeend', `<div class="assistant-response"><span class="bot-avatar">${icon('spark')}</span><div><p>This demo knows 10 questions about Global Payroll Harmonisation. Try a suggested question below, or ask about ownership, dates, scope, sources or confidence.</p></div></div>`);
    scrollChat();
    return;
  }
  setBusy(true);
  messages.insertAdjacentHTML('beforeend', `<div class="assistant-response loading-message"><span class="bot-avatar">${icon('spark')}</span><div><p class="loading-copy">Connecting your sources<span class="loading-dots">…</span></p><span class="loading-meta">SharePoint · Teams · Excel · Confluence</span></div></div>`);
  scrollChat();
  await new Promise(resolve => setTimeout(resolve, 1100));
  if (token !== runId) return;
  messages.querySelector('.loading-message')?.remove();
  activeRefs = q.refs;
  generated = true;
  activeTab = 'Overview';
  messages.insertAdjacentHTML('beforeend', `<div class="assistant-response"><span class="bot-avatar">${icon('spark')}</span><div><p>${q.answer}</p><div class="response-citations">${q.refs.map(id=>`<button data-source="${id}">[${id}] ${sources.find(s=>s.id===id).type}</button>`).join('')}</div><div class="passport-created">${icon('check')} Project passport ${document.querySelector('.passport') ? 'updated' : 'created'}</div></div></div>`);
  renderPassport();
  setBusy(false);
  scrollChat();
}
function openDialog(html) {
  document.querySelector('#dialog-content').innerHTML = `<button class="dialog-close" aria-label="Close dialog">${icon('close')}</button>${html}`;
  document.querySelector('#source-dialog').showModal();
}
app.addEventListener('click', event => {
  const question = event.target.closest('[data-question]');
  if (question) ask(Number(question.dataset.question));
  const tab = event.target.closest('[data-tab]');
  if (tab && generated) { activeTab = tab.dataset.tab; renderPassport(); }
  const source = event.target.closest('[data-source]');
  if (source) {
    const s = sources.find(item => item.id === Number(source.dataset.source));
    openDialog(`<span class="modal-eyebrow">DEMO SOURCE [${s.id}]</span><div class="modal-source-logo source-logo ${s.color}">${s.short}</div><h2>${s.name}</h2><p class="modal-meta">${s.type} · ${s.date}</p><div class="source-content">${s.content}</div><p class="modal-footnote">Fictional resource · Included in this passport’s consolidation</p>`);
  }
  if (event.target.closest('#score-info')) openDialog(`<span class="modal-eyebrow">TRANSPARENT BY DESIGN</span><h2>How is confidence calculated?</h2><p class="modal-meta">Seven weighted checks, totalling 100 points. This demo uses fixed, illustrative assessments.</p><div class="score-breakdown">${criteria.map(c=>`<div><span>${c.name}</span><strong>${c.points} / ${c.max}</strong></div>`).join('')}<div class="score-total"><span>Total confidence</span><strong>${score} / 100</strong></div></div><p class="modal-footnote">The score describes the completeness and consistency of the sources. It is not a probability that an answer is correct.</p>`);
  if (event.target.closest('.dialog-close')) document.querySelector('#source-dialog').close();
  if (event.target.closest('#export')) {
    const blob = new Blob([JSON.stringify({ demo: true, title: 'Global Payroll Harmonisation', version: '1.2', status: 'On track', department: 'Pay · Payroll Operations', owner: 'Transformation Office', updatedAt: '2026-09-12', asOf: '2026-09-30', confidence: score, criteria, sources }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'global-payroll-demo-passport.json'; a.click(); URL.revokeObjectURL(url);
  }
  if (event.target.closest('#reset')) {
    runId++;
    setBusy(false);
    messages.innerHTML = `<div class="assistant-intro"><span class="bot-avatar">${icon('spark')}</span><div><strong>A fresh conversation.</strong><p>Choose one of the 10 questions below to create or update your project passport.</p></div></div>`;
    document.querySelector('#question-input').value = '';
  }
});
document.querySelector('#chat-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#question-input');
  const value = input.value.trim();
  if (!value || busy) return;
  input.value = '';
  const normalized = value.toLowerCase();
  let index = questions.findIndex(q=>q.label.toLowerCase() === normalized);
  if (index < 0) {
    // Prefer specific phrases over generic words such as "who" or "date".
    const matches = questions.map((q, i) => ({ i, score: q.keywords.reduce((total, word) => total + (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized) ? word.length : 0), 0) }));
    matches.sort((a,b)=>b.score-a.score);
    index = matches[0].score > 0 ? matches[0].i : -1;
  }
  ask(index, value);
});
document.querySelector('#source-dialog').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
