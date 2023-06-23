// // Creating the map object
// let myMap = L.map("map").setView([37.5, -112.5], 4);
// Set up the map object
let myMap = L.map("map").setView([37.5, -95], 4);

// Adding the tile layer
const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// // Adding the tile layers
// const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(myMap);

// const darkMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
// });

// fetch('https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_500k.json')
//   .then(response => response.json())
//   .then(data => {
//     const statesData = data;

//     function getColor(d) {
//       return d > 1000 ? '#ffffb2' :
//              d > 500  ? '#fff' :
//              '#b10026';
//     }

//     function style(feature) {
//       return {
//         fillColor: getColor(feature.properties.DP03_16E),
//         weight: 1,
//         color: '#fff',
//         fillOpacity: 0.8
//       };
//     }

//     // Create the choropleth layer using statesData
//     L.geoJson(statesData, { style: style }).addTo(myMap);
//   });

// // Create a base maps object
// const baseMaps = {
//   "Street Map": streetMap,
//   "Dark Map": darkMap,
// };

// // Set the default map layer to Dark Map
// darkMap.addTo(myMap);

// // Add layer control to the map
// L.control.layers(baseMaps).addTo(myMap);
