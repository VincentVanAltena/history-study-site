window.map = L.map('map').setView([52, 5], 4);
window.mapLayers = {};

// Attribution required by OpenStreetMap tile usage policy
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(window.map);

function humanizeLayerName(name) {
  return name
    ? name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    : '';
}

function loadMapLayers(layers) {
  layers.forEach(layer => {
    let el;
    if (layer.type === "polygon") {
      el = L.polygon(layer.coords, { color: '#3b82f6' });
    } else if (layer.type === "point") {
      el = L.circleMarker(layer.coords, {
        radius: 4,
        color: 'hsl(0, 100%, 14%)',
        fillColor: '#4f0202',
        fillOpacity: 0.7
      });
    } else if (layer.type === "polyline") {
      el = L.polyline(layer.coords, { color: '#5e0303' });
    }

    if (el) {
      const featureLabel = layer.label || humanizeLayerName(layer.name);
      const popupContent = `
        <strong>${featureLabel}</strong>
        ${layer.period ? `<br><em>${layer.period}</em>` : ''}
      `;

      if (featureLabel) {
        el.bindTooltip(featureLabel, {
          permanent: true,
          direction: 'top',
          className: 'map-feature-label'
        });
      }

      el.bindPopup(popupContent.trim());
      el.addTo(window.map);
      window.mapLayers[layer.name] = el;
    }
  });
}

fetch("../data/map.json")
  .then(r => r.json())
  .then(data => {
    const layers = Array.isArray(data) ? data : data.mapLayers;
    if (layers) loadMapLayers(layers);
  })
  .catch(err => console.error("Kon kaartlagen niet laden:", err));

window.focusMap = function (layerName, coords) {
  if (!window.map) return;
  if (coords) window.map.setView(coords, 6);
  if (layerName && window.mapLayers[layerName]) {
    window.mapLayers[layerName].openPopup();
  }
};
