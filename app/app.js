// Platinum Road — the trophy tracker.
// Static, offline: loads data/trophies.json from its own files, saves
// progress in localStorage, exports and imports it as JSON.
const SAVE_KEY = "platinum-road-progress-v1";
const DEMO_EARNED = [2, 3, 5, 8, 15, 18, 20, 21, 33, 35, 42, 46, 53];

const KIND_LABELS = {
  story: "Story",
  side: "Side quests",
  collectible: "Collectibles",
  activity: "Activities",
  misc: "Odd jobs",
};

const STAGES = [
  { n: 1, title: "Play the story", note: "Main missions in order. Chapters 1–4, the mission trophies, and the finale — the backbone of the run. Clear the missables before the final mission." },
  { n: 2, title: "Side stories & strangers", note: "The character strands (Andy, Kenton, Billy, Randy, Tyrone) and 8 stranger strands, plus Bret's hunt. Finish each strand's final mission." },
  { n: 3, title: "Activities & skills", note: "Stunts, shooting range, races, fishing, arcade, bowling, meditation-free challenges and the combat and robbery feats. The biggest stage — work it while the story is done." },
  { n: 4, title: "Collectibles & the world", note: "Meditation spots, card sets, WAiNK locations, vehicles, all 52 areas, garages and Scooter Bros registrations. A road trip with the map open." },
  { n: 5, title: "Odd jobs & cleanup", note: "The one-off moments and the slow totals — the missables, the choices, the money. Do the missables here at the latest." },
  { n: 6, title: "Platinum", note: "100% Completion, then the platinum pops on its own. Nothing extra to do." },
];

let trophies = [];
let earned = new Set();
let spoiler = false;
let demoMode = false;
let filter = { kind: "all", query: "" };

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.earned)) earned = new Set(parsed.earned);
      spoiler = !!parsed.spoiler;
    }
  } catch {
    earned = new Set();
  }
  const params = new URLSearchParams(location.search);
  if (params.get("demo") === "1" && earned.size === 0) {
    earned = new Set(DEMO_EARNED);
    demoMode = true;
    saveProgress();
  }
}

function saveProgress() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ earned: [...earned], spoiler })
  );
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  demoMode = false;
  saveProgress();
  render();
}

function gradeTag(grade) {
  return `<span class="tag ${grade}">${grade}</span>`;
}

function medalDot(grade) {
  return `<span class="medal ${grade}" title="${grade}"></span>`;
}

function hiddenBySpoiler(t) {
  return spoiler && t.kind === "story" && !earned.has(t.id);
}

function updateProgress() {
  const count = earned.size;
  document.getElementById("earned-count").textContent = count;
  document.getElementById("progress-fill").style.width =
    ((count / trophies.length) * 100).toFixed(1) + "%";
  document.getElementById("progress-label").textContent =
    `${Math.round((count / trophies.length) * 100)}% to the platinum`;
  const byGrade = {};
  for (const t of trophies) {
    if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  }
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] || 0) + 1;
  document.getElementById("progress-grades").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${byGrade[g] || 0}/${totals[g]} ${g}`)
    .join(" · ");
}

function trophyRow(t) {
  const isEarned = earned.has(t.id);
  const hidden = hiddenBySpoiler(t);
  const name = hidden ? "Hidden story trophy" : t.name;
  const desc = hidden
    ? "Earn this trophy to reveal its name and description."
    : t.description;
  const count = t.count ? ` · target ${t.count.toLocaleString()}` : "";
  return `<li class="trophy-row${isEarned ? " earned" : ""}" data-id="${t.id}">
    <input type="checkbox" ${isEarned ? "checked" : ""} aria-label="Earned: ${name}">
    <span class="medal ${t.grade}" title="${t.grade}"></span>
    <div>
      <div class="trophy-name">${name}</div>
      <div class="trophy-desc">${desc}${count}</div>
      <div class="trophy-meta">${gradeTag(t.grade)}
        <span class="tag">${KIND_LABELS[t.kind]}</span>
        ${t.missable ? '<span class="tag missable">Missable</span>' : ""}
        <span class="tag">#${t.id}</span>
      </div>
    </div>
  </li>`;
}

function renderChecklist() {
  const view = document.getElementById("view");
  const q = filter.query.trim().toLowerCase();
  const list = trophies.filter((t) => {
    if (filter.kind === "earned") return earned.has(t.id);
    if (filter.kind === "unearned") return !earned.has(t.id);
    if (filter.kind === "missable") return t.missable;
    if (filter.kind !== "all" && t.kind !== filter.kind) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const chips = ["all", "story", "missable", "collectible", "activity", "side", "earned", "unearned"];
  const chipLabel = { all: "All 55", story: "Story", missable: "Missable", collectible: "Collectibles", activity: "Activities", side: "Side quests", earned: "Earned", unearned: "Not earned" };
  view.innerHTML = `
    <h2>Checklist</h2>
    <p class="lede">All 55 official trophies. Tick them off as you earn them — your progress saves in this browser. Click a trophy to read its guide.</p>
    ${demoMode ? `<div class="demo-banner">Demo progress loaded — 13 of 55 earned, so you can see the tracker at work. Tick any box to start your own progress.<button class="btn" id="clear-demo">Clear demo</button></div>` : ""}
    <div class="toolbar">
      <input type="search" id="search" placeholder="Search trophies…" value="${filter.query.replace(/"/g, "&quot;")}" aria-label="Search trophies">
      ${chips.map((c) => `<button class="chip${filter.kind === c ? " active" : ""}" data-kind="${c}">${chipLabel[c]}</button>`).join("")}
      <span class="spacer"></span>
      <label class="toggle"><input type="checkbox" id="spoiler" ${spoiler ? "checked" : ""}> Spoiler-free</label>
      <button class="btn" id="export-btn">Export</button>
      <button class="btn" id="import-btn">Import</button>
      <input type="file" id="import-file" accept="application/json" hidden>
    </div>
    <ul class="trophy-list">${list.map(trophyRow).join("") || `<li class="empty">No trophies match this filter.</li>`}</ul>`;
  wireChecklist(view);
}

function wireChecklist(view) {
  const search = view.querySelector("#search");
  search.addEventListener("input", () => {
    filter.query = search.value;
    const pos = search.selectionStart;
    renderChecklist();
    const next = document.getElementById("search");
    next.focus();
    next.setSelectionRange(pos, pos);
  });
  view.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filter.kind = chip.dataset.kind;
      renderChecklist();
    });
  });
  view.querySelector("#spoiler").addEventListener("change", (e) => {
    spoiler = e.target.checked;
    saveProgress();
    render();
  });
  view.querySelector("#export-btn").addEventListener("click", exportProgress);
  view.querySelector("#import-btn").addEventListener("click", () => {
    view.querySelector("#import-file").click();
  });
  view.querySelector("#import-file").addEventListener("change", importProgress);
  const clearDemo = view.querySelector("#clear-demo");
  if (clearDemo) {
    clearDemo.addEventListener("click", () => {
      earned = new Set();
      demoMode = false;
      saveProgress();
      render();
    });
  }
  view.querySelectorAll(".trophy-row").forEach((row) => {
    const id = Number(row.dataset.id);
    row.querySelector("input[type=checkbox]").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEarned(id);
    });
    row.addEventListener("click", () => {
      location.hash = `#/trophy/${id}`;
    });
  });
}

function exportProgress() {
  const blob = new Blob(
    [JSON.stringify({ game: "Grand Theft Auto VI", earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "platinum-road-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (Array.isArray(parsed.earned)) {
        earned = new Set(parsed.earned.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
        demoMode = false;
        saveProgress();
        render();
      }
    } catch {
      alert("That file is not a Platinum Road export.");
    }
  };
  reader.readAsText(file);
}

function renderRoadmap() {
  const view = document.getElementById("view");
  view.innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p class="lede">Six stages, in order, built from the official descriptions. Do the missables before the final mission — they are the only trophies that can close off.</p>
    ${STAGES.map((s) => {
      const items = trophies.filter((t) => t.stage === s.n);
      const done = items.filter((t) => earned.has(t.id)).length;
      return `<section class="stage">
        <h3>Stage ${s.n} — ${s.title}</h3>
        <p>${s.note}</p>
        <p class="stage-count">${done} / ${items.length} earned</p>
        <ol>${items.map((t) => `<li class="${earned.has(t.id) ? "done" : ""}"><a href="#/trophy/${t.id}">${t.name}</a> ${gradeTag(t.grade)}${t.missable ? ' <span class="tag missable">Missable</span>' : ""}</li>`).join("")}</ol>
      </section>`;
    }).join("")}`;
}

function renderMissables() {
  const view = document.getElementById("view");
  const missables = trophies.filter((t) => t.missable);
  view.innerHTML = `
    <h2>Missable trophies</h2>
    <p class="lede">Four trophies can be missed — each is tied to a moment that does not come back. Do them when the moment arrives, and keep a manual save from before the story beats that carry them.</p>
    ${missables.map((t) => `<article class="missable-card">
      <h3><a href="#/trophy/${t.id}">${t.name}</a> ${gradeTag(t.grade)}</h3>
      <p><em>${t.description}</em></p>
      <p>${t.guide}</p>
    </article>`).join("")}
    <p class="lede">The other 51 trophies can be earned any time — after the story, in free roam, or on a second playthrough.</p>`;
}

function renderDetail(id) {
  const view = document.getElementById("view");
  const t = trophies.find((x) => x.id === id);
  if (!t) {
    location.hash = "#/";
    return;
  }
  const isEarned = earned.has(t.id);
  const prev = trophies.find((x) => x.id === id - 1);
  const next = trophies.find((x) => x.id === id + 1);
  view.innerHTML = `
    <article class="detail">
      <p><a href="#/">&larr; Back to the checklist</a></p>
      <h2>${t.name}</h2>
      <p class="official">&ldquo;${t.description}&rdquo; — official description</p>
      <div class="trophy-meta">${gradeTag(t.grade)}
        <span class="tag">${KIND_LABELS[t.kind]}</span>
        ${t.missable ? '<span class="tag missable">Missable</span>' : ""}
        ${t.count ? `<span class="tag">Target: ${t.count.toLocaleString()}</span>` : ""}
        <span class="tag">Roadmap stage ${t.stage}</span>
      </div>
      ${t.missable ? `<div class="warn"><strong>Missable.</strong> This trophy is tied to a moment that does not come back. Do it when the moment arrives, and keep a manual save from before the story beat that carries it.</div>` : ""}
      <h3>Guide</h3>
      <p>${t.guide}</p>
      <p class="sources">${t.source}</p>
      <p><button class="btn primary" id="toggle-earned">${isEarned ? "Mark as not earned" : "Mark as earned"}</button></p>
      <nav class="detail-nav">
        <span>${prev ? `<a href="#/trophy/${prev.id}">&larr; ${prev.name}</a>` : ""}</span>
        <span>${next ? `<a href="#/trophy/${next.id}">${next.name} &rarr;</a>` : ""}</span>
      </nav>
    </article>`;
  view.querySelector("#toggle-earned").addEventListener("click", () => toggleEarned(id));
}

function render() {
  // Keep the reader where they were: a checkbox toggle re-renders the
  // whole checklist, and without this the page jumps back to the top.
  const scrollY = window.scrollY;
  updateProgress();
  document.querySelectorAll(".tabs a").forEach((a) => {
    a.classList.toggle("active", location.hash.startsWith("#/" + a.dataset.view) || (a.dataset.view === "checklist" && (location.hash === "" || location.hash === "#/")));
  });
  const hash = location.hash || "#/";
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)$/);
  if (trophyMatch) renderDetail(Number(trophyMatch[1]));
  else if (hash === "#/roadmap") renderRoadmap();
  else if (hash === "#/missables") renderMissables();
  else renderChecklist();
  window.scrollTo(0, scrollY);
}

async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  trophies = data.trophies;
  loadSave();
  window.addEventListener("hashchange", render);
  // Press / anywhere to jump to the search box.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
      const search = document.getElementById("search");
      if (search) {
        e.preventDefault();
        search.focus();
      }
    }
  });
  render();
}

boot();
