// Fix: was fetching "data/timeline.json" (wrong relative path from /modes/)
fetch("/history-study-site/data/timeline.json")
  .then(r => r.json())
  .then(data => {
    const items = Array.isArray(data) ? data : data.timeline;
    if (!items) return;

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
