// causal.js — Causaal Keten Quiz + Weergave

(function () {
  // ── Eigen localStorage-sleutels, los van adaptive_quiz ──────────────────────
  const STATS_KEY   = "causal_stats";
  const HISTORY_KEY = "causal_history";

  function loadCausalStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; }
    catch { return {}; }
  }
  function saveCausalStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  function logCausalHistory(correct) {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const today = new Date().toISOString().slice(0, 10);
      let entry = history.find(h => h.date === today);
      if (!entry) {
        entry = { date: today, correct: 0, wrong: 0 };
        history.push(entry);
      }
      if (correct) entry.correct++;
      else entry.wrong++;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  let facts = [];
  let usableFacts = [];
  let currentFact = null;
  let selectedCause = null;
  let selectedEffect = null;
  let currentCorrectCauseCard = null;
  let currentCorrectEffectCard = null;
  let score = { correct: 0, total: 0 };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatList(arr) {
    if (arr.length === 1) return arr[0];
    return arr.map((item, i) => `${i + 1}. ${item}`).join("\n");
  }

  function loadCausal() {
    fetch("../data/facts.json")
      .then(r => r.json())
      .then(data => {
        facts = data;
        usableFacts = facts.filter(f =>
          f.context &&
          Array.isArray(f.context.causes) && f.context.causes.length > 0 &&
          Array.isArray(f.context.effects) && f.context.effects.length > 0
        );
        renderQuizSection();
        startQuiz();
      })
      .catch(err => {
        const div = document.getElementById("causal");
        if (div) div.innerHTML = `<p style="color:#c00">Kon causale data niet laden: ${err.message}</p>`;
      });
  }

  function renderQuizSection() {
    const container = document.getElementById("causal");
    if (!container) return;

    container.innerHTML = `
      <div class="causal-quiz-area">
        <div id="causal-question-area"></div>
        <div id="causal-feedback" class="causal-feedback" style="display:none"></div>
        <div class="causal-controls" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; gap:16px;">
          <span id="causal-score-text">Score: 0 / 0</span>
          <button id="causal-check-btn" disabled style="display:inline-flex">Controleer antwoord</button>
        </div>
      </div>
    `;

    const checkBtn = document.getElementById("causal-check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        if (checkBtn.disabled) return;
        if (currentCorrectCauseCard && currentCorrectEffectCard) {
          checkAnswer(currentCorrectCauseCard, currentCorrectEffectCard);
        }
      });
    }
  }

  function startQuiz() {
    selectedCause = null;
    selectedEffect = null;

    currentFact = usableFacts[Math.floor(Math.random() * usableFacts.length)];

    const correctCauseText = formatList(currentFact.context.causes);
    const otherFactsForCauses = shuffle(usableFacts.filter(f => f.id !== currentFact.id)).slice(0, 2);
    const causeCards = [
      { cardId: "cause-correct", text: correctCauseText, correct: true },
      ...otherFactsForCauses.map((f, i) => ({
        cardId: `cause-wrong-${i}`,
        text: formatList(f.context.causes),
        correct: false
      }))
    ];
    const displayCauses = shuffle(causeCards);

    const correctEffectText = formatList(currentFact.context.effects);
    const otherFactsForEffects = shuffle(usableFacts.filter(f => f.id !== currentFact.id)).slice(0, 2);
    const effectCards = [
      { cardId: "effect-correct", text: correctEffectText, correct: true },
      ...otherFactsForEffects.map((f, i) => ({
        cardId: `effect-wrong-${i}`,
        text: formatList(f.context.effects),
        correct: false
      }))
    ];
    const displayEffects = shuffle(effectCards);

    renderQuestion(displayCauses, currentFact.event, displayEffects);

    const checkBtn = document.getElementById("causal-check-btn");
    if (checkBtn) {
      checkBtn.style.display = "inline-flex";
      checkBtn.disabled = true;
      checkBtn.textContent = "Check answer";
    }
    const feedbackEl = document.getElementById("causal-feedback");
    if (feedbackEl) feedbackEl.style.display = "none";
  }

  function renderQuestion(causeCards, event, effectCards) {
    const area = document.getElementById("causal-question-area");
    if (!area) return;

    area.innerHTML = `

      <div class="causal-diagram">
        <div class="causal-row causes-row">
          ${causeCards.map(c => `
            <button class="causal-card cause-card" data-card-id="${c.cardId}" data-correct="${c.correct}">
              ${escHtml(c.text).split("\n").join("<br>")}
            </button>
          `).join("")}
        </div>
        <div class="causal-arrow-row"><div class="causal-arrow">↓</div></div>
        <div class="causal-event-row">
          <div class="causal-event-box">${escHtml(event)}</div>
        </div>
        <div class="causal-arrow-row"><div class="causal-arrow">↓</div></div>
        <div class="causal-row effects-row">
          ${effectCards.map(e => `
            <button class="causal-card effect-card" data-card-id="${e.cardId}" data-correct="${e.correct}">
              ${escHtml(e.text).split("\n").join("<br>")}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    area.querySelectorAll(".cause-card").forEach(btn => {
      btn.addEventListener("click", () => {
        area.querySelectorAll(".cause-card").forEach(b => b.classList.remove("selected"));
        selectedCause = btn.dataset.cardId;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    area.querySelectorAll(".effect-card").forEach(btn => {
      btn.addEventListener("click", () => {
        area.querySelectorAll(".effect-card").forEach(b => b.classList.remove("selected"));
        selectedEffect = btn.dataset.cardId;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    currentCorrectCauseCard = causeCards.find(c => c.correct);
    currentCorrectEffectCard = effectCards.find(e => e.correct);
    const checkBtn = document.getElementById("causal-check-btn");
    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.style.display = "inline-flex";
      checkBtn.textContent = "Controleer antwoord";
    }
  }

  function updateCheckBtn() {
    const btn = document.querySelector("#causal-check-btn");
    if (btn) btn.disabled = !(selectedCause !== null && selectedEffect !== null);
  }

  function checkAnswer(correctCauseCard, correctEffectCard) {
    score.total++;

    const causeCorrect = selectedCause === correctCauseCard.cardId;
    const effectCorrect = selectedEffect === correctEffectCard.cardId;
    const allCorrect = causeCorrect && effectCorrect;

    if (allCorrect) score.correct++;

    // Knopkleur-feedback (zelfde stijl als adaptive_quiz.js)
    document.querySelectorAll(".cause-card").forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") {
        btn.style.background = "#bbf7d0";
        btn.style.borderColor = "#22c55e";
        btn.style.color = "#166534";
      } else if (btn.classList.contains("selected")) {
        btn.style.background = "#fee2e2";
        btn.style.borderColor = "#ef4444";
        btn.style.color = "#991b1b";
      }
    });

    document.querySelectorAll(".effect-card").forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") {
        btn.style.background = "#bbf7d0";
        btn.style.borderColor = "#22c55e";
        btn.style.color = "#166534";
      } else if (btn.classList.contains("selected")) {
        btn.style.background = "#fee2e2";
        btn.style.borderColor = "#ef4444";
        btn.style.color = "#991b1b";
      }
    });

    const checkBtn = document.querySelector("#causal-check-btn");
    if (checkBtn) checkBtn.disabled = true;

    // Tekst-feedback (zelfde stijl als adaptive_quiz.js)
    const feedbackEl = document.getElementById("causal-feedback");
    if (feedbackEl) {
      feedbackEl.style.display = "block";
      if (allCorrect) {
        feedbackEl.style.color = "green";
        feedbackEl.textContent = "Goed!";
      } else {
        feedbackEl.style.color = "red";
        let msg = "Fout — ";
        if (!causeCorrect && !effectCorrect) {
          msg += `de juiste oorzaak was: "${currentCorrectCauseCard.text.replace(/\n/g, "; ")}" en het juiste gevolg was: "${currentCorrectEffectCard.text.replace(/\n/g, "; ")}"`;
        } else if (!causeCorrect) {
          msg += `de juiste oorzaak was: "${currentCorrectCauseCard.text.replace(/\n/g, "; ")}"`;
        } else {
          msg += `het juiste gevolg was: "${currentCorrectEffectCard.text.replace(/\n/g, "; ")}"`;
        }
        feedbackEl.textContent = msg;
      }
    }

    // Stats wegschrijven naar eigen causal-sleutels
    const stats = loadCausalStats();
    const questionKey = currentFact.event;
    if (!stats[questionKey]) stats[questionKey] = { correct: 0, wrong: 0 };
    if (allCorrect) stats[questionKey].correct++;
    else stats[questionKey].wrong++;
    saveCausalStats(stats);
    logCausalHistory(allCorrect);

    document.getElementById("causal-score-text").textContent = `Score: ${score.correct} / ${score.total}`;
    setTimeout(startQuiz, allCorrect ? 900 : 1800);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  loadCausal();
})();