import { newMeetHandlerLS,deleteMeetLS } from './localStorageMod.js'
const meetid = urlParams.get('meetid')
const meetkey = urlParams.get('meetkey')
// allow for generating share link while testing on localhost:5000
if (window.location.port == "") {
    // import {gmaps_api_key} from './setkey.js'
    var invite_url = window.location.hostname + "/adduser.html?meetid=" + meetid + "&meetkey=" + meetkey;
    var meet_url = window.location.hostname + "/meetmap.html?meetid=" + meetid + "&meetkey=" + meetkey;
} else {
    // import {gmaps_api_key} from './setkeylocal.js';
    var invite_url = window.location.hostname + ":" + window.location.port + "/adduser.html?meetid=" + meetid + "&meetkey=" + meetkey;
    var meet_url = window.location.hostname + ":" + window.location.port + "/meetmap.html?meetid=" + meetid + "&meetkey=" + meetkey;
}

let Gmap, mpLatLng, mpMarker, mpType,lastMod
let Users = [],
    UserMarkers = [];
var Infos = [];
var dirRends = []
const LDNlatlng = {
    lat: 51.474061958491355,
    lng: -0.09071767330169678
};
var showPlaces = false
var showButtons = false
var midPointExists = false

// setup DOM elements
$("add_id").addEventListener("click", function () {
    window.location.href = 'adduser.html?meetid=' + meetid + '&meetkey=' + meetkey
}, { passive: true });

$("invite_id").addEventListener("click", function () {
    copyLink(invite_url)
}, { passive: true });

$("share_meet_id").addEventListener("click", function () {
    copyLink(meet_url)
}, { passive: true });

$("share_mploc_id").addEventListener("click", setMidpoint, { passive: true });

$("reset_id").addEventListener("click", resetMidpoint, { passive: true });

$("meet_id").addEventListener("click", function () {
    window.location.href = 'meet.html?meetid=' + meetid + '&meetkey=' + meetkey
}, { passive: true });

$("home_id").addEventListener("click", function () {
    window.location.href = '/'
}, { passive: true });


$("showPlaces").addEventListener("click", togglePlaces, { passive: true });
$("showButtons").addEventListener("click", toggleButtons, { passive: true });

const locationsAvailable = $('locationList');
const buttons = $('topbuttons');

function toggleButtons() {
    let btn = $("showButtons")
    if (showButtons) {
        showButtons = false;
        buttons.style.display = "none";
        $("expand_id").src = "/static/img/expand_more_black_48dp.svg";
        // btn.innerHTML = "Show Nearby Places"
        Gmap.fitBounds(getBounds(), getMapPadding())

    } else {
        // if (midPointExists) {
        showButtons = true;
        buttons.style.display = "block";
        $("expand_id").src = "/static/img/expand_less_black_48dp.svg";
        // nearbyPlaces()
        // btn.innerHTML = "Hide Nearby Places"
        Gmap.fitBounds(getBounds(), getMapPadding())
    }
}


function togglePlaces() {
    let btn = $("showPlaces")
    if (showPlaces) {
        showPlaces = false;
        locationsAvailable.style.display = "none"
        btn.innerHTML = "Show Nearby Places"
        Gmap.fitBounds(getBounds(), getMapPadding())

    } else {
        if (midPointExists) {
            showPlaces = true;
            locationsAvailable.style.display = "block"
            nearbyPlaces()
            btn.innerHTML = "Hide Nearby Places"
        }
    }
}

// load gmaps api + callback to initMap + places library
var script2 = document.createElement('script');
script2.src = 'https://maps.googleapis.com/maps/api/js?key=' + gmaps_api_key + '&libraries=places,marker&callback=initMap';
script2.async = true;
document.head.appendChild(script2);

setInterval(userUpdateCheckTimer, 5000);
// const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
function userUpdateCheckTimer() {
    // console.log(' each 5 second...');
    getMeetlastmod()
}

window.initMap = function () {
    // JS API is loaded and available
    Gmap = new google.maps.Map($("map"), {
        zoom: 10,
        mapId:'meet_map_id',
        center: LDNlatlng,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
    });
    // Gmap.setPadding(0,100,0,100);
    getMeet()
    getUsers('stored')
}

function getMeetlastmod() {
    var url = 'meet/' + meetid + '?meetkey=' + meetkey
    var json = fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(resp => resp.json())
        .then(data => checkForUserUpdate(data.lastmod))
}

function checkForUserUpdate(newlastmod) {
    var usersupdated=(lastMod!=newlastmod)
    // console.log(usersupdated)
    if (usersupdated) {
        alert("Users updated!");
        // mpMarker.setMap(null);
        // getUsers('stored');
                lastMod=newlastmod
                resetMidpoint()

    }
}

function getMeet() {
    var url = 'meet/' + meetid + '?meetkey=' + meetkey
    var json = fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(resp => resp.json())
        .then(data => processMeet(data))
}

function processMeet(meet) {
    mpType = meet.mptype;
    lastMod = meet.lastmod;
    // console.log('current meet',data)
    if (!meet.meetid) {
        deleteMeetLS(meetid);
        alert("meet:" + meetid + ' not available')
    }
    newMeetHandlerLS(meet);
}

function clearUserMarkers() {
    while (UserMarkers.length) {
        UserMarkers.pop().setMap(null);
    }
}

function getUsers(mpMethod) {
    var url = 'meetusers/' + meetid + '?meetkey=' + meetkey
    var json = fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(resp => resp.json())
        .then(data => processUsers(data, mpMethod))
}

function processUsers(users, mpMethod) {
    clearUserMarkers();
    let nUsers = users.length
    Users = []
    Infos = []
    let ux=0
    for (let user of users) {
        // console.log(user.username)
        var uLatLng = {
            lat: user.lat,
            lng: user.lon
        }
        var userMarker = createMarker(uLatLng, user.username,ux)
        ux+=1
        userMarker.addListener('dragend', function (event) {
            handleUserDragEvent(event, user)
        }, { passive: true })
        UserMarkers.push(userMarker)
        Users.push(user)
        var contentString = '<p class="infowindow">' + user.username + "</p>";
        // var contentString = "test"
        const infowindow = new google.maps.InfoWindow({
            content: contentString,
            headerDisabled: true,
        });
        infowindow.open(Gmap, userMarker)
        // infowindow.setStyle("background-color:black")
        Infos.push(infowindow);
    }
    if (nUsers > 1) {
        getMidPoint(meetid, mpMethod)
    } else {
        toggleButtons();
        Gmap.setCenter(uLatLng)
    }
}

function handleUserDragEvent(event, user) {
    //console.log
    user.lon = event.latLng.lng();
    user.lat = event.latLng.lat();
    var patchdata = {
        lat: event.latLng.lat(),
        lon: event.latLng.lng(),
    };
    // console.log(patchdata)
    var url = '/user/' + user.userid.toString() + '?meetkey=' + meetkey;
    fetch(baseUrl + url, {
        method: 'PATCH',
        body: JSON.stringify(patchdata),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(data => {
            return data.json()
        })
        .then(res => {
            // console.log(res)
        })
        .then(error => {
            console.log(error)
        })
    resetMidpoint()
    Gmap.fitBounds(getBounds(), getMapPadding())

    // updateMidPoint(latLng);
    // setMidpoint();
}


function getMidPoint(meetid, mpMethod) {
    // console.log('getMidpoint:start', mpMethod)
    var url = 'midpoint/' + meetid + '/' + mpMethod + '?meetkey=' + meetkey
    fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(resp => resp.json())
        .then(data => initMidPoint({
            lat: data.midpoint_lat,
            lng: data.midpoint_lon
        }))
    // console.log('getMidpoint:end', meetid)
}

function initMidPoint(latLng) {
    // console.log('Gmap.setCenter:start',meetid)
    Gmap.setCenter(latLng)
    // console.log('Gmap.setCenter:start',meetid)
    let markerOptions = {
        position: latLng,
        map: Gmap,
        title: 'MidPoint',
        gmpClickable: true,
        gmpDraggable: true
    };
    mpMarker = new google.maps.marker.AdvancedMarkerElement(markerOptions);
    mpMarker.content.classList.add("bounce")
    // mpMarker.addListener('drag', handleDragEvent);
    mpMarker.addListener('dragend', handleDragEvent, { passive: true });
    mpLatLng = latLng
    updateRoutes();
    midPointExists = true
    // console.log($("showPlaces").classList)
    $("showPlaces").classList.remove("disabled")
    $("showPlaces").classList.add("enabled")
    // console.log($("showPlaces").classList)
    if (showPlaces) {
        nearbyPlaces();
    }
}

function updateRoutes() {
    for (let dirRend of dirRends) {
        dirRend.setMap(null)
    }
    for (let i = 0; i < Users.length; i++) {
        var user = Users[i];
        var uLatLng = {
            lat: user.lat,
            lng: user.lon
        };
        plotRoute(uLatLng, mpLatLng, user.userid, user.gRouteMode, i);
    }
    Gmap.fitBounds(getBounds(), getMapPadding());
}

function getBounds() {
    var bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < Users.length; i++) {
        var user = Users[i];
        var uLatLng = {
            lat: user.lat,
            lng: user.lon
        };
        bounds.extend(uLatLng);
    }
    bounds.extend(mpLatLng)
    return bounds;

}

function nearbyPlaces() {
    var request = {
        location: mpLatLng,
        // radius: '1000',
        type: ['bar'],
        rankBy: google.maps.places.RankBy.DISTANCE,
    };

    let service = new google.maps.places.PlacesService(Gmap);
    service.nearbySearch(request, callback);

    function callback(places) {
        // console.log('PLACES')
        // console.log(places)
        populatePlaces(places);
    }
}

function getMapPadding() {
    // padding for map for fitBounds from top "buttons" row and bottom "places" elements
    // let buttonRect = $("topbuttons").getBoundingClientRect()
    let locationRect = $("nearbyPlaces").getBoundingClientRect()
    let infoWindowHeight = 75 // px
    let mapPadding = {
        top: infoWindowHeight,
        bottom: locationRect.height,
    }
    // console.log(mapPadding)
    return mapPadding
}

function setMidpoint() {
    let newMPdata = {
        midpoint_lon: mpLatLng.lng,
        midpoint_lat: mpLatLng.lat
    };
    let url = 'midpoint/' + meetid + '/drag?meetkey=' + meetkey;
    fetch(baseUrl + url, {
        method: 'PATCH',
        body: JSON.stringify(newMPdata),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(data => data.json())
        .then(res => console.log(res))
        .then(error => console.log(error))
    if (showPlaces) {
        nearbyPlaces();
    }

    let gmap_url = 'http://www.google.com/maps/place/' +
        mpLatLng.lat + ',' +
        mpLatLng.lng

    copyLink(gmap_url)

}

function removeAddressCards() {
    if (locationsAvailable.hasChildNodes()) {
        while (locationsAvailable.firstChild) {
            locationsAvailable.removeChild(locationsAvailable.firstChild);
        }
    }
}

function populatePlaces(places) {
    //display first 10 places
    // places.length = 10
    removeAddressCards()
    // const placesTitle = document.createElement('a');
    // placesTitle.innerHTML="Nearby Places:"
    // placesTitle.className="darktext"
    // locationsAvailable.appendChild(placesTitle)

    for (let place of places) {
        const addressCard = document.createElement('div');
        const input = document.createElement('a');

        input.classList.add("placecard");

        input.innerHTML = place.name;
        input.setAttribute("id", place.place_id);
        addressCard.appendChild(input);

        let placeLatLng = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        }

        addressCard.addEventListener("click",
            function () {
                updateMidPoint(placeLatLng)
                // Gmap.setCenter(placeLatLng)
                // Gmap.setZoom(18)
                Gmap.fitBounds(getBounds(), getMapPadding())
            }, { passive: true })

        locationsAvailable.appendChild(addressCard)
    }
    // Gmap.setZoom(18)
    Gmap.fitBounds(getBounds(), getMapPadding())
}

function resetMidpoint() {
    mpMarker.setMap(null);
    // getUsers('geometric')
    getUsers(mpType)
}

function copyLink(targetUrl) {
    var textArea = document.createElement("textarea");
    textArea.value = targetUrl
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
        alert("Copied link: " + textArea.value);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}


function handleDragEvent(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const latLng = {
        lat: lat,
        lng: lng
    };
    updateMidPoint(latLng);
    Gmap.fitBounds(getBounds(), getMapPadding())
    // setMidpoint();
}

function updateMidPoint(latLng) {
    mpLatLng = latLng
    // mpMarker.setPosition(mpLatLng)
    updateRoutes();
    if (showPlaces) {
        nearbyPlaces();
    }
}


function updateInfoWindow(uix, response) {
    let user = Users[uix]
    let contentString = '<h4 class="infowindow">' + user.username + '<br>' + response.routes[0].legs[0].duration.text + '</h4>'
    // const contentString = `
//   <div style="margin: 0; padding: 0; line-height: 1.2; font-size: 14px;">
//     <p style="margin: 0;">Line 1 of text</p>
//     <p style="margin: 0;">Line 2 of text</p>
//   </div>
// `;
    Infos[uix].setContent(contentString);
    // Infos[uix].setContent();
    // let contentString = "test"
    // Infos[uix].setContent("<div style = 'display:inline-block'>" + "Test2" + "</div>");
}

function plotRoute(origin_ll, dest_ll, userid, usermode, uix) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    dirRends.push(directionsRenderer)
    var rendererOptions = {
        suppressMarkers: true,
        supressInfoWindows: true,
        preserveViewport: true,
        suppressBicyclingLayer: true,
        polylineOptions:{
            strokeColor:googleColors[(2+uix)%3],
            strokeOpacity: 0.7,     // Opacity of the route line
            strokeWeight: 6         // Thickness of the route line
        }
    }
    directionsRenderer.setMap(Gmap);
    directionsRenderer.setOptions(rendererOptions);
    directionsService.route({
        origin: origin_ll,
        destination: dest_ll,
        travelMode: google.maps.TravelMode[usermode],
    },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
                patchuser(userid, response);
                updateInfoWindow(uix, response)
            } else {
                // window.alert("Directions request failed due to " + status);
            }
        }
    );
}

const googleColors = [
    "#4285F4",  // Blue
    // "#DB4437",  // Red
    "#F4B400",  // Yellow
    "#0F9D58"   // Green
  ];
  const darkenedGoogleColors20 = [
    "#3367C1",  // Dark Blue
    // "#AC352C",  // Dark Red
    "#C49000",  // Dark Yellow
    "#0C7A46"   // Dark Green
  ];
  const darkenedGoogleColors40 = [
    "#254A91",  // Dark Blue
    // "#8B271F",  // Dark Red
    "#8F6C00",  // Dark Yellow
    "#095735"   // Dark Green
  ];
  const lightenedGoogleColors40 = [
    "#86B7FF",  // Light Blue
    // "#FF7B6F",  // Light Red
    "#FFD966",  // Light Yellow
    "#52C88A"   // Light Green
  ];
  const lightenedGoogleColors20 = [
    "#669DFD",  // Light Blue
    // "#E96E63",  // Light Red
    "#F7C84D",  // Light Yellow
    "#40B77A"   // Light Green
  ];
function createMarker(latlng, name,ux) {
    const pinTextGlyph = new google.maps.marker.PinElement({
        glyph: name[0],
        glyphColor: "black",
        background: googleColors[(2+ux)%3],
        borderColor: darkenedGoogleColors40[(2+ux)%3]
          });
    let markerOptions = {
        position: latlng,
        map: Gmap,
        title: name,
        content: pinTextGlyph.element,
        gmpClickable: true,
        gmpDraggable: true
    };
    var newMarker = new google.maps.marker.AdvancedMarkerElement(markerOptions);

    return newMarker
}

function patchuser(userid, resp) {
    // console.log(resp)
    let patchdata = {
        gRoute: resp,
        gRouteStatus: resp.status,
        gRouteDuration: resp.routes[0].legs[0].duration.text,
        gRouteDistance: resp.routes[0].legs[0].distance.text,
    };
    let url = '/user/' + userid.toString() + '?meetkey=' + meetkey;
    fetch(baseUrl + url, {
        method: 'PATCH',
        body: JSON.stringify(patchdata),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
        .then(data => {
            return data.json()
        })
    // .then(res=>{console.log(res)})
    // .then(error=>{console.log(error)})
    // window.location.href = "/web/meet/" + meet;
}
