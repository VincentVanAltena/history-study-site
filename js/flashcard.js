(function () {
  let data  = [];
  let index = 0;
  let answerVisible = false;

  function showCard() {
    const card   = document.getElementById("flashcard");
    const answer = document.getElementById("flashcardAnswer");
    if (!card) return;

    if (!data.length) {
      card.textContent = "Geen kaarten beschikbaar (laadt...)";
      return;
    }

    const item = data[index] || {};
    card.textContent = item.question || "Lege kaart";

    // Reset answer visibility on new card
    answerVisible = false;
    if (answer) {
      answer.textContent = "";
      answer.style.display = "none";
    }
  }

  function showAnswer() {
    if (!data.length) return;
    const item   = data[index] || {};
    const answer = document.getElementById("flashcardAnswer");
    if (!answer) return;

    if (answerVisible) {
      answer.style.display = "none";
      answerVisible = false;
    } else {
      answer.textContent = item.answer || "Geen antwoord";
      answer.style.display = "block";
      answerVisible = true;
    }
  }

  function nextCard() {
    if (!data.length) return;
    index = (index + 1) % data.length;
    showCard();
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadFactsData()
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

    const showBtn = document.getElementById('showAnswer');
    const nextBtn = document.getElementById('next');
    if (showBtn) showBtn.addEventListener('click', showAnswer);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
  });
})();