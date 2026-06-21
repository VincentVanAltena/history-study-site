function attachContextPanels(articles) {
  const container = document.getElementById("contextArticles");
  if (!container) return;

  const articlesDiv = document.createElement("div");
  articlesDiv.className = "context-articles";

  articles.forEach(article => {
    const panel = document.createElement("div");
    panel.className = "context-panel";
    panel.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <em>"${article.source_quote}"</em>
    `;
    articlesDiv.appendChild(panel);
  });

  container.appendChild(articlesDiv);
}

fetch("../data/context.json")
  .then(r => r.json())
  .then(data => attachContextPanels(data.context_articles));
