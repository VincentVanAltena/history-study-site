fetch("../data/timeline.json")
  .then(r => r.json())
  .then(events => {
    const container = document.getElementById("timeline");
    window.timelineItems = new vis.DataSet(events);
    window.timeline = new vis.Timeline(container, window.timelineItems, {});
  });
window.focusTimeline = function(id) {
  if (!window.timeline || !window.timelineItems) return;

  const item = window.timelineItems.get(id);
  if (item) {
    window.timeline.setSelection(id);
    window.timeline.moveTo(item.start);
  }
};
