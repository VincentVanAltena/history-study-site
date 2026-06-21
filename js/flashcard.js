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

  async function tryLoadData() {
    const candidates = [
      '../data/facts.json', // relative from /modes/
      '/data/facts.json', // absolute from site root
      // attempt to derive repo-rooted path from location.pathname
      (function(){
        // remove last segment (file) and ensure root of repo
        const path = location.pathname.replace(/\/modes\/.*$/, '');
        return path + '/data/facts.json';
      })(),
      // GitHub raw-style path (fall back)
      location.origin + '/VincentVanAltena/history-study-site/data/facts.json'
    ];

    for (const p of candidates) {
      try {
        const res = await fetch(p);
        if (!res.ok) continue;
        const json = await res.json();
        console.log('Loaded facts.json from', p);
        return json;
      } catch (err) {
        console.warn('Failed to fetch', p, err);
      }
    }
    throw new Error('All fetch attempts failed');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // load data using multiple fallbacks
    tryLoadData()
      .then(json => {
        data = Array.isArray(json) ? json : [];
        if (!data.length) console.warn('facts.json loaded but empty');
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

    // if page loaded with hash, auto-open
    if (location.hash === '#flashcards') {
      const startFc = document.getElementById('startFlashcards');
      startFc && startFc.click();
    }
  });
})();
