// timeline.js — laadt tijdlijn via utils.js (custom of standaard)

function yearToDateString(year) {
  const abs = Math.abs(year);
  const padded = String(abs).padStart(4, "0");
  return year < 0 ? `-${padded}-01-01` : `${padded}-01-01`;
}

function renderTimeline(data) {
  const raw = Array.isArray(data) ? data : data.timeline;
  if (!raw) return;

  const items = raw.map(item => {
    const startDate = new Date(0);
    startDate.setFullYear(typeof item.start === "number" ? item.start : parseInt(item.start));
    startDate.setMonth(0); startDate.setDate(1);

    let endDate;
    if (item.end != null) {
      endDate = new Date(0);
      endDate.setFullYear(typeof item.end === "number" ? item.end : parseInt(item.end));
      endDate.setMonth(0); endDate.setDate(1);
    }

    return { ...item, start: startDate, end: endDate || undefined };
  });

  const container = document.getElementById("timeline");
  if (!container) return;

  const YEAR_MS = 1000 * 60 * 60 * 24 * 365.25;
  window.timelineItems = new vis.DataSet(items);
  window.timeline = new vis.Timeline(container, window.timelineItems, {
    height: "280px",
    stack: true,
    showMajorLabels: true,
    showMinorLabels: true,
    zoomMin: YEAR_MS * 5,
    zoomMax: YEAR_MS * 2200,
    timeAxis: { scale: "year", step: 50 },
    format: { minorLabels: { year: "YYYY" }, majorLabels: { year: "YYYY" } },
    tooltip: { followMouse: true }
  });
}

loadTimelineData()
  .then(renderTimeline)
  .catch(err => {
    console.error("Kon tijdlijn niet laden:", err);
    const el = document.getElementById("timeline");
    if (el) el.innerHTML = `<p style="color:#c00;padding:12px">Tijdlijn kon niet geladen worden.</p>`;
  });

window.focusTimeline = function (id) {
  if (!window.timeline || !window.timelineItems) return;
  const item = window.timelineItems.get(id);
  if (item) { window.timeline.setSelection(id); window.timeline.moveTo(item.start); }
};
