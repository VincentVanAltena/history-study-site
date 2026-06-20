function loadStats() {
  return JSON.parse(localStorage.getItem("quizStats") || "{}");
}

function loadHistory() {
  return JSON.parse(localStorage.getItem("quizHistory") || "[]");
}

// -----------------------------
// 1. Per vraag grafiek
// -----------------------------
function renderPerQuestionChart(stats) {
  const labels = Object.keys(stats);
  const correct = labels.map(q => stats[q].correct);
  const wrong = labels.map(q => stats[q].wrong);

  new Chart(document.getElementById("perQuestionChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Goed",
          data: correct,
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        },
        {
          label: "Fout",
          data: wrong,
          backgroundColor: "rgba(255, 99, 132, 0.6)"
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}

// -----------------------------
// 2. Over tijd grafiek
// -----------------------------
function renderOverTimeChart(history) {
  const labels = history.map(h => h.date);
  const correct = history.map(h => h.correct);
  const wrong = history.map(h => h.wrong);

  new Chart(document.getElementById("overTimeChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Goed",
          data: correct,
          borderColor: "green",
          fill: false
        },
        {
          label: "Fout",
          data: wrong,
          borderColor: "red",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// -----------------------------
// Start
// -----------------------------
const stats = loadStats();
const history = loadHistory();

renderPerQuestionChart(stats);
renderOverTimeChart(history);
