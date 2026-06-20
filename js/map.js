window.map = L.map('map').setView([52, 5], 4);
window.mapLayers = {};

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window.map);

fetch("../data/map_layers.json")
  .then(r => r.json())
  .then(layers => {
    layers.forEach(layer => {
      if (layer.type === "polygon") {
        const poly = L.polygon(layer.coords).addTo(window.map);
        window.mapLayers[layer.name] = poly;
      }
    });
  });
window.focusMap = function(layerName, coords) {
  if (!window.map) return;

  if (coords) {
    window.map.setView(coords, 6);
  }

  if (layerName && window.mapLayers[layerName]) {
    window.mapLayers[layerName].openPopup();
  }
};
