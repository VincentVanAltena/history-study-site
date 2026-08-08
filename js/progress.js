// progress.js — depends on utils.js being loaded first

let perQuestionChartInstance = null;
let overTimeChartInstance    = null;
let connectionsChartInstance = null;

function renderPerQuestionChart(stats) {
  const canvas = document.getElementById("perQuestionChart");
  if (!canvas) return;

  if (perQuestionChartInstance) {
    perQuestionChartInstance.destroy();
    perQuestionChartInstance = null;
  }

  const labels = Object.keys(stats);

  if (!labels.length) {
    showEmptyState("perQuestionEmpty");
    canvas.style.display = "none";
    return;
  }

  hideEmptyState("perQuestionEmpty");
  canvas.style.display = "block";

  const correct = labels.map(q => stats[q].correct);
  const wrong   = labels.map(q => stats[q].wrong);

  perQuestionChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Correct", data: correct, backgroundColor: "rgba(75, 192, 192, 0.6)" },
        { label: "Wrong", data: wrong,   backgroundColor: "rgba(255, 99, 132, 0.6)" }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { beginAtZero: true } }
    }
  });
}

function renderOverTimeChart(history) {
  const canvas = document.getElementById("overTimeChart");
  if (!canvas) return;

  if (overTimeChartInstance) {
    overTimeChartInstance.destroy();
    overTimeChartInstance = null;
  }

  if (!history.length) {
    showEmptyState("overTimeEmpty");
    canvas.style.display = "none";
    return;
  }

  hideEmptyState("overTimeEmpty");
  canvas.style.display = "block";

  const labels  = history.map(h => h.date);
  const correct = history.map(h => h.correct);
  const wrong   = history.map(h => h.wrong);

  overTimeChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Correct", data: correct, borderColor: "green", fill: false },
        { label: "Wrong", data: wrong,   borderColor: "red",   fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ── Connections (causal.js) — eigen localStorage-sleutel, los van utils.js ──
function loadCausalHistory() {
  try { return JSON.parse(localStorage.getItem("causal_history") || "[]"); }
  catch (e) { return []; }
}

function renderConnectionsChart(history) {
  const canvas = document.getElementById("connectionsChart");
  if (!canvas) return;

  if (connectionsChartInstance) {
    connectionsChartInstance.destroy();
    connectionsChartInstance = null;
  }

  if (!history.length) {
    showEmptyState("connectionsEmpty");
    canvas.style.display = "none";
    return;
  }

  hideEmptyState("connectionsEmpty");
  canvas.style.display = "block";

  const sorted  = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const labels  = sorted.map(h => h.date);
  const correct = sorted.map(h => h.correct);
  const wrong   = sorted.map(h => h.wrong);

  connectionsChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Correct", data: correct, borderColor: "green", fill: false },
        { label: "Wrong", data: wrong,   borderColor: "red",   fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function showEmptyState(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function hideEmptyState(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function renderAll() {
  renderPerQuestionChart(loadStats());
  renderOverTimeChart(loadHistory());
  renderConnectionsChart(loadCausalHistory());
}

// ── Gegevensbeheer: wissen / opslaan naar bestand / laden uit bestand ───────
const PROGRESS_KEYS = ["quizStats", "quizHistory", "causal_stats", "causal_history"];

function showStatus(msg, isError) {
  const el = document.getElementById("progressStatus");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#c00" : "#166534";
}

function purgeProgress() {
  if (!confirm("Weet je zeker dat je alle voortgang wilt wissen? Dit kan niet ongedaan worden gemaakt.")) return;
  PROGRESS_KEYS.forEach(k => localStorage.removeItem(k));
  renderAll();
  showStatus("Voortgang gewist.");
}

function saveProgressToFile() {
  const data = { _exportedAt: new Date().toISOString() };
  PROGRESS_KEYS.forEach(k => {
    const raw = localStorage.getItem(k);
    if (raw !== null) {
      try { data[k] = JSON.parse(raw); } catch (e) { data[k] = raw; }
    }
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `voortgang-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showStatus("Voortgang opgeslagen naar bestand.");
}

function loadProgressFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      let restored = 0;
      PROGRESS_KEYS.forEach(k => {
        if (parsed[k] !== undefined) {
          localStorage.setItem(k, JSON.stringify(parsed[k]));
          restored++;
        }
      });
      if (!restored) {
        showStatus("Geen herkenbare voortgangsgegevens gevonden in dit bestand.", true);
        return;
      }
      renderAll();
      showStatus(`Voortgang geladen (${restored} dataset(s) herstelt).`);
    } catch (e) {
      showStatus("Kon bestand niet lezen: ongeldig JSON-formaat.", true);
    }
  };
  reader.readAsText(file);
}

const purgeBtn  = document.getElementById("purgeProgressBtn");
const saveBtn   = document.getElementById("saveProgressBtn");
const loadInput = document.getElementById("loadProgressInput");

if (purgeBtn) purgeBtn.addEventListener("click", purgeProgress);
if (saveBtn)  saveBtn.addEventListener("click", saveProgressToFile);
if (loadInput) {
  loadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) loadProgressFromFile(file);
    loadInput.value = "";
  });
}

// Start
renderAll();