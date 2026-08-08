// glossary.js — laadt woordenlijst via utils.js (custom of standaard)

function renderGlossary(data) {
  const items = Array.isArray(data) ? data : (data && Array.isArray(data.glossary) ? data.glossary : []);
  const container = document.getElementById("glossary");
  if (!container) return;

  container.innerHTML = "";
  const list = document.createElement("div");
  list.className = "glossary-list";

  items.forEach(item => {
    const entry = document.createElement("div");
    entry.className = "glossary-entry";
    entry.innerHTML = `
      <h3>${item.term}</h3>
      <p>${item.definition}</p>
      ${item.source_quote ? `<em>${item.source_quote}</em>` : ""}
    `;
    list.appendChild(entry);
  });

  container.appendChild(list);
}

loadGlossaryData()
  .then(renderGlossary)
  .catch(err => {
    console.error("Kon woordenlijst niet laden:", err);
    const el = document.getElementById("glossary");
    if (el) el.innerHTML = `<p style="color:#c00;padding:12px">Woordenlijst kon niet geladen worden.</p>`;
  });
