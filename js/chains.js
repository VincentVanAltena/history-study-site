// chains.js — Causal Chains (overzicht only)

(function () {
  let facts = [];

  function formatList(arr) {
    if (arr.length === 1) return arr[0];
    return arr.map((item, i) => `${i + 1}. ${item}`).join("\n");
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function loadCausal() {
    loadFactsData()
      .then(data => {
        facts = data.filter(f =>
          f.context &&
          Array.isArray(f.context.causes) && f.context.causes.length > 0 &&
          Array.isArray(f.context.effects) && f.context.effects.length > 0
        );
        renderOverview();
      })
      .catch(err => {
        const div = document.getElementById("causal-overview");
        if (div) div.innerHTML = `<p style="color:#c00">Kon causale data niet laden: ${err.message}</p>`;
      });
  }

  function renderOverview() {
    const div = document.getElementById("causal-overview");
    if (!div) return;
    div.innerHTML = facts.map(f => `
      <div class="causal-overview-block">
        <h4>${escHtml(f.event)}</h4>
        <p><strong>Oorzaken:</strong><br>${escHtml(formatList(f.context.causes)).split("\n").join("<br>")}</p>
        <p><strong>Gevolgen:</strong><br>${escHtml(formatList(f.context.effects)).split("\n").join("<br>")}</p>
      </div>
    `).join("");
  }

  loadCausal();
})();