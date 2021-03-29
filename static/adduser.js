meetid = urlParams.get('meetid')
meetkey = urlParams.get('meetkey')
let Gmap, Gmarker

// load gmaps api + callback initMap
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=' + gmaps_api_key + '&libraries=places&callback=initMap';
script.async = false;
document.head.appendChild(script);

$("join_id").addEventListener("click", postuser, false);
$("view_id").href = 'meetmap.html?meetid=' + meetid + '&meetkey=' + meetkey
$("username_id").addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        $("username_id").blur();
    }
});

$("done_id").addEventListener("click", function() {
    $('enterName').style.display = "inline-block";
    $('chooseStart').style.display = "none";

}, false);

getMeet(meetid);

function getMeet(meetid) {
    // meetdata={meetkey:meetkey};
    url = 'meet/' + meetid + '?meetkey=' + meetkey
    json = fetch(baseUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            // body:JSON.stringify(meetdata)
        })
        .then(resp => resp.json())
        .then(data => setTitle(data))
}

function setTitle(meet) {
    if (meet.users.length > 0) {
        // console.log(meet.users.length>0)
        titText = "Join " + meet.users[0].username + '\'s meet: ' + meet.meetname;
    } else {
        titText = "Join " + meet.meetname;
    }
    $("title_id").innerHTML = titText
}


function postuser() {
    var un = $("username_id").value;
    var lat = $("lat_id").value;
    var lon = $("lon_id").value;
    var mode = $("gmode_id").value;
    if (un == '') {
        alert('No User Name')
    } else {
        newuserdata = {
            username: un,
            lon: lon,
            lat: lat,
            meetid: meetid,
            mode: mode
        };
        url = 'user?meetkey=' + meetkey;
        fetch(baseUrl + url, {
                method: 'POST',
                body: JSON.stringify(newuserdata),
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
            .then(function() {
                window.location.href = "/meetmap.html?meetid=" + meetid + '&meetkey=' + meetkey
            })
    }
}

function mapClickHandler(mapsMouseEvent) {
    const lat = mapsMouseEvent.latLng.lat();
    const lng = mapsMouseEvent.latLng.lng();
    const latlng = {
        lat: lat,
        lng: lng
    }
    setusercoords(latlng)
    Gmarker.setMap(null);
    createMarker(latlng);
}

function initMap() {
    const LDNlatlng = {
        lat: 51.474061958491355,
        lng: -0.09071767330169678
    };
    Gmap = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: LDNlatlng,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
    });
    createMarker(LDNlatlng)
    Gmap.addListener("click", (mapsMouseEvent) => {
        mapClickHandler(mapsMouseEvent)
    });

    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    // Bias the SearchBox results towards current map's viewport.
    Gmap.addListener("bounds_changed", () => {
        searchBox.setBounds(Gmap.getBounds());
    });
    let markers = [];
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            setusercoords(latLng2json(place.geometry.location))
            Gmarker.setMap(null);
            createMarker(place.geometry.location);

        });

        Gmap.fitBounds(bounds);
    });

    getLocation()
}

function createMarker(latlng) {
    let markerOptions = {
        position: latlng,
        map: Gmap,
        draggable: true
    };
    Gmarker = new google.maps.Marker(markerOptions);
    Gmarker.addListener('drag', handleDragEvent);
    Gmarker.addListener('dragend', handleDragEvent);
}

function handleDragEvent(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const latlng = {
        lat: lat,
        lng: lng
    };
    setusercoords(latlng);
}

function latLng2json(latLng) {
    const latLngjson = {
        lat: latLng.lat(),
        lng: latLng.lng()
    };
    return latLngjson;
}

function setusercoords(latLng) {
    console.log(latLng)
    $('lat_id').value = latLng.lat
    $('lon_id').value = latLng.lng
}

function geocentre(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const latlng = {
        lat,
        lng
    }
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
    } else {
        console.log("Geolocation not available");
    }
}

function showError(error) {
    console.log(error);
}
