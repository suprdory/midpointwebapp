meetid=urlParams.get('meetid')
meetkey=urlParams.get('meetkey')

// load gmaps api + callback initMap
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=' + gmaps_api_key +'&callback=initMap';
script.async = false;
document.head.appendChild(script);

$("adduser").addEventListener("click", postuser, false);
getMeet(meetid);

function getMeet(meetid) {
    // meetdata={meetkey:meetkey};
    url='meet/' + meetid + '?meetkey=' +meetkey
    json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'},
      // body:JSON.stringify(meetdata)
    })
    .then(resp => resp.json())
    .then(data => setTitle(data))
}

function setTitle(meet){
$("title_id").innerHTML="Join " + meet.users[0].username + '\'s meet: ' + meet.meetname;
}


function postuser() {
  var un = $("username_id").value;
  var lat = $("lat_id").value;
  var lon = $("lon_id").value;
  var mode = $("gmode_id").value;
  if (un==''){
    alert('No User Name')
  } else {
    newuserdata={username:un,lon:lon,lat:lat,meetid:meetid,mode:mode};
    url='user?meetkey=' + meetkey;
    fetch(baseUrl+url,{
      method:'POST',
      body:JSON.stringify(newuserdata),
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(data=>{return data.json()})
    .then(res=>{console.log(res)})
    .then(error=>{console.log(error)})
    .then(function(){window.location.href = "/meetmap.html?meetid=" + meetid +'&meetkey='+meetkey})
  }
}
let Gmap,Gmarker

function initMap() {
  const LDNlatlng = { lat: 51.474061958491355, lng: -0.09071767330169678};
  Gmap = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: LDNlatlng,
  });
  createMarker(LDNlatlng)
  Gmap.addListener("click", (mapsMouseEvent) => {
    const lat =  mapsMouseEvent.latLng.lat();
    const lng =  mapsMouseEvent.latLng.lng();
    const latlng = {lat: lat,lng: lng }
    setusercoords(latlng)
    Gmarker.setMap(null);
    createMarker(latlng);
  });
  getLocation()
}

function createMarker(latlng) {
  let markerOptions = {
    position: latlng,
    map:Gmap,
    draggable: true
  };
  Gmarker = new google.maps.Marker(markerOptions);
  Gmarker.addListener('drag', handleDragEvent);
  Gmarker.addListener('dragend', handleDragEvent);
}

function handleDragEvent(event) {
  const lat =  event.latLng.lat();
  const lng =  event.latLng.lng();
  const latlng = {lat: lat, lng: lng };
  setusercoords(latlng);
}

function setusercoords(latlng){
    $('lat_id').value = latlng.lat
    $('lon_id').value = latlng.lng
  }

function geocentre(position){
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const latlng = { lat, lng }
  Gmap.setCenter(latlng)
  Gmarker.setMap(null);
  createMarker(latlng)
  setusercoords(latlng)
}

function getLocation() {
  const options = {
  enableHighAccuracy: true
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geocentre, showError, options)
  }
  else {
      console.log("Geolocation not available");
  }
}
function showError(error){
  console.log(error);
}
