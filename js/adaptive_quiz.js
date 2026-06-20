let QUIZ_DATA = [];
let currentQuestion = null;

// Stats opslaan in localStorage
function loadStats() {
  return JSON.parse(localStorage.getItem("quizStats") || "{}");
}

function saveStats(stats) {
  localStorage.setItem("quizStats", JSON.stringify(stats));
}

// Gewicht berekenen
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
    for (let i = 0; i < w; i++) {
      weighted.push(q);
    }
  });

  return weighted;
}

// Nieuwe vraag kiezen
function pickQuestion() {
  const weighted = buildWeightedList();
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// UI elementen
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const feedbackEl = document.getElementById("feedback");

// Quiz starten
document.getElementById("startQuiz").onclick = () => {
  document.getElementById("quizContainer").style.display = "block";
  startQuiz();
};

function startQuiz() {
  fetch("../data/facts.json")
    .then(r => r.json())
    .then(json => {
      QUIZ_DATA = json;
      nextQuestion();
    });
}

function nextQuestion() {
  currentQuestion = pickQuestion();
  questionEl.textContent = currentQuestion.question;
  answerInput.value = "";
  feedbackEl.textContent = "";

  // Tijdlijn koppelen
  if (currentQuestion.timelineId) {
    window.focusTimeline(currentQuestion.timelineId);
  }

  // Kaart koppelen
  if (currentQuestion.mapLayer || currentQuestion.location) {
    window.focusMap(currentQuestion.mapLayer, currentQuestion.location);
  }

  updateContextPanel(currentQuestion);
}

function updateContextPanel(q) {
  const panel = document.getElementById("contextPanel");
  const content = document.getElementById("contextContent");

  if (!q.context) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";

  content.innerHTML = `
    Oorzaken
    
${q.context.causes.map(c => `- ${c}
`).join("")}

    Gevolgen
    
${q.context.effects.map(e => `- ${e}
`).join("")}

    Thema's
    ${q.context.themes.join(", ")}

    Periode
    ${q.context.period}

  `;
}

// Antwoord controleren
document.getElementById("submitAnswer").onclick = () => {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct = currentQuestion.answer.toLowerCase();

  const stats = loadStats();
  if (!stats[currentQuestion.question]) {
    stats[currentQuestion.question] = { correct: 0, wrong: 0 };
  }

  if (userAnswer === correct) {
    stats[currentQuestion.question].correct++;
    feedbackEl.textContent = "Goed!";
    feedbackEl.style.color = "green";

    saveStats(stats);

    setTimeout(nextQuestion, 700);
  } else {
    stats[currentQuestion.question].wrong++;
    feedbackEl.textContent = `Fout — het juiste antwoord is: ${currentQuestion.answer}`;
    feedbackEl.style.color = "red";

    saveStats(stats);

    setTimeout(nextQuestion, 1500);
  }
  function logHistory(correct) {
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");

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
if (userAnswer === correct) {
  stats[currentQuestion.question].correct++;
  logHistory(true);
} else {
  stats[currentQuestion.question].wrong++;
  logHistory(false);
}

};
