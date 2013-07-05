/*
Autores:
 Carlos Martin-Cleto Jimenez (DNI: 50777523-D)
 Antonio Prada Blanco (DNI: 05303654-S)
*/

var latlngCurrent;
var latlngLast;
var markers = new Array();
var map;

$(function() {

  // Determine support for Geolocation
  if (navigator.geolocation) {
      // Locate position
      navigator.geolocation.getCurrentPosition(displayPosition, errorFunction);
  } else {
      alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
  }

  // Success callback function
  function displayPosition(pos){
    var mylat = pos.coords.latitude;
    var mylong = pos.coords.longitude;

  latlngCurrent = new google.maps.LatLng(mylat, mylong);

  latlngLast = new google.maps.LatLng(
    JSON.parse(localStorage.lastLat|| null), 
    JSON.parse(localStorage.lastLng|| null)
  );
  var myOptions = {
    zoom: 17,
    center: latlngCurrent,
    panControl: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: true,
    overviewMapControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  // load map
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  var styles = [
  {
    stylers: [
      { hue: "#4A615E" },
      { saturation: -20 }
    ]
  },{
    featureType: "road",
    elementType: "geometry",
    stylers: [
      { lightness: 100 },
      { visibility: "simplified" }
    ]
  },{
    featureType: "road",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  },{
    featureType: "poi",
    stylers: [
      { visibility: "off" }
    ]   
  }
];

map.setOptions({styles: styles});

//añadimos los marcadores al mapa y ajustamos el zoom a ellos
loadMapData();

//añade el html con las coordenadas y los eventos asociados
//al cambiar las coordenadas
fillPositionTable(latlngLast, latlngCurrent);

}

 


function fillPositionTable(latlng1, latlng2) {
  $("#positions").html(
    "<h3>posición anterior</h3>  \
      <ul class='list-style1'>\
        <li>latitud:<input type='text' id='inputLat1' value='" + latlng1.lat() + "' /></li>\
        <li class='first'>longitud: <input type='text' id='inputLng1' value='" + latlng1.lng() + "' /></li>\
      </ul>\
      <h3>posición actual</h3>  \
      <ul class='list-style1'>\
        <li>latitud:<input type='text' id='inputLat2' value='" + latlng2.lat() + "' /></li>\
        <li class='first'>longitud: <input type='text' id='inputLng2' value='" + latlng2.lng() + "' /></li>\
      </ul>\
      <h3 id='distancia'>distancia: <span id='distance'>0</span>m</h3>");

  
  $("#inputLat1").on('keyup', function() {
      latlngLast = new google.maps.LatLng(parseFloat($("#inputLat1").val()), latlngLast.lng()); 
      //cada vez que cambiamos una coordenada debemos borrar todos los 
      //markers y añadirlos de nuevo
      clearMapData();
      loadMapData(); 
        $("#distance").html(getDistanceInMeters());

  });
  $("#inputLng1").on('keyup', function() {
      latlngLast = new google.maps.LatLng(latlngLast.lat(), parseFloat($("#inputLng1").val())); 
      clearMapData();
      loadMapData(); 
        $("#distance").html(getDistanceInMeters());

  });
  $("#inputLat2").on('keyup', function() {
      latlngCurrent = new google.maps.LatLng(parseFloat($("#inputLat2").val()), latlngCurrent.lng());
      clearMapData();
      loadMapData(); 
        $("#distance").html(getDistanceInMeters());

  });
  $("#inputLng2").on('keyup', function() {
      latlngCurrent = new google.maps.LatLng(latlngCurrent.lat(), parseFloat($("#inputLng2").val())); 
      clearMapData();
      loadMapData(); 
        $("#distance").html(getDistanceInMeters());
  });
  $("#distance").html(getDistanceInMeters());

}

//funcion auxiliar que elimina todos los marcadores del mapa
function clearMapData() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function getDistanceInMeters() {
  var lat1 = latlngLast.lat();
  var lat2 = latlngCurrent.lat();
  var lon1 = latlngLast.lng();
  var lon2 = latlngCurrent.lng();

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return Math.round(d*1000);
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}




function loadMapData() {
  //Add markers
  markers[0] = new google.maps.Marker({
   position: latlngLast, 
   map: map, 
   title:"You were here"
  });
  var infoWindowsLast = new google.maps.InfoWindow({
    content: "Aqui estabas..."
  });
  google.maps.event.addListener(markers[0], 'mouseover', function() {
    infoWindowsLast.open(map,markers[0]);
  })
  google.maps.event.addListener(markers[0], 'mouseout', function() {
    infoWindowsLast.close();
  })
  markers[1] = new google.maps.Marker({
   position: latlngCurrent, 
   map: map, 
   title:"You are here"
  });
  var infoWindowsCurrent = new google.maps.InfoWindow({
    content: "Aqui estas!"
  });
  google.maps.event.addListener(markers[1], 'mouseover', function() {
    infoWindowsCurrent.open(map, markers[1]);
  })
  google.maps.event.addListener(markers[1], 'mouseout', function() {
    infoWindowsCurrent.close();
  }) 

  //evitar zoom excesivo
  var blistener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
    if (map.getZoom() > 16){
        map.setZoom(16);
    }
    google.maps.event.removeListener(blistener);
  });
 
  //adaptar zoom 
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(latlngCurrent);
  bounds.extend(latlngLast);

  map.fitBounds(bounds);

  localStorage.lastLat = JSON.stringify(latlngCurrent.lat()); // mb = latitude
  localStorage.lastLng = JSON.stringify(latlngCurrent.lng()); // nb = longitude
}

  // Error callback function
  function errorFunction(pos) {
      alert('Error!');
  }
});