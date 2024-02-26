// create respective tiles layers
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


// grayscale layer
var grayscale  =  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//water color layer
var waterColor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map Data: &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

// topography
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


//make a basemaps object
let basemaps= {
	Default: defaultMap,
	GrayScale: grayscale,
	"Water Color": waterColor,
	"Topography" : topoMap,
};




//make a map object
var myMap = L.map("map", {
	center: [ 36.7783, -119.4179 ],
	zoom: 3,
	layers: [defaultMap, grayscale, waterColor, topoMap]
});

// add the default map to the map

defaultMap.addTo(myMap);



// add layer control
//L.control
//	.layers(basemaps)
//	.addTo(myMap);

// get the data for the tectonic plates and draw them on map
// variable to holf the tectonic plates layer
let tectonicplates = new L.layerGroup();

//populate those plates by calling api to get info for the plates
 d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
	//console log to see if data loads
	//console.log(plateData)

	// load the data using geojson and add to the techtonic plates later
	L.geoJson(plateData,{
		//style this data to see the lines
			color: "yellow",
			weight: 1 
		}).addTo(tectonicplates);
});

// add the techtonic plates to the Map
tectonicplates.addTo(myMap);

	
// variable to hold the earthquake layer of data
let earthquakes = new L.layerGroup();

//get the data for the earthquakes and populate the latergroup
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
	function(earthquakeData){
	//console log to see if data loads
	//console.log(earthquakeData)
		//make a function that chooses the color of the data point
		function dataColor(depth){
			if (depth > 90)
				return "red";
			else if(depth > 70)
				return "#fc4903";
			else if(depth > 50)
				return "#fc8403";
			else if(depth > 30)
				return "#fcad03";
			else if(depth > 10)
				return "green"
		}

	// make a function that determines the size of the radius
		function radiusSize(mag){
			if (mag == 0)
				return 1;  
			else
				return mag * 5; // make sure that the circle is pronounced in the map
		}

		// add on to the style for each data point
		function dataStyle(feature) {
			return {
				opacity: 0.5,
				fillOpacity: 0.5,
				fillColor: dataColor(feature.geometry.coordinates[2]), //index 2 for depth
				color: "000000", //black outline
				radius: radiusSize(feature.properties.mag), //grabs magnitude
				weight: 0.5,
				stroke: "true"
				};
			}
			//add the GeoJson data to the earthquake layer
			L.geoJson(earthquakeData, {
				//make each feature a marker that is on the map a circle
				pointToLayer : function(feature, latLng) {
					return L.circleMarker(latLng);
				},
				//set the style for each marker
				style: dataStyle, //call the data style function and passes in the earthquake data
				//add popups
				onEachFeature: function(feature, layer){
					layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
					Depth: <b>${feature.geometry.coordinates[2]}</b><br></br> 
					Location: <b>${feature.properties.place}</b>`);
				}
			}).addTo(earthquakes);
	});

// add the earthquake later to the map
earthquakes.addTo(myMap);

//add the overlay for the techtonic plates
let overlays = {
	"Techtonic Plates": tectonicplates,
	"Earthquake Data": earthquakes
};
	

//add the overlay	
L.control
	.layers(basemaps, overlays)
	.addTo(myMap);

let legend = L.control({
	position: "bottomright"
});

//add the porperties for the legend
legend.onAdd = function() {
		//div for the legend to appear on the page
		let div= L.DomUtil.create("div", "info legend");


		// set up the intervals
		let intervals = [-10, 10, 30, 50, 70, 90];
		//set the colors of intervals
		let colors = [
			"green",
			"#fc4903",
			"#fc8403",
			"#fcad03",
			"#cafc03",
			"red"
		];
		//loop through the intervals and the colors to generate a label
		//with a colored square for each interval
		for (var i= 0; i < intervals.length; i++) {
			//inner html that sets the square for each interval and label
			div.innerHTML += '<i style= "background:' +
				colors[i] +
				'"></i>' +
				intervals[i] +
				(intervals[i+1] ? "&ndash;" + intervals[i+1] + "km<br>" : "+ km");
			}
			return div;
};


//add legend to map
legend.addTo(myMap);







