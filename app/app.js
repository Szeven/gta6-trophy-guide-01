// Platinum Road — the tracker for the 55 GTA VI trophies.
// Plain ES module, no build step, no network: it fetches data/trophies.json
// from beside itself and keeps progress in localStorage.

const STORE_KEY = 'platinum-road-progress-v1';
const NOTES_KEY = 'platinum-road-notes-v1';
const THEME_KEY = 'platinum-road-theme';
const SPOILER_KEY = 'platinum-road-spoilers-off';

const listEl = document.getElementById('trophy-list');
const metaEl = document.getElementById('list-meta');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const kindEl = document.getElementById('kind-filter');
const missableEl = document.getElementById('missable-only');
const hideEarnedEl = document.getElementById('hide-earned');
const spoilerEl = document.getElementById('spoiler-toggle');
const themeBtn = document.getElementById('theme-toggle');

const params = new URLSearchParams(location.search);
const seedCount = Math.max(0, Number(params.get('seed') || 0));

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// Roadmap phases, in the order to play them. Each step names trophy ids;
// the platinum itself is the prize at the end, not a step.
const PHASES = [
  {
    name: 'Phase 1 — The story',
    time: '30–40 hours',
    blurb: 'Play the story start to finish. Chapters 1 to 4, then the finale.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    name: 'Phase 2 — Strangers of Leonida',
    time: '6–8 hours',
    blurb: 'Finish the stranger strands. Eight finished strands also pops the silver.',
    ids: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    name: 'Phase 3 — See all of Leonida',
    time: '6–8 hours',
    blurb: 'Explore the state, try every activity, and start the collections.',
    ids: [16, 20, 21, 28, 31, 35, 42, 46],
  },
  {
    name: 'Phase 4 — The partner jobs',
    time: '4–6 hours',
    blurb: 'Robberies and partner jobs. Bring your partner, bring a fast car.',
    ids: [33, 34, 39, 40, 41, 43, 47],
  },
  {
    name: 'Phase 5 — The grind',
    time: '15–20 hours',
    blurb: 'The checklists, the grinds and the money. 100% completion lives here.',
    ids: [14, 15, 17, 18, 19, 30, 32, 36, 37, 38, 44, 45, 48, 49, 50, 51, 52, 53, 54, 55],
  },
];

// ---- state ----

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? '[]')); }
  catch { return new Set(); }
}
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}'); }
  catch { return {}; }
}

const earned = loadSet(STORE_KEY);
const notes = loadNotes();
let spoilersOff = localStorage.getItem(SPOILER_KEY) === '1';

// A ?seed=N query seeds the first N trophies for a demo screenshot. It never
// touches saved progress: it only fills the in-memory set for this page load.
if (seedCount > 0) {
  for (const t of trophies.slice(0, seedCount)) earned.add(t.id);
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// ---- theme ----

function applyTheme() {
  const night = localStorage.getItem(THEME_KEY) === 'night';
  document.body.classList.toggle('night', night);
  themeBtn.textContent = night ? 'Paper' : 'Night';
}
themeBtn.addEventListener('click', () => {
  const night = localStorage.getItem(THEME_KEY) !== 'night';
  localStorage.setItem(THEME_KEY, night ? 'night' : 'paper');
  applyTheme();
});
applyTheme();

// ---- spoiler setting ----

spoilerEl.checked = spoilersOff;
spoilerEl.addEventListener('change', () => {
  spoilersOff = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, spoilersOff ? '1' : '0');
  render();
});
if (params.get('spoilers') === 'on') {
  spoilersOff = false;
  spoilerEl.checked = false;
}

// ---- tabs ----

const tabs = [...document.querySelectorAll('.tab')];
function showView(name) {
  for (const tab of tabs) tab.classList.toggle('active', tab.dataset.view === name);
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${name}`);
  }
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
  if (name === 'nextup') renderNextUp();
}
for (const tab of tabs) tab.addEventListener('click', () => showView(tab.dataset.view));

// ---- helpers ----

function medalLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}
function isHidden(t) {
  return spoilersOff && t.spoiler && !earned.has(t.id);
}
function trophyCard(t, opts = {}) {
  const card = document.createElement('article');
  card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (isHidden(t) ? ' hidden-spoiler' : '');
  card.id = `trophy-${t.id}`;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  head.append(box);

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = t.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = t.description;
  main.append(name, desc);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const medal = document.createElement('span');
  medal.className = `tag medal-${t.grade}`;
  medal.textContent = medalLabel(t);
  tags.append(medal);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = t.category;
  tags.append(kind);
  const diff = document.createElement('span');
  diff.className = 'tag';
  diff.textContent = `Difficulty ${t.difficulty}/5 · ${t.time}`;
  tags.append(diff);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'Missable';
    tags.append(m);
  }
  main.append(tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = opts.open ? 'Hide the guide' : 'Read the guide';
  const guide = document.createElement('div');
  guide.className = 'guide-body';
  guide.hidden = !opts.open;
  const gp = document.createElement('p');
  gp.textContent = t.guide;
  guide.append(gp);
  const gmeta = document.createElement('p');
  gmeta.className = 'guide-meta';
  gmeta.textContent = `Difficulty ${t.difficulty} of 5 · About ${t.time} · ${t.missable ? 'Can be missed — see the guide.' : 'Cannot be missed.'}`;
  guide.append(gmeta);
  const gsrc = document.createElement('p');
  gsrc.className = 'guide-sources';
  gsrc.textContent = `Sources: ${t.sources}`;
  guide.append(gsrc);

  const noteBox = document.createElement('div');
  noteBox.className = 'note-box';
  const noteLabel = document.createElement('label');
  noteLabel.textContent = 'Your note';
  const noteArea = document.createElement('textarea');
  noteArea.value = notes[t.id] ?? '';
  noteArea.placeholder = 'A location, a loadout, a reminder…';
  noteArea.addEventListener('input', () => {
    if (noteArea.value.trim()) notes[t.id] = noteArea.value;
    else delete notes[t.id];
    save();
  });
  noteBox.append(noteLabel, noteArea);
  guide.append(noteBox);

  toggle.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    toggle.textContent = guide.hidden ? 'Read the guide' : 'Hide the guide';
  });
  main.append(toggle, guide);
  head.append(main);
  card.append(head);
  return card;
}

// ---- progress ----

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('earned-count').textContent = done;
  document.getElementById('total-count').textContent = total;
  document.getElementById('earned-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const sub = document.getElementById('progress-sub');
  if (done === total) sub.textContent = 'Platinum earned — Leonida Legend.';
  else if (done === 0) sub.textContent = 'Platinum: 0% — start the story';
  else sub.textContent = `Platinum: ${pct}% — ${total - done} to go`;
  document.getElementById('missables-badge').textContent =
    trophies.filter((t) => t.missable && !earned.has(t.id)).length;
}

// ---- checklist ----

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.category !== kindEl.value) return false;
    if (missableEl.checked && !t.missable) return false;
    if (hideEarnedEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function render() {
  renderProgress();
  const shown = visibleTrophies();
  const openId = Number(params.get('trophy') || 0);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyCard(t, { open: t.id === openId }));
  const done = trophies.filter((t) => earned.has(t.id)).length;
  metaEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${done} earned`;
  if (openId && byId.has(openId)) {
    document.getElementById(`trophy-${openId}`)?.scrollIntoView({ block: 'start' });
  }
}

for (const el of [searchEl, gradeEl, kindEl, missableEl, hideEarnedEl]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}

// Press / anywhere to jump to the search box.
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (e.key === '/' && document.activeElement !== searchEl && tag !== 'TEXTAREA' && tag !== 'INPUT') {
    e.preventDefault();
    searchEl.focus();
  }
});

// URL deep links: ?view=, ?grade=, ?kind= set the controls before first render.
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('kind')) kindEl.value = params.get('kind');

// ---- export / import ----

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned], notes }, null, 2)], { type: 'application/json' }));
  a.download = 'platinum-road-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned ?? [];
    earned.clear();
    for (const id of ids) if (byId.has(Number(id))) earned.add(Number(id));
    if (data.notes) {
      for (const [k, v] of Object.entries(data.notes)) notes[k] = v;
    }
    save();
    render();
  } catch {
    alert('That file is not a Platinum Road progress export.');
  }
});

// ---- roadmap ----

function renderRoadmap() {
  const wrap = document.getElementById('roadmap');
  wrap.replaceChildren();
  for (const phase of PHASES) {
    const done = phase.ids.filter((id) => earned.has(id)).length;
    const div = document.createElement('div');
    div.className = 'phase';
    const h = document.createElement('h3');
    h.textContent = phase.name;
    const meta = document.createElement('div');
    meta.className = 'phase-meta';
    meta.textContent = `${phase.time} · ${done} of ${phase.ids.length} done`;
    const blurb = document.createElement('p');
    blurb.textContent = phase.blurb;
    const prog = document.createElement('div');
    prog.className = 'phase-progress';
    prog.textContent = done === phase.ids.length ? 'Phase complete.' : `${phase.ids.length - done} trophies left in this phase.`;
    const ol = document.createElement('ol');
    for (const id of phase.ids) {
      const t = byId.get(id);
      const li = document.createElement('li');
      if (earned.has(id)) li.className = 'done';
      li.textContent = `${t.name} — ${medalLabel(t)}${t.missable ? ' · Missable' : ''}`;
      ol.append(li);
    }
    div.append(h, meta, blurb, prog, ol);
    wrap.append(div);
  }
}

// ---- missables ----

function renderMissables() {
  const wrap = document.getElementById('missables-list');
  wrap.replaceChildren();
  for (const t of trophies.filter((t) => t.missable)) {
    wrap.append(trophyCard(t, { open: true }));
  }
}

// ---- next up ----

function renderNextUp() {
  const wrap = document.getElementById('nextup-list');
  wrap.replaceChildren();
  const remaining = trophies.filter((t) => t.id !== 1 && !earned.has(t.id));
  // Earliest roadmap phase first, easiest first inside a phase.
  const phaseOf = new Map();
  PHASES.forEach((p, i) => p.ids.forEach((id) => phaseOf.set(id, i)));
  remaining.sort((a, b) => (phaseOf.get(a.id) - phaseOf.get(b.id)) || (a.difficulty - b.difficulty) || (a.id - b.id));
  const picks = remaining.slice(0, 5);
  if (!picks.length) {
    const done = document.createElement('div');
    done.className = 'nextup-item';
    done.textContent = 'Everything is earned. The platinum is yours.';
    wrap.append(done);
    return;
  }
  for (const t of picks) {
    const div = document.createElement('div');
    div.className = 'nextup-item';
    const name = document.createElement('strong');
    name.textContent = `${t.name} — ${medalLabel(t)}`;
    const why = document.createElement('div');
    why.className = 'nextup-why';
    why.textContent = `Phase ${phaseOf.get(t.id) + 1} · Difficulty ${t.difficulty}/5 · About ${t.time}${t.missable ? ' · Missable — do it before moving on.' : ''}`;
    const g = document.createElement('div');
    g.textContent = t.guide;
    div.append(name, why, g);
    wrap.append(div);
  }
}

// ---- first render ----

render();
if (params.get('view')) showView(params.get('view'));
