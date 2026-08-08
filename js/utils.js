// utils.js — gedeelde helpers voor quiz, flashcards, tijdlijn, woordenlijst

// ── Quiz statistieken ─────────────────────────────────────────────────────────

function loadStats() {
  try { return JSON.parse(localStorage.getItem("quizStats") || "{}"); }
  catch (e) { return {}; }
}

function saveStats(stats) {
  localStorage.setItem("quizStats", JSON.stringify(stats));
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("quizHistory") || "[]"); }
  catch (e) { return []; }
}

function logHistory(correct) {
  const history = loadHistory();
  const today = new Date().toISOString().slice(0, 10);
  let entry = history.find(h => h.date === today);
  if (!entry) { entry = { date: today, correct: 0, wrong: 0 }; history.push(entry); }
  if (correct) entry.correct++; else entry.wrong++;
  localStorage.setItem("quizHistory", JSON.stringify(history));
}

// ── Sleutelconstanten ─────────────────────────────────────────────────────────

const DATA_TYPES = {
  facts:    { key: "customFactsData",    nameKey: "customFactsName",    defaults: ["../data/facts.json",    "/data/facts.json"]    },
  timeline: { key: "customTimelineData", nameKey: "customTimelineName", defaults: ["../data/timeline.json", "/data/timeline.json"] },
  glossary: { key: "customGlossaryData", nameKey: "customGlossaryName", defaults: ["../data/glossary.json", "/data/glossary.json"] },
};

// ── Generieke opslag-helpers ──────────────────────────────────────────────────

function _setCustomData(type, json, name) {
  const cfg = DATA_TYPES[type];
  localStorage.setItem(cfg.key, JSON.stringify(json));
  if (name) localStorage.setItem(cfg.nameKey, name);
}

function _clearCustomData(type) {
  const cfg = DATA_TYPES[type];
  localStorage.removeItem(cfg.key);
  localStorage.removeItem(cfg.nameKey);
}

function _hasCustomData(type) {
  return !!localStorage.getItem(DATA_TYPES[type].key);
}

function _getCustomName(type) {
  return localStorage.getItem(DATA_TYPES[type].nameKey) || null;
}

function _loadData(type) {
  const cfg = DATA_TYPES[type];
  try {
    const stored = localStorage.getItem(cfg.key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // facts is een array; timeline ook; glossary is { glossary: [...] }
      if (parsed && (Array.isArray(parsed) ? parsed.length : true)) {
        return Promise.resolve(parsed);
      }
    }
  } catch (e) {
    console.warn(`Eigen ${type}-bestand kon niet gelezen worden, val terug op standaard.`, e);
  }

  return cfg.defaults.reduce(
    (chain, path) => chain.catch(() =>
      fetch(path).then(r => {
        if (!r.ok) throw new Error("Niet gevonden: " + path);
        return r.json();
      })
    ),
    Promise.reject()
  );
}

// ── Publieke API ──────────────────────────────────────────────────────────────

// Facts
function loadFactsData()            { return _loadData("facts"); }
function setCustomFactsData(j, n)   { _setCustomData("facts", j, n); }
function clearCustomFactsData()     { _clearCustomData("facts"); }
function hasCustomFactsData()       { return _hasCustomData("facts"); }
function getCustomFactsName()       { return _getCustomName("facts"); }

// Timeline
function loadTimelineData()              { return _loadData("timeline"); }
function setCustomTimelineData(j, n)     { _setCustomData("timeline", j, n); }
function clearCustomTimelineData()       { _clearCustomData("timeline"); }
function hasCustomTimelineData()         { return _hasCustomData("timeline"); }
function getCustomTimelineName()         { return _getCustomName("timeline"); }

// Glossary
function loadGlossaryData()              { return _loadData("glossary"); }
function setCustomGlossaryData(j, n)     { _setCustomData("glossary", j, n); }
function clearCustomGlossaryData()       { _clearCustomData("glossary"); }
function hasCustomGlossaryData()         { return _hasCustomData("glossary"); }
function getCustomGlossaryName()         { return _getCustomName("glossary"); }

// ── Validatie ─────────────────────────────────────────────────────────────────

function validateFactsJson(json) {
  if (!Array.isArray(json) || json.length === 0)
    return "Het bestand moet een niet-lege lijst (JSON array) zijn.";
  for (let i = 0; i < json.length; i++) {
    const item = json[i];
    if (typeof item !== "object" || item === null)
      return `Item ${i + 1} is geen geldig object.`;
    if (typeof item.question !== "string" || typeof item.answer !== "string")
      return `Item ${i + 1} mist een 'question' en/of 'answer' veld (tekst).`;
  }
  return null;
}

function validateTimelineJson(json) {
  const arr = Array.isArray(json) ? json : null;
  if (!arr || arr.length === 0)
    return "Het bestand moet een niet-lege lijst (JSON array) zijn.";
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item.title || item.start == null)
      return `Item ${i + 1} mist een 'title' of 'start' veld.`;
  }
  return null;
}

function validateGlossaryJson(json) {
  const arr = Array.isArray(json) ? json : (json && Array.isArray(json.glossary) ? json.glossary : null);
  if (!arr || arr.length === 0)
    return "Het bestand moet een lijst zijn of een object met 'glossary' array.";
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item.term !== "string" || typeof item.definition !== "string")
      return `Item ${i + 1} mist een 'term' of 'definition' veld.`;
  }
  return null;
}
