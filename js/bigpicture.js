fetch("../data/themes.json")
  .then(r => r.json())
  .then(themes => {
    const div = document.getElementById("big");
    themes.forEach(t => {
      const el = document.createElement("div");
      el.innerHTML = `<h3>${t.name}</h3><p>${t.description}</p>`;
      div.appendChild(el);
    });
  });
