// // Creating the map object
// let myMap = L.map("map").setView([40, -100], 5);

// // Adding the tile layer
// const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
// }).addTo(myMap);

// // Load the CSV data
// d3.csv("test_data.csv").then(function (data) {
//   // Process the CSV data
//   processData(data);
// });

// function processData(data) {
//   // Load the state boundary GeoJSON data
//   d3.json("gz_2010_us_040_00_500k.json").then(function (boundaryData) {
//     // Create a lookup object for state ID and corresponding data from CSV
//     const stateData = {};
//     data.forEach(function (entry) {
//       const stateID = entry.state_id;
//       stateData[stateID] = {
//         "2008": parseFloat(entry["2008"]),
//       };
//       const stateIDString = String(entry.state_id); // Move this line inside the loop
//     });

//     console.log("State Data:", stateData); // Check stateData object

//     // Loop through each feature in the boundary GeoJSON data
//     boundaryData.features.forEach(function (feature) {
//       const stateID = feature.properties.STATE;
//       const stateName = feature.properties.NAME;
//       const yearData = stateData[stateID];

//       // Create a GeoJSON layer for the state
//       const stateGeoJSON = L.geoJSON(feature, {
//         style: function () {
//           return {
//             fillColor: getColor(yearData),
//             color: "#fff",
//             weight: 1,
//             fillOpacity: 0.8,
//           };
//         },
//         onEachFeature: function (feature, layer) {
//           const year = feature.properties.year;
//           const value = yearData && yearData[year] ? yearData[year] : null;
//           layer.bindPopup("<strong>" + stateName + "</strong><br /><br />Year: " + year + "<br />Value: " + value);
//         },        
//       });

//       // Add the GeoJSON layer to the map
//       stateGeoJSON.addTo(myMap);
//     });
//   });
// }

// // Function to determine the color based on the value
// function getColor(yearData) {
//   if (yearData && yearData["2008"]) {
//     const value = yearData["2008"];
//     return value > 15 ? "#b10026" :
//       value > 10 ? "#e31a1c" :
//       value > 5 ? "#fd8d3c" :
//       value > 0 ? "#fecc5c" :
//       "#ffffb2";
//   } else {
//     // Return a default color if data is missing
//     return "#cccccc";
//   }
// }









// Creating the map object
let myMap = L.map("map").setView([40, -100], 5);

// Adding the tile layer
const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Load the CSV data
d3.csv("test_data.csv").then(function (data) {
  // Process the CSV data
  processData(data);
});

function processData(data) {
  // Load the state boundary GeoJSON data
  d3.json("gz_2010_us_040_00_500k.json").then(function (boundaryData) {
    // Create a lookup object for state ID and corresponding data from CSV
    const stateData = {};
    data.forEach(function (entry) {
      const stateID = entry.state_id;
      const yearData = {};
      for (const key in entry) {
        if (key !== "state_id" && key !== "State") {
          yearData[key] = parseFloat(entry[key]);
        }
      }
      stateData[stateID] = yearData;
    });

    console.log("State Data:", stateData); // Check stateData object

    // Create a dropdown menu for years
    const yearDropdown = document.getElementById("year-dropdown");
    const years = Object.keys(data[0]).filter((key) => key !== "state_id" && key !== "State");
    years.forEach(function (year) {
    const option = document.createElement("option");
    option.value = year;
    option.text = year;
    yearDropdown.appendChild(option);
  });

    // Function to handle the year change event
    function handleYearChange() {
      const selectedYear = yearDropdown.value;
      myMap.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
          const stateID = layer.feature.properties.STATE;
          const yearData = stateData[stateID];
          layer.setStyle({ fillColor: getColor(yearData, selectedYear) });
          const popupContent =
            "<strong>" +
            layer.feature.properties.NAME +
            "</strong><br /><br />Year: " +
            selectedYear +
            "<br />Childhood Obesity Rate: " +
            (yearData && yearData[selectedYear] ? yearData[selectedYear] : null);
          layer.setPopupContent(popupContent);
        }
      });
    }

    // Add change event listener to the dropdown menu
    yearDropdown.addEventListener("change", handleYearChange);

    // Loop through each feature in the boundary GeoJSON data
    boundaryData.features.forEach(function (feature) {
      const stateID = feature.properties.STATE;
      const stateName = feature.properties.NAME;
      const yearData = stateData[stateID];

      // Create a GeoJSON layer for the state
      const stateGeoJSON = L.geoJSON(feature, {
        style: function () {
          return {
            fillColor: getColor(yearData, yearDropdown.value),
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8,
          };
        },
        onEachFeature: function (feature, layer) {
          const selectedYear = yearDropdown.value;
          const popupContent =
            "<strong>" +
            stateName +
            "</strong><br /><br />Year: " +
            selectedYear +
            "<br />Child Obesity Rate: " +
            (yearData && yearData[selectedYear] ? yearData[selectedYear] : null);
          layer.bindPopup(popupContent);
        },
      });

      // Add the GeoJSON layer to the map
      stateGeoJSON.addTo(myMap);
    });
  });
}

// Function to determine the color based on the value
function getColor(yearData, selectedYear) {
  if (yearData && yearData[selectedYear]) {
    const value = yearData[selectedYear];
    return value > 16 ? "#b10026" :
      value > 12 ? "#e31a1c" :
      value > 8 ? "#fd8d3c" :
      value > 0 ? "#fecc5c" :
      "#ffffb2";
  } else {
    // Return a default color if data is missing
    return "#cccccc";
  }
}
