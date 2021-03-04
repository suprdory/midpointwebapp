const meetid=urlParams.get('meetid')
const meetkey=urlParams.get('meetkey')

let Gmap,Gmarker,mpLatLng,mpMarker
let Users=[], UserMarkers=[]; Infos=[]; dirRends=[]
const LDNlatlng = { lat: 51.474061958491355, lng: -0.09071767330169678};

$("meet_id").href='meet.html?meetid='+meetid+'&meetkey='+meetkey
$("add_id").href='adduser.html?meetid='+meetid+'&meetkey='+meetkey
$("invite_id").addEventListener("click", copyInvite, false);
$("reset_id").addEventListener("click", resetMidpoint, false);
$("set_id").addEventListener("click", setMidpoint, false);

if (window.location.port==""){
  invite_url=window.location.hostname + "/adduser.html?meetid="+meetid+"&meetkey="+meetkey;
} else {
  invite_url=window.location.hostname + ":" +window.location.port + "/adduser.html?meetid="+meetid+"&meetkey="+meetkey;
}
// load gmaps api + callback to initMap
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=' + gmaps_api_key +'&callback=initMap';
script.async = false;
document.head.appendChild(script);

function setMidpoint(){
    newMPdata={midpoint_lon:mpLatLng.lng,midpoint_lat:mpLatLng.lat};
    url='midpoint/'+meetid+'/drag?meetkey=' + meetkey;
    fetch(baseUrl+url,{
      method:'PATCH',
      body:JSON.stringify(newMPdata),
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(data=>data.json())
    .then(res=> console.log(res))
    .then(error=>console.log(error))
    // .then(function(){window.location.href = "/meetmap.html?meetid=" + meetid +'&meetkey='+meetkey})

}

function resetMidpoint(){
  mpMarker.setMap(null);
  getUsers('geometric')
}

function copyInvite() {
  var textArea = document.createElement("textarea");
  textArea.value = invite_url
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
    alert("Copied invite link: " + textArea.value);
  } catch (err) {
    console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
}

function initMap() {
  Gmap = new google.maps.Map(document.getElementById("mmap"), {
    zoom: 14,
    center: LDNlatlng,
  });
  getUsers('stored')
  // getUsers(meetid);
}
function getUsers(mpMethod) {
  url='meetusers/' + meetid +'?meetkey='+meetkey
    json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp => resp.json())
    .then(data => processUsers(data,mpMethod))
}

function processUsers(users,mpMethod){
  let nUsers=users.length
  for(user of users) {
    console.log(user.username)
    uLatLng={lat:user.lat,lng:user.lon}
    userMarker=createMarker(uLatLng,user.username)
    UserMarkers.push(userMarker)
    Users.push(user)

    contentString="<b style=color:black;>"+user.username+"</b>";
    const infowindow = new google.maps.InfoWindow({
      content: contentString,});
    infowindow.open(Gmap, userMarker)
    // infowindow.setStyle("background-color:black")
    Infos.push(infowindow);
  }
  if (nUsers>1){
    getMidPoint(meetid,mpMethod)
  }
  else {
    Gmap.setCenter(uLatLng)
  }
}

function getMidPoint(meetid,mpMethod) {
  console.log(meetid)
  url='midpoint/' + meetid +'/'+ mpMethod +'?meetkey='+meetkey
  fetch(baseUrl + url,{
    method:'GET',
    headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp => resp.json())
    .then(data => initMidPoint({
      lat:data.midpoint_lat,lng:data.midpoint_lon}))
}

function initMidPoint(latLng){
  Gmap.setCenter(latLng)
  let markerOptions = {
    position: latLng,
    map:Gmap,
    title:'MidPoint',
    clickable: true,
    draggable: true
  };
  mpMarker = new google.maps.Marker(markerOptions);
  mpMarker.setAnimation(google.maps.Animation.BOUNCE)
  // mpMarker.addListener('drag', handleDragEvent);
  mpMarker.addListener('dragend', handleDragEvent);
  mpLatLng=latLng
  updateRoutes();
}

function handleDragEvent(event){
  const lat =  event.latLng.lat();
  const lng =  event.latLng.lng();
  const latLng = {lat: lat, lng: lng };
  updateMidPoint(latLng);
  Gmap.fitBounds(bounds);
}

function updateMidPoint(latLng){
  mpLatLng=latLng
  updateRoutes();
}

function updateRoutes(){
  bounds = new google.maps.LatLngBounds();
  for (dirRend of dirRends){
    dirRend.setMap(null)
  }
  for (i=0;i<Users.length;i++){
    user=Users[i];
    uLatLng={lat:user.lat,lng:user.lon};
    bounds.extend(uLatLng)
    plotRoute(uLatLng,mpLatLng,user.userid,user.gRouteMode,i);
  }
  bounds.extend(mpLatLng)
}
function updateInfoWindow(uix,response) {
  user=Users[uix]

  contentString='<b style=color:black;">' +user.username + '<br>' + response.routes[0].legs[0].duration.text+'</b>'
      Infos[uix].setContent(contentString);
    }

function plotRoute(origin_ll,dest_ll,userid,usermode,uix) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  dirRends.push(directionsRenderer)
  var rendererOptions = {
  suppressMarkers: true,
  supressInfoWindows: true,
  preserveViewport: true,
  suppressBicyclingLayer: true,
}
  directionsRenderer.setMap(Gmap);
  directionsRenderer.setOptions(rendererOptions);
  directionsService.route(
  {
    origin: origin_ll,
    destination: dest_ll,
    travelMode: google.maps.TravelMode[usermode],
  },
  (response, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(response);
      patchuser(userid,response);
      updateInfoWindow(uix,response)
    } else {
      // window.alert("Directions request failed due to " + status);
    }
  }
  );
}

function createMarker(latlng,name) {
  let markerOptions = {
    position: latlng,
    map:Gmap,
    title:name,
    label:name.charAt(0),
    clickable: true,
    // draggable: true
  };
  newMarker = new google.maps.Marker(markerOptions);
  // bounds.extend(latlng);
  return newMarker
}

function patchuser(userid,resp) {
  console.log(resp)
  patchdata={
    gRoute:resp,
    gRouteStatus:resp.status,
    gRouteDuration:resp.routes[0].legs[0].duration.text,
    gRouteDistance:resp.routes[0].legs[0].distance.text,
  };
  url='/user/'+userid.toString()+'?meetkey='+meetkey;
  fetch(baseUrl+url,{
    method:'PATCH',
    body:JSON.stringify(patchdata),
    headers:{'Content-Type': 'application/json; charset=utf-8'}})
  .then(data=>{return data.json()})
  .then(res=>{console.log(res)})
  .then(error=>{console.log(error)})
  // window.location.href = "/web/meet/" + meet;
}
