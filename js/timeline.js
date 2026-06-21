// Fix: fetch from modes/connections.html needs to go up one folder
fetch("../data/timeline.json")
  .then(r => r.json())
  .then(data => {
    const raw = Array.isArray(data) ? data : data.timeline;
    if (!raw) return;

    const items = raw.map(item => ({
      ...item,
      start: typeof item.start === "number" ? `${item.start}-01-01` : item.start,
      end: item.end && typeof item.end === "number" ? `${item.end}-01-01` : item.end
    }));

    const container = document.getElementById("timeline");
    if (!container) return;

    window.timelineItems = new vis.DataSet(items);
    window.timeline = new vis.Timeline(container, window.timelineItems, {
      height: "250px"
    });
  })
  .catch(err => {
    console.error("Kon tijdlijn niet laden:", err);
    const el = document.getElementById("timeline");
    if (el) el.textContent = "Tijdlijn kon niet geladen worden.";
  });

window.focusTimeline = function (id) {
  if (!window.timeline || !window.timelineItems) return;
  const item = window.timelineItems.get(id);
  if (item) {
    window.timeline.setSelection(id);
    window.timeline.moveTo(item.start);
  }
};
