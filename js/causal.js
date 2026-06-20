fetch("../data/causal_chains.json")
  .then(r => r.json())
  .then(chains => {
    const div = document.getElementById("causal");
    chains.forEach(c => {
      const block = document.createElement("div");
      block.innerHTML = `
        <h3>${c.event}</h3>
        <p><strong>Oorzaken:</strong> ${c.causes.join(", ")}</p>
        <p><strong>Gevolgen:</strong> ${c.effects.join(", ")}</p>
      `;
      div.appendChild(block);
    });
  });
