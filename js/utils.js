// Shared localStorage helpers — used by adaptive_quiz.js, flashcard.js,
// causal.js, chains.js, progress.js and dataSource.js

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem("quizStats") || "{}");
  } catch (e) {
    return {};
  }
}

function saveStats(stats) {
  localStorage.setItem("quizStats", JSON.stringify(stats));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("quizHistory") || "[]");
  } catch (e) {
    return [];
  }
}

function logHistory(correct) {
  const history = loadHistory();
  const today = new Date().toISOString().slice(0, 10);
  let entry = history.find(h => h.date === today);

  if (!entry) {
    entry = { date: today, correct: 0, wrong: 0 };
    history.push(entry);
  }

  if (correct) entry.correct++;
  else entry.wrong++;

  localStorage.setItem("quizHistory", JSON.stringify(history));
}

// ====== Eigen onderwerp uploaden (custom facts.json) ===========================
// Hiermee kan elke pagina dezelfde feiten-bron gebruiken: eigen geüploade data
// als die er is, anders het standaard facts.json-bestand.

const CUSTOM_FACTS_KEY = "customFactsData";
const CUSTOM_FACTS_NAME_KEY = "customFactsName";
const FACTS_DEFAULT_CANDIDATES = ["../data/facts.json", "/data/facts.json"];

function loadFactsData() {
  try {
    const stored = localStorage.getItem(CUSTOM_FACTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return Promise.resolve(parsed);
      }
    }
  } catch (e) {
    console.warn("Eigen feiten-bestand kon niet gelezen worden, val terug op standaard.", e);
  }

  // Probeer de standaardbestanden, na elkaar, tot er één lukt.
  return FACTS_DEFAULT_CANDIDATES.reduce(
    (chain, path) =>
      chain.catch(() =>
        fetch(path).then(r => {
          if (!r.ok) throw new Error("Niet gevonden: " + path);
          return r.json();
        })
      ),
    Promise.reject()
  );
}

function setCustomFactsData(json, name) {
  localStorage.setItem(CUSTOM_FACTS_KEY, JSON.stringify(json));
  if (name) localStorage.setItem(CUSTOM_FACTS_NAME_KEY, name);
}

function clearCustomFactsData() {
  localStorage.removeItem(CUSTOM_FACTS_KEY);
  localStorage.removeItem(CUSTOM_FACTS_NAME_KEY);
}

function hasCustomFactsData() {
  return !!localStorage.getItem(CUSTOM_FACTS_KEY);
}

function getCustomFactsName() {
  return localStorage.getItem(CUSTOM_FACTS_NAME_KEY) || null;
}

// Controleert een geüpload bestand. Retourneert null bij succes, anders een
// leesbare foutmelding om aan de gebruiker te tonen.
function validateFactsJson(json) {
  if (!Array.isArray(json) || json.length === 0) {
    return "Het bestand moet een niet-lege lijst (JSON array) zijn.";
  }
  for (let i = 0; i < json.length; i++) {
    const item = json[i];
    if (typeof item !== "object" || item === null) {
      return `Item ${i + 1} is geen geldig object.`;
    }
    if (typeof item.question !== "string" || typeof item.answer !== "string") {
      return `Item ${i + 1} mist een 'question' en/of 'answer' veld (tekst).`;
    }
  }
  return null;
}