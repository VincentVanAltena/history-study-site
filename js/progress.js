// progress.js — depends on utils.js being loaded first

function renderPerQuestionChart(stats) {
  const canvas = document.getElementById("perQuestionChart");
  if (!canvas) return;

  const labels  = Object.keys(stats);

  if (!labels.length) {
    showEmptyState("perQuestionEmpty");
    canvas.style.display = "none";
    return;
  }

  const correct = labels.map(q => stats[q].correct);
  const wrong   = labels.map(q => stats[q].wrong);

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Goed", data: correct, backgroundColor: "rgba(75, 192, 192, 0.6)" },
        { label: "Fout", data: wrong,   backgroundColor: "rgba(255, 99, 132, 0.6)" }
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

  if (!history.length) {
    showEmptyState("overTimeEmpty");
    canvas.style.display = "none";
    return;
  }

  const labels  = history.map(h => h.date);
  const correct = history.map(h => h.correct);
  const wrong   = history.map(h => h.wrong);

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Goed", data: correct, borderColor: "green", fill: false },
        { label: "Fout", data: wrong,   borderColor: "red",   fill: false }
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

// Start
const stats   = loadStats();
const history = loadHistory();

renderPerQuestionChart(stats);
renderOverTimeChart(history);
