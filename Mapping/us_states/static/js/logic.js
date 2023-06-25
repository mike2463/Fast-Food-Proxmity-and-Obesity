// Creating the map object
let myMap = L.map('map').setView([40, -100], 5);

// Adding the tile layer
const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(myMap);

let heatLayer;
let stateLayer;
let countyLayer;

// Create separate overlay groups for heatLayer, stateLayer, countyLayer, and countyHealthLayer
const heatLayerOverlay = L.layerGroup().addTo(myMap);
const stateLayerOverlay = L.layerGroup().addTo(myMap);
const countyLayerOverlay = L.layerGroup().addTo(myMap);
const countyHealthLayerOverlay = L.layerGroup().addTo(myMap); // Add countyHealthLayerOverlay

Promise.all([
  d3.csv('test_data.csv'),
  d3.csv('coordinates.csv'),
  d3.csv('health_indicators.csv'), // Corrected variable name
  d3.json('county_df.json'),
  d3.json('gz_2010_us_040_00_500k.json'),
  d3.json('gz_2010_us_050_00_500k.json')
]).then(function (data) {
  const testData = data[0];
  const coordinatesData = data[1];
  const health_indicators = data[2]; // Corrected variable name
  const countyData = data[3];
  const stateBoundaryData = data[4];
  const countyBoundaryData = data[5];

  // Process the CSV data and create the layers
  processData(coordinatesData, testData, health_indicators, countyData, stateBoundaryData, countyBoundaryData); 
});

function processData(coordinatesData, testData, health_indicators, countyData, stateBoundaryData, countyBoundaryData) {
  // Process coordinates data
  const coordinates = coordinatesData.map(entry => [parseFloat(entry.lat), parseFloat(entry.lon)]);
  const markers = coordinates.map(coords => L.circleMarker(coords, { radius: 1, fillColor: 'black', color: '#000', weight: 1, fillOpacity: 1 }));
  
  heatLayer = L.layerGroup(markers);  

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

    // Process health data
  const healthData = {};
  health_indicators.forEach(function (entry) {
    const countyID = entry.FIPS;
    const fairPoor = parseFloat(entry['% Fair or Poor Health']); // Extract the '% Fair or Poor Health' value and convert it to a float
    healthData[countyID] = fairPoor;
  });

  countyBoundaryData.features.forEach(function (feature) {
    const countyID = feature.properties.GEO_ID.slice(-5); // Extract the last 5 digits from GEO_ID
    const countyName = feature.properties.NAME;
    const fairPoorRate = healthData[countyID];

    // Create a GeoJSON layer for the county
    const countyGeoJSON = L.geoJSON(feature, {
      style: function () {
        return {
          fillColor: getCountyColor(fairPoorRate), // Pass the '% Fair or Poor Health' value to the color function
          color: '#fff',
          weight: 1,
          fillOpacity: 0.3
        };
      },
      onEachFeature: function (feature, layer) {
        const popupContent =
          '<strong>' +
          countyName +
          '</strong><br /><br />% Fair or Poor Health: ' +
          (fairPoorRate ? fairPoorRate + '%' : 'No data');

        layer.bindPopup(popupContent);
      }
    });

    // Add the GeoJSON layer to the map as an overlay
    countyGeoJSON.addTo(countyHealthLayerOverlay);
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
  "Poverty by County": countyLayerOverlay,
  "Fair or Poor Health by County": countyHealthLayerOverlay
};

// Add layer control to the map
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(myMap);

// Create the state legend
const stateLegend = L.control({ position: 'bottomright' });
stateLegend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 8, 12, 16]; // Update the grades based on the color scale
  const colors = ['#edf8fb', '#b2e2e2', '#66c2a4', '#238b45']; // Update the colors based on the color scale
  const labels = [];

  for (let i = 0; i < grades.length; i++) {
    const from = grades[i];
    const to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        colors[i] +
        '"></i> ' +
        from +
        (to ? '&ndash;' + to : '+')
    );
  }

  div.innerHTML = '<h4>State Level (%)</h4>' + labels.join('<br>');
  return div;
};

stateLegend.addTo(myMap);

// Create the county legend
const countyLegend = L.control({ position: 'bottomleft' });
countyLegend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 5, 10, 15, 20, 25]; // Update the grades based on the color scale
  const colors = ['#c2e699', '#1a9641', '#a6d96a', '#ffffbf', '#fdae61', '#d7191c']; // Update the colors based on the color scale
  const labels = [];

  for (let i = 0; i < grades.length; i++) {
    const from = grades[i];
    const to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        colors[i] +
        '"></i> ' +
        from +
        (to ? '&ndash;' + to : '+')
    );
  }

  div.innerHTML = '<h4>County Level (%)</h4>' + labels.join('<br>');
  return div;
};

countyLegend.addTo(myMap);

// Create the title element
const title = document.createElement('h1');
title.textContent = 'Group 6 Project';

// Create the textbox element
const textbox = document.createElement('p');
textbox.textContent = 'Welcome to our mapping website! Here you can compare several datasets. For best results, only select one or two layers at a time. Keep in mind only the most recent layer you select will return pop up data. Enjoy!';

// Create a container div for the title and textbox
const titleBox = document.createElement('div');
titleBox.id = 'titleBox';

// Append the title and textbox elements to the container
titleBox.appendChild(title);
titleBox.appendChild(textbox);

// Get the map div element
const mapDiv = document.getElementById('map');

// Insert the titleBox container before the map div
mapDiv.parentNode.insertBefore(titleBox, mapDiv);

