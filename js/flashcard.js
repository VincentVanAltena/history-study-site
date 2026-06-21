(function () {
  let data = [];
  let index = 0;

  function showCard() {
    const card = document.getElementById("flashcard");
    if (!card) return;
    if (!data.length) {
      card.textContent = "Geen kaarten beschikbaar (laadt...)";
      return;
    }
    const item = data[index] || {};
    card.textContent = item.question || "Lege kaart";
  }

  function showAnswer() {
    if (!data.length) return alert("Geen antwoord beschikbaar");
    const item = data[index] || {};
    alert(item.answer || "Geen antwoord");
  }

  function nextCard() {
    if (!data.length) return;
    index = (index + 1) % data.length;
    showCard();
  }

  document.addEventListener('DOMContentLoaded', function () {
    // load data (absolute path works when site served from repo root)
    fetch('/data/facts.json')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load facts.json: ' + r.status);
        return r.json();
      })
      .then(json => {
        data = Array.isArray(json) ? json : [];
        showCard();
      })
      .catch(err => {
        console.error(err);
        const card = document.getElementById("flashcard");
        if (card) card.textContent = "Fout bij laden kaarten.";
      });

    // wire buttons (only if present)
    const showBtn = document.getElementById('showAnswer');
    const nextBtn = document.getElementById('next');
    if (showBtn) showBtn.addEventListener('click', showAnswer);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
  });
})();
