// GeoJSON url
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
//  Get GeoJSON using D3
d3.json(url).then(createFeatures)
// Map variables
const mapCenter = [54, -112]
const mapZoom = 4
// Create map function
function createMap(earthquakeLayer) {
  const streetMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/{style}/tiles/512/{z}/{x}/{y}@2x?access_token={accessToken}',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 17,
      minZoom: 2,
      accessToken: "pk.eyJ1IjoiY2hleWZsYW1tZXIiLCJhIjoiY2t3Mnoydm0wMjEwejJ2cGFlM2ZrZGp6NyJ9.eAtIi0WdUCOH0hsjDNb5kw",
      id: "cheyflammer",
      style: "ckw87tl205fx015o67gkkwppp",
    }
  )
  // Defining map view
  const myMap = L.map('map', {
    center: mapCenter,
    zoom: mapZoom,
    layers: [streetMap, earthquakeLayer],
  })
  const baseMap = {
    'Street Map': streetMap,
  }
  const earthquakeOverlayerMap = {
    Earthquake: earthquakeLayer,
  }
  L.control
    .layers(baseMap, earthquakeOverlayerMap, {
      collapsed: false,
    })
    .addTo(myMap)
  // Get colors for legend
  function getColor(d) {
    return d > 90
      // RED
      ? '#FF0000'
      : d > 70
      // YELLOW
      ? '#FFFF00'
      : d > 50
      // ORANGE
      ? '#FFA500'
      : d > 30
      // PURPLE
      ? '#800080'
      : d > 10
      // BLUE
      ? '#0000ff'
      // GREEN
      : '#00FF00'
  }
  // Define legend
  let legend = L.control({ position: 'topleft' })
  legend.onAdd = function (myMap) {
    let div = L.DomUtil.create('div', 'info legend')
    grades = [-10, 10, 30, 50, 70, 90]
    labels = []
    // Loop through grade nums for legend color match 
    for (let i = 0; i < grades.length; i++) {
      // Push to labels list to add to DOM element
      labels.push(
        '<i style="background-color:' +
          getColor(grades[i] + 1) +
          '"></i>' +
          grades[i] +
          (grades[i + 1]
            ? '&ndash;' + grades[i + 1] + '<br>'
            : '+')
      )
    }
    // Adding inner HTML element
    div.innerHTML = labels.join('')
    return div
  }
  // Adding legend to map
  legend.addTo(myMap)
}
// Create Features
function createFeatures(data) {
  const earthquakes = data.features
  // Define list for the earthquake markers
  let earthquakeMarkers = []
  // Loop through earthquakes to plot on map
  for (let i = 0; i < earthquakes.length; i++) {
    let earthquake = earthquakes[i]
    let depth = earthquake.geometry.coordinates[2]
    let latLon = [
      earthquake.geometry.coordinates[1],
      earthquake.geometry.coordinates[0],
    ]
    let mag = earthquake.properties.mag
    //default color is white
    let color = '#FFFFFF'
    // DEFINE COLORS
    if (depth < 10) {
      // green
      color = '#00FF00'
    } else if (depth < 30) {
      // blue
      color = '#0000ff'
    } else if (depth < 50) {
      // purple
      color = '#800080'
    } else if (depth < 70) {
      // orange
      color = '#FFA500'
    } else if (depth < 90) {
      // yellow
      color = '#FFFF00'
    } else {
      // red
      color = '#FF0000'
    }
    // Define map marker circles
    let earthquakMarker = L.circle(latLon, {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: adjustMag(mag),
      // Info popup
    }).bindPopup(
      `<h3>Location: ${earthquake.properties.place}</h3><hr><h3>Magnitude: ${mag}</h3><br><h3>Depth: ${depth}</h3><br><h3>Lat, Lon: ${latLon[0]}, ${latLon[1]}</h3>`
    )
    earthquakeMarkers.push(earthquakMarker)
  }
  let earthquakeLayerGroup = L.layerGroup(earthquakeMarkers)
  createMap(earthquakeLayerGroup)
}
// Earthquake size/magnitude function
function adjustMag(mag) {
  var inverseMag = Math.pow(10, mag)
  return Math.sqrt(inverseMag) * 200
}
