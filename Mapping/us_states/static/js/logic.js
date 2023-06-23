// Creating the map object
let myMap = L.map('map').setView([40, -100], 5);

// Adding the tile layer
const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(myMap);

let heatLayer;
let stateLayer;
let countyLayer;

// Create separate overlay groups for heatLayer, stateLayer, and countyLayer
const heatLayerOverlay = L.layerGroup().addTo(myMap);
const stateLayerOverlay = L.layerGroup().addTo(myMap);
const countyLayerOverlay = L.layerGroup().addTo(myMap);

// Load the various datasets
Promise.all([
  d3.csv('test_data.csv'),
  d3.csv('coordinates.csv'),
  d3.json('county_df.json'),
  d3.json('gz_2010_us_040_00_500k.json'),
  d3.json('gz_2010_us_050_00_500k.json')
]).then(function (data) {
  const testData = data[0];
  const coordinatesData = data[1];
  const countyData = data[2];
  const stateBoundaryData = data[3];
  const countyBoundaryData = data[4];

  // Process the CSV data and create the layers
  processData(coordinatesData, testData, countyData, stateBoundaryData, countyBoundaryData);
});

function processData(coordinatesData, testData, countyData, stateBoundaryData, countyBoundaryData) {
  // Process coordinates data
  const coordinates = coordinatesData.map(entry => [parseFloat(entry.Lat), parseFloat(entry.Lon), 6]);
  heatLayer = L.heatLayer(coordinates, {
    radius: 25,
    gradient: {
      0.0: 'darkred',
      0.5: 'red',
      1.0: 'orange'
    }
  });

  // Process state data
  const stateData = {};
  testData.forEach(function (entry) {
    const stateID = entry.state_id;
    const yearData = {};
    // Only consider data for the year 2020
    const year = '2020';
    yearData[year] = parseFloat(entry[year]);
    stateData[stateID] = yearData;
  });

  console.log('State Data:', stateData);

  stateBoundaryData.features.forEach(function (feature) {
    const stateID = feature.properties.STATE;
    const stateName = feature.properties.NAME;
    const yearData = stateData[stateID];

    // Create a GeoJSON layer for the state
    const stateGeoJSON = L.geoJSON(feature, {
      style: function () {
        return {
          fillColor: getColor(yearData, '2020'), // Set the year to "2020"
          color: '#fff',
          weight: 1,
          fillOpacity: 0.3
        };
      },
      onEachFeature: function (feature, layer) {
        const selectedYear = '2020'; // Set the year to "2020"
        const popupContent =
          '<strong>' +
          stateName +
          '</strong><br /><br />Year: ' +
          selectedYear +
          '<br />Childhood Obesity Rate: ' +
          (yearData && yearData[selectedYear] ? yearData[selectedYear] : null);

        // Log pop-ups with null values
        if (yearData == null) {
          console.log('Null value in pop-up for state:', stateName);
        }

        layer.bindPopup(popupContent);
      }
    });

    // Add the GeoJSON layer to the map as an overlay
    stateGeoJSON.addTo(stateLayerOverlay);
  });

  // Process county data
  const countyYearData = {};
  countyData.forEach(function (entry) {
    const countyID = entry['State-County-Code'];
    const countyYear = '2020';
    countyYearData[countyID] = parseFloat(entry.POVERTY_RATE);
  });

  console.log('County Data:', countyYearData);

  countyBoundaryData.features.forEach(function (feature) {
    const countyID = feature.properties.GEO_ID.slice(-5); // Extract last 5 digits from GEO_ID
    const countyName = feature.properties.NAME;
    const countyRate = countyYearData[countyID];

    // Create a GeoJSON layer for the county
    const countyGeoJSON = L.geoJSON(feature, {
      style: function () {
        return {
          fillColor: getCountyColor(countyRate, '2020'), // Set the year to "2020"
          color: '#fff',
          weight: 1,
          fillOpacity: 0.3
        };
      },
      onEachFeature: function (feature, layer) {
        const selectedYear = '2020'; // Set the year to "2020"
        const popupContent =
          '<strong>' +
          countyName +
          '</strong><br /><br />Year: ' +
          selectedYear +
          '<br />Poverty Rate: ' +
          (countyRate ? countyRate : null);

        // Log pop-ups with null values
        if (countyRate == null) {
          console.log('Null value in pop-up for county:', countyName);
        }

        layer.bindPopup(popupContent);
      }
    });

    // Add the GeoJSON layer to the map as an overlay
    countyGeoJSON.addTo(countyLayerOverlay);
  });

  // Add the default layer (coordinates) to the map as an overlay
  heatLayer.addTo(heatLayerOverlay);
}

// Function to determine the color for state layer based on the value
function getColor(yearData, selectedYear) {
  if (yearData && yearData[selectedYear]) {
    const value = yearData[selectedYear];
    return value > 16
      ? '#238b45'
      : value > 12
      ? '#66c2a4'
      : value > 8
      ? '#b2e2e2'
      : value > 0
      ? '#edf8fb'
      : '#ffffb2';
  } else {
    // Log the state layer that doesn't receive a color
    console.log('No color assigned for state layer:', yearData);

    // Return a default color if data is missing
    return '#d9e864';
  }
}

// Function to determine the color for county layer based on the value
function getCountyColor(rate, selectedYear) {
  if (rate) {
    return rate > 25
      ? '#d7191c'
      : rate > 20
      ? '#fdae61'
      : rate > 15
      ? '#ffffbf'
      : rate > 10
      ? '#a6d96a'
      : rate > 5
      ? '#1a9641'
      : '#c2e699';
  } else {
    // Log the county layer that doesn't receive a color
    console.log('No color assigned for county layer:', rate);

    // Return a default color if data is missing
    return '#d9e864';
  }
}

// Create an overlay maps object
const overlayMaps = {
  "Obesity by State": stateLayerOverlay,
  "Fastfood Locations": heatLayerOverlay,
  "Poverty by County": countyLayerOverlay
};

// Add layer control to the map
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(myMap);

