// causal.js — Causaal Keten Quiz + Weergave

(function () {
  let chains = [];
  let currentChain = null;
  let selectedCause = null;
  let selectedEffect = null;
  let score = { correct: 0, total: 0 };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadCausal() {
    fetch("../data/causal_chains.json")
      .then(r => r.json())
      .then(data => {
        chains = data;
        renderQuizSection();
        renderOverview();
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
        <div class="causal-score-bar">
          <span id="causal-score-text">Score: 0 / 0</span>
          <button id="causal-next-btn" style="display:none">Volgende vraag →</button>
        </div>
        <div id="causal-question-area"></div>
        <div id="causal-feedback" class="causal-feedback" style="display:none"></div>
        <div class="causal-start-wrap">
          <button id="causal-start-btn">▶ Start Causale Quiz</button>
        </div>
      </div>
      <hr style="margin:28px 0 16px">
      <h3 style="margin-bottom:12px">Alle causale ketens</h3>
      <div id="causal-overview"></div>
    `;

    document.getElementById("causal-start-btn").addEventListener("click", startQuiz);
    document.getElementById("causal-next-btn").addEventListener("click", startQuiz);
  }

  function startQuiz() {
    selectedCause = null;
    selectedEffect = null;

    currentChain = chains[Math.floor(Math.random() * chains.length)];

    // Pick 1 correct cause + 2 distractors from allCauses
    const correctCause = currentChain.causes[Math.floor(Math.random() * currentChain.causes.length)];
    const causeDistractors = shuffle(
      (currentChain.allCauses || currentChain.causes).filter(c => c !== correctCause)
    ).slice(0, 2);
    const displayCauses = shuffle([correctCause, ...causeDistractors]);

    // Pick 1 correct effect + 2 distractors from allEffects
    const correctEffect = currentChain.effects[Math.floor(Math.random() * currentChain.effects.length)];
    const effectDistractors = shuffle(
      (currentChain.allEffects || currentChain.effects).filter(e => e !== correctEffect)
    ).slice(0, 2);
    const displayEffects = shuffle([correctEffect, ...effectDistractors]);

    renderQuestion(displayCauses, correctCause, currentChain.event, displayEffects, correctEffect);

    document.getElementById("causal-start-btn").style.display = "none";
    document.getElementById("causal-next-btn").style.display = "none";
    document.getElementById("causal-feedback").style.display = "none";
  }

  function renderQuestion(causes, correctCause, event, effects, correctEffect) {
    const area = document.getElementById("causal-question-area");
    if (!area) return;

    area.innerHTML = `
      <p class="causal-instruction">
        Kies de <strong>juiste oorzaak</strong> en het <strong>juiste gevolg</strong>:
      </p>
      <div class="causal-diagram">
        <div class="causal-row causes-row">
          ${causes.map((c, i) => `
            <button class="causal-card cause-card" data-value="${escHtml(c)}" data-correct="${c === correctCause}">
              ${escHtml(c)}
            </button>
          `).join("")}
        </div>

        <div class="causal-arrow-row">
          <div class="causal-arrow">↓</div>
        </div>

        <div class="causal-event-row">
          <div class="causal-event-box">${escHtml(event)}</div>
        </div>

        <div class="causal-arrow-row">
          <div class="causal-arrow">↓</div>
        </div>

        <div class="causal-row effects-row">
          ${effects.map((e, i) => `
            <button class="causal-card effect-card" data-value="${escHtml(e)}" data-correct="${e === correctEffect}">
              ${escHtml(e)}
            </button>
          `).join("")}
        </div>
      </div>
      <div style="text-align:center;margin-top:14px">
        <button id="causal-check-btn" disabled>Controleer antwoord</button>
      </div>
    `;

    // Cause single-select
    area.querySelectorAll(".cause-card").forEach(btn => {
      btn.addEventListener("click", () => {
        area.querySelectorAll(".cause-card").forEach(b => b.classList.remove("selected"));
        selectedCause = btn.dataset.value;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    // Effect single-select
    area.querySelectorAll(".effect-card").forEach(btn => {
      btn.addEventListener("click", () => {
        area.querySelectorAll(".effect-card").forEach(b => b.classList.remove("selected"));
        selectedEffect = btn.dataset.value;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    area.querySelector("#causal-check-btn").addEventListener("click", () => checkAnswer(correctCause, correctEffect));
  }

  function updateCheckBtn() {
    const btn = document.querySelector("#causal-check-btn");
    if (btn) btn.disabled = !(selectedCause !== null && selectedEffect !== null);
  }

  function checkAnswer(correctCause, correctEffect) {
    score.total++;

    const causeCorrect = selectedCause === correctCause;
    const effectCorrect = selectedEffect === correctEffect;
    const allCorrect = causeCorrect && effectCorrect;

    if (allCorrect) score.correct++;

    document.querySelectorAll(".cause-card").forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") btn.classList.add("correct");
      else if (btn.classList.contains("selected")) btn.classList.add("wrong");
    });

    document.querySelectorAll(".effect-card").forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") btn.classList.add("correct");
      else if (btn.classList.contains("selected")) btn.classList.add("wrong");
    });

    document.querySelector("#causal-check-btn").disabled = true;

    const feedbackEl = document.getElementById("causal-feedback");
    feedbackEl.style.display = "block";
    if (allCorrect) {
      feedbackEl.className = "causal-feedback feedback-correct";
      feedbackEl.innerHTML = "✅ Uitstekend! Oorzaak én gevolg kloppen.";
    } else {
      feedbackEl.className = "causal-feedback feedback-wrong";
      let msg = "❌ Niet helemaal. ";
      if (!causeCorrect) msg += `De juiste oorzaak was: <em>${escHtml(correctCause)}</em>. `;
      if (!effectCorrect) msg += `Het juiste gevolg was: <em>${escHtml(correctEffect)}</em>.`;
      feedbackEl.innerHTML = msg;
    }

    document.getElementById("causal-score-text").textContent = `Score: ${score.correct} / ${score.total}`;
    document.getElementById("causal-next-btn").style.display = "inline-flex";
  }

  function renderOverview() {
    const div = document.getElementById("causal-overview");
    if (!div) return;
    div.innerHTML = chains.map(c => `
      <div class="causal-overview-block">
        <h4>${escHtml(c.event)}</h4>
        <p><strong>Oorzaken:</strong> ${c.causes.map(escHtml).join(" · ")}</p>
        <p><strong>Gevolgen:</strong> ${c.effects.map(escHtml).join(" · ")}</p>
      </div>
    `).join("");
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  loadCausal();
})();
