function renderGlossary(glossaryItems) {
  const container = document.getElementById("glossary");
  if (!container) return;

  const glossaryList = document.createElement("div");
  glossaryList.className = "glossary-list";

  glossaryItems.forEach(item => {
    const entry = document.createElement("div");
    entry.className = "glossary-entry";
    entry.innerHTML = `
      <h3>${item.term}</h3>
      <p>${item.definition}</p>
      <em>${item.source_quote}</em>
    `;
    glossaryList.appendChild(entry);
  });

  container.appendChild(glossaryList);
}

fetch("../data/glossary.json")
  .then(r => r.json())
  .then(data => renderGlossary(data.glossary));
