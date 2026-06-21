// Shared localStorage helpers — used by adaptive_quiz.js and progress.js

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
