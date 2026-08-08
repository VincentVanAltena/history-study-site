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

// Genereer 4 antwoordopties: 1 goed + 3 willekeurige foute uit QUIZ_DATA
function buildChoices(correct) {
  const others = QUIZ_DATA
    .map(q => q.answer)
    .filter(a => a.toLowerCase() !== correct.toLowerCase());

  // Shuffle en pak 3 willekeurige foute antwoorden
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const distractors = others.slice(0, 3);

  // Voeg het goede antwoord toe en shuffle nogmaals
  const choices = [...distractors, correct];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

// UI-elementen
const questionEl  = document.getElementById("question");
const feedbackEl  = document.getElementById("feedback");

// Quiz starten
const startQuizBtn = document.getElementById("startQuiz");
if (startQuizBtn) {
  startQuizBtn.addEventListener("click", () => {
    document.getElementById("quizContainer").style.display = "block";
    startQuiz();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quizContainer");
  if (quizContainer) quizContainer.style.display = "block";
  if (typeof startQuiz === "function") startQuiz();
});

function startQuiz() {
  loadFactsData()
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
  renderChoices(currentQuestion);
}

function renderChoices(q) {
  // Verwijder eventuele oude knoppen
  const existing = document.getElementById("choicesContainer");
  if (existing) existing.remove();

  const choices = buildChoices(q.answer);

  const container = document.createElement("div");
  container.id = "choicesContainer";
  container.style.cssText = "display:flex; flex-direction:column; gap:8px; margin-top:12px;";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.style.cssText = "text-align:left; padding:10px 14px;";
    btn.addEventListener("click", () => handleAnswer(choice, q.answer, container));
    container.appendChild(btn);
  });

  // Voeg in na de vraag, vóór feedback
  feedbackEl.parentNode.insertBefore(container, feedbackEl);
}

function handleAnswer(chosen, correct, container) {
  // Alle knoppen uitschakelen na een keuze
  container.querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent.toLowerCase() === correct.toLowerCase()) {
      btn.style.background = "#bbf7d0";
      btn.style.borderColor = "#22c55e";
      btn.style.color = "#166534";
    } else if (btn.textContent === chosen) {
      btn.style.background = "#fee2e2";
      btn.style.borderColor = "#ef4444";
      btn.style.color = "#991b1b";
    }
  });

  const isCorrect = chosen.toLowerCase() === correct.toLowerCase();

  // Stats bijwerken
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
    setTimeout(nextQuestion, 900);
  } else {
    feedbackEl.textContent = `Fout — het juiste antwoord is: ${correct}`;
    feedbackEl.style.color = "red";
    setTimeout(nextQuestion, 1800);
  }
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