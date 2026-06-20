let data = [];
let index = 0;

fetch("../data/facts.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    showCard();
  });

function showCard() {
  const card = document.getElementById("flashcard");
  card.innerHTML = data[index].question;
}

document.getElementById("showAnswer").onclick = () => {
  alert(data[index].answer);
};

document.getElementById("next").onclick = () => {
  index = (index + 1) % data.length;
  showCard();
};
