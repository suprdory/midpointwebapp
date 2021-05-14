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

let Gmap, Gmarker, mpLatLng, mpMarker, mpType
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
$("meet_id").addEventListener("click", function () {
    window.location.href = 'meet.html?meetid=' + meetid + '&meetkey=' + meetkey
}, { passive: true });

$("add_id").addEventListener("click", function () {
    window.location.href = 'adduser.html?meetid=' + meetid + '&meetkey=' + meetkey
}, { passive: true });
$("invite_id").addEventListener("click", function () {
    copyLink(invite_url)
}, { passive: true });
$("reset_id").addEventListener("click", resetMidpoint, { passive: true });
$("share_mploc_id").addEventListener("click", setMidpoint, { passive: true });
$("home_id").addEventListener("click", function () {
    window.location.href = '/'
}, { passive: true });
$("invite_id").addEventListener("click", function () {
    copyLink(invite_url)
}, { passive: true });
$("share_meet_id").addEventListener("click", function () {
    copyLink(meet_url)
}, { passive: true });

$("showPlaces").addEventListener("click", togglePlaces, { passive: true });
$("showButtons").addEventListener("click", toggleButtons, { passive: true });

const locationsAvailable = $('locationList');
const buttons = $('topbuttons');

function toggleButtons() {
    let btn = $("showButtons")
    if (showButtons) {
        showButtons = false;
        buttons.style.display = "none"
        // btn.innerHTML = "Show Nearby Places"
        Gmap.fitBounds(getBounds(), getMapPadding())

    } else {
        // if (midPointExists) {
        showButtons = true;
        buttons.style.display = "block";
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
script2.src = 'https://maps.googleapis.com/maps/api/js?key=' + gmaps_api_key + '&libraries=places&callback=initMap';
script2.async = true;
document.head.appendChild(script2);

window.initMap = function () {
    // JS API is loaded and available
    Gmap = new google.maps.Map($("map"), {
        zoom: 10,
        center: LDNlatlng,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
    });
    // Gmap.setPadding(0,100,0,100);
    getMeet()
    getUsers('stored')

    // getUsers(meetid);
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
    for (let user of users) {
        // console.log(user.username)
        var uLatLng = {
            lat: user.lat,
            lng: user.lon
        }
        var userMarker = createMarker(uLatLng, user.username)
        userMarker.addListener('dragend', function (event) {
            handleUserDragEvent(event, user)
        }, { passive: true })
        UserMarkers.push(userMarker)
        Users.push(user)
        var contentString = "<b style=color:black;>" + user.username + "</b>";
        const infowindow = new google.maps.InfoWindow({
            content: contentString,
        });
        infowindow.open(Gmap, userMarker)
        // infowindow.setStyle("background-color:black")
        Infos.push(infowindow);
    }
    if (nUsers > 1) {
        getMidPoint(meetid, mpMethod)
    } else {
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
    console.log(patchdata)
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
            console.log(res)
        })
        .then(error => {
            console.log(error)
        })

    Gmap.fitBounds(getBounds(), getMapPadding())

    // updateMidPoint(latLng);
    // setMidpoint();
}


function getMidPoint(meetid, mpMethod) {
    console.log('getMidpoint:start', mpMethod)
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
    console.log('Gmap.setCenter:start',meetid)
    Gmap.setCenter(latLng)
    console.log('Gmap.setCenter:start',meetid)
    let markerOptions = {
        position: latLng,
        map: Gmap,
        title: 'MidPoint',
        clickable: true,
        draggable: true
    };
    mpMarker = new google.maps.Marker(markerOptions);
    mpMarker.setAnimation(google.maps.Animation.BOUNCE)
    // mpMarker.addListener('drag', handleDragEvent);
    mpMarker.addListener('dragend', handleDragEvent, { passive: true });
    mpLatLng = latLng
    updateRoutes();
    midPointExists = true
    $("showPlaces").classList.remove("inactive")
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
        type: ['restaurant'],
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
    // padding fro map for fitBounds from top "buttons" row and bottom "places" elements
    let buttonRect = $("topbuttons").getBoundingClientRect()
    let locationRect = $("nearbyPlaces").getBoundingClientRect()
    let infoWindowHeight = 75 // px
    let mapPadding = {
        top: buttonRect.bottom + infoWindowHeight,
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
    places.length = 10
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
    mpMarker.setPosition(mpLatLng)
    updateRoutes();
    if (showPlaces) {
        nearbyPlaces();
    }
}


function updateInfoWindow(uix, response) {
    let user = Users[uix]
    let contentString = '<b style=color:black;">' + user.username + '<br>' + response.routes[0].legs[0].duration.text + '</b>'
    Infos[uix].setContent(contentString);
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

function createMarker(latlng, name) {
    let markerOptions = {
        position: latlng,
        map: Gmap,
        title: name,
        label: name.charAt(0),
        clickable: true,
        draggable: true
    };
    var newMarker = new google.maps.Marker(markerOptions);
    // bounds.extend(latlng);
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
