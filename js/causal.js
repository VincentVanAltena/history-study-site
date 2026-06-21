// causal.js — Causaal Keten Quiz + Weergave

(function () {
  let facts = [];
  // Alleen facts met minstens 1 cause en 1 effect zijn bruikbaar voor de quiz
  let usableFacts = [];
  let currentFact = null;
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

  // Voegt een array van strings samen tot 1 waarde.
  // Bij >1 item: genummerd, elk op een eigen regel ("1. ...\n2. ...").
  // Bij 1 item: gewoon de tekst zelf.
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

    currentFact = usableFacts[Math.floor(Math.random() * usableFacts.length)];

    // Juiste oorzaak: alle causes van dit fact, genummerd samengevoegd indien er meerdere zijn
    const correctCauseText = formatList(currentFact.context.causes);

    // 2 foute oorzaken: de volledige causes-lijst van 2 andere, willekeurige facts
    const otherFactsForCauses = shuffle(usableFacts.filter(f => f.id !== currentFact.id)).slice(0, 2);

    // Elke kaart krijgt een uniek cardId zodat identieke teksten elkaar niet kunnen overschrijven
    const causeCards = [
      { cardId: "cause-correct", text: correctCauseText, correct: true },
      ...otherFactsForCauses.map((f, i) => ({
        cardId: `cause-wrong-${i}`,
        text: formatList(f.context.causes),
        correct: false
      }))
    ];
    const displayCauses = shuffle(causeCards);

    // Juiste gevolg: alle effects van dit fact, genummerd samengevoegd indien er meerdere zijn
    const correctEffectText = formatList(currentFact.context.effects);

    // 2 foute gevolgen: de volledige effects-lijst van 2 andere, willekeurige facts
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

    document.getElementById("causal-start-btn").style.display = "none";
    document.getElementById("causal-next-btn").style.display = "none";
    document.getElementById("causal-feedback").style.display = "none";
  }

  function renderQuestion(causeCards, event, effectCards) {
    const area = document.getElementById("causal-question-area");
    if (!area) return;

    area.innerHTML = `
      <p class="causal-instruction">
        Kies de <strong>juiste oorzaak</strong> en het <strong>juiste gevolg</strong>:
      </p>
      <div class="causal-diagram">
        <div class="causal-row causes-row">
          ${causeCards.map(c => `
            <button class="causal-card cause-card" data-card-id="${c.cardId}" data-correct="${c.correct}">
              ${escHtml(c.text).split("\n").join("<br>")}
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
          ${effectCards.map(e => `
            <button class="causal-card effect-card" data-card-id="${e.cardId}" data-correct="${e.correct}">
              ${escHtml(e.text).split("\n").join("<br>")}
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
        selectedCause = btn.dataset.cardId;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    // Effect single-select
    area.querySelectorAll(".effect-card").forEach(btn => {
      btn.addEventListener("click", () => {
        area.querySelectorAll(".effect-card").forEach(b => b.classList.remove("selected"));
        selectedEffect = btn.dataset.cardId;
        btn.classList.add("selected");
        updateCheckBtn();
      });
    });

    const correctCauseCard = causeCards.find(c => c.correct);
    const correctEffectCard = effectCards.find(e => e.correct);
    area.querySelector("#causal-check-btn").addEventListener("click", () =>
      checkAnswer(correctCauseCard, correctEffectCard)
    );
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
      feedbackEl.innerHTML = "Uitstekend! Oorzaak én gevolg kloppen.";
    } else {
      feedbackEl.className = "causal-feedback feedback-wrong";
      let msg = "Niet helemaal. ";
      if (!causeCorrect) msg += `De juiste oorzaak was: <em>${escHtml(correctCauseCard.text).split("\n").join("<br>")}</em>. `;
      if (!effectCorrect) msg += `Het juiste gevolg was: <em>${escHtml(correctEffectCard.text).split("\n").join("<br>")}</em>.`;
      feedbackEl.innerHTML = msg;
    }

    document.getElementById("causal-score-text").textContent = `Score: ${score.correct} / ${score.total}`;
    document.getElementById("causal-next-btn").style.display = "inline-flex";
  }

  function renderOverview() {
    const div = document.getElementById("causal-overview");
    if (!div) return;
    div.innerHTML = usableFacts.map(f => `
      <div class="causal-overview-block">
        <h4>${escHtml(f.event)}</h4>
        <p><strong>Oorzaken:</strong><br>${escHtml(formatList(f.context.causes)).split("\n").join("<br>")}</p>
        <p><strong>Gevolgen:</strong><br>${escHtml(formatList(f.context.effects)).split("\n").join("<br>")}</p>
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