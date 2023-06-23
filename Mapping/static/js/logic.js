// Creating the map object
let myMap = L.map("map", {
  center: [37.5, -112.5],
  zoom: 4,
});

// Adding the tile layers
const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

const darkMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
});

const satelliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: '&copy; Esri',
  maxZoom: 18,
});

// Create a base maps object
const baseMaps = {
  "Street Map": streetMap,
  "Dark Map": darkMap,
  "Satellite Map": satelliteMap,
};

// Set the default map layer to Satellite Map
satelliteMap.addTo(myMap);

// Add layer control to the map
L.control.layers(baseMaps).addTo(myMap);
