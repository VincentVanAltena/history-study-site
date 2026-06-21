// adaptive_quiz.js — depends on utils.js being loaded first

let QUIZ_DATA = [];
let currentQuestion = null;

// Gewicht berekenen: vragen die vaker fout gaan komen vaker terug
function getWeight(q, stats) {
  const s = stats[q.question] || { correct: 0, wrong: 0 };
  let weight = 1 + s.wrong - Math.floor(s.correct / 3);
  return Math.max(1, weight);
}

// Gewogen lijst genereren
function buildWeightedList() {
  const stats = loadStats();
  const weighted = [];
  QUIZ_DATA.forEach(q => {
    const w = getWeight(q, stats);
    for (let i = 0; i < w; i++) weighted.push(q);
  });
  return weighted;
}

// Nieuwe vraag kiezen
function pickQuestion() {
  const weighted = buildWeightedList();
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// UI-elementen
const questionEl   = document.getElementById("question");
const answerInput  = document.getElementById("answerInput");
const feedbackEl   = document.getElementById("feedback");

// Quiz starten
document.getElementById("startQuiz").addEventListener("click", () => {
  document.getElementById("quizContainer").style.display = "block";
  startQuiz();
});

function startQuiz() {
  fetch("../data/facts.json")
    .then(r => r.json())
    .then(json => {
      QUIZ_DATA = json;
      nextQuestion();
    })
    .catch(() => {
      if (questionEl) questionEl.textContent = "Kon vragen niet laden.";
    });
}

function nextQuestion() {
  currentQuestion = pickQuestion();
  questionEl.textContent = currentQuestion.question;
  answerInput.value = "";
  feedbackEl.textContent = "";

  // Tijdlijn koppelen
  if (currentQuestion.timelineId && typeof window.focusTimeline === "function") {
    window.focusTimeline(currentQuestion.timelineId);
  }

  // Kaart koppelen
  if ((currentQuestion.mapLayer || currentQuestion.location) && typeof window.focusMap === "function") {
    window.focusMap(currentQuestion.mapLayer, currentQuestion.location);
  }

  updateContextPanel(currentQuestion);
}

function updateContextPanel(q) {
  const panel   = document.getElementById("contextPanel");
  const content = document.getElementById("contextContent");
  if (!panel || !content) return;

  if (!q.context) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";
  content.innerHTML = `
    <p><strong>Oorzaken:</strong> ${q.context.causes.join(", ")}</p>
    <p><strong>Gevolgen:</strong> ${q.context.effects.join(", ")}</p>
    <p><strong>Thema's:</strong> ${q.context.themes.join(", ")}</p>
    <p><strong>Periode:</strong> ${q.context.period}</p>
  `;
}

// Antwoord controleren
document.getElementById("submitAnswer").addEventListener("click", () => {
  if (!currentQuestion) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct    = currentQuestion.answer.toLowerCase();
  const isCorrect  = userAnswer === correct;

  // Stats bijwerken (één keer)
  const stats = loadStats();
  if (!stats[currentQuestion.question]) {
    stats[currentQuestion.question] = { correct: 0, wrong: 0 };
  }
  if (isCorrect) {
    stats[currentQuestion.question].correct++;
  } else {
    stats[currentQuestion.question].wrong++;
  }
  saveStats(stats);
  logHistory(isCorrect);

  // Feedback tonen
  if (isCorrect) {
    feedbackEl.textContent = "Goed!";
    feedbackEl.style.color = "green";
    setTimeout(nextQuestion, 700);
  } else {
    feedbackEl.textContent = `Fout — het juiste antwoord is: ${currentQuestion.answer}`;
    feedbackEl.style.color = "red";
    setTimeout(nextQuestion, 1500);
  }
});

// Toetsenbord-ondersteuning: Enter indienen
answerInput && answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("submitAnswer").click();
});
