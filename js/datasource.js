// datasource.js — meerdere bestanden uploaden per type (facts, timeline, glossary)
// Vereist utils.js

(function () {

  // ── Config per type ──────────────────────────────────────────────────────────
  const TYPES = [
    {
      type:      "facts",
      uploadId:  "factsUpload",
      resetId:   "useDefaultFacts",
      statusId:  "statusFacts",
      errorId:   "errorFacts",
      label:     "Vragen (facts.json)",
      defaultMsg:"Standaard kerkgeschiedenisvragen actief.",
      validate:  json => validateFactsJson(json),
      set:       (j, n) => setCustomFactsData(j, n),
      clear:     () => clearCustomFactsData(),
      has:       () => hasCustomFactsData(),
      getName:   () => getCustomFactsName(),
    },
    {
      type:      "timeline",
      uploadId:  "timelineUpload",
      resetId:   "useDefaultTimeline",
      statusId:  "statusTimeline",
      errorId:   "errorTimeline",
      label:     "Tijdlijn (timeline.json)",
      defaultMsg:"Standaard tijdlijn actief.",
      validate:  json => validateTimelineJson(json),
      set:       (j, n) => setCustomTimelineData(j, n),
      clear:     () => clearCustomTimelineData(),
      has:       () => hasCustomTimelineData(),
      getName:   () => getCustomTimelineName(),
    },
    {
      type:      "glossary",
      uploadId:  "glossaryUpload",
      resetId:   "useDefaultGlossary",
      statusId:  "statusGlossary",
      errorId:   "errorGlossary",
      label:     "Woordenlijst (glossary.json)",
      defaultMsg:"Standaard woordenlijst actief.",
      validate:  json => validateGlossaryJson(json),
      set:       (j, n) => setCustomGlossaryData(j, n),
      clear:     () => clearCustomGlossaryData(),
      has:       () => hasCustomGlossaryData(),
      getName:   () => getCustomGlossaryName(),
    },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function refreshStatus(cfg) {
    const el = document.getElementById(cfg.statusId);
    if (!el) return;
    if (cfg.has()) {
      const name = cfg.getName();
      el.textContent = `✓ Eigen bestand actief${name ? ": " + name : ""}.`;
      el.className = "ds-status ds-status--custom";
    } else {
      el.textContent = cfg.defaultMsg;
      el.className = "ds-status ds-status--default";
    }
  }

  function showError(cfg, msg) {
    const el = document.getElementById(cfg.errorId);
    if (!el) return;
    el.textContent = msg || "";
    el.style.display = msg ? "block" : "none";
  }

  function wireType(cfg) {
    const input    = document.getElementById(cfg.uploadId);
    const resetBtn = document.getElementById(cfg.resetId);

    refreshStatus(cfg);

    if (input) {
      input.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        showError(cfg, null);

        const reader = new FileReader();
        reader.onload = () => {
          let parsed;
          try { parsed = JSON.parse(reader.result); }
          catch { showError(cfg, "Ongeldig JSON-formaat."); return; }

          const err = cfg.validate(parsed);
          if (err) { showError(cfg, err); return; }

          cfg.set(parsed, file.name);
          refreshStatus(cfg);
        };
        reader.readAsText(file);
        input.value = "";
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        cfg.clear();
        showError(cfg, null);
        refreshStatus(cfg);
      });
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", () => {
    TYPES.forEach(wireType);
  });

})();
