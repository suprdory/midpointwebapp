document.getElementById("meetname_id").addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
       newmeet();
   }
},{passive: true});
document.getElementById("submit_id").addEventListener("click",newmeet,{passive: true})

function newmeet() {
  // event.preventDefault()
  var mn = document.getElementById("meetname_id").value;
  var mptype = document.getElementById("mptype-select").value;
  if (mn=="") {
    alert("Enter meet name")
  } else {
    newmeetdata={
      meetname:mn,
      mptype:mptype
    };
    // var pw = document.getElementById("password_id").value;
    // url='meet' + '?pw=' + pw;
    url='meet'
    fetch(baseUrl+url,{
      method:'POST',
      body:JSON.stringify(newmeetdata),
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
      .then(response=>{
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then(data =>opennewmeet(data))
      .catch((error) => {
        console.log('Something went wrong.', error);
        alert('Fail')
      });
    }
  }

function opennewmeet(meet){
  console.log(meet)
  if (meet.meetKey != null){
    meetid=meet.meetid;
    meetKey=meet.meetKey;
    window.location.href = "/adduser.html?meetid=" + meetid +'&meetkey='+meetKey
  }
}


const LDNlatlng = {
    lat: 51.524061958491355,
    lng: -0.09071767330169678
};



var style = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]

// load gmaps api + callback to initMap + places library
var script2 = document.createElement('script');
script2.src = 'https://maps.googleapis.com/maps/api/js?key=' +
    gmaps_api_key + '&callback=initMap';
script2.async = true;
document.head.appendChild(script2);
function initMap() {
    Gmap = new google.maps.Map($("map"), {
        mapTypeControlOptions: {
            mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
        },
        zoom: 12,
        center: LDNlatlng,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl:false,
    });
    // Gmap.setOptions({style=feature:all|element:labels|visibility:off});
    const styledMapType = new google.maps.StyledMapType(style,{ name: "Styled Map" });
    Gmap.mapTypes.set("styled_map", styledMapType);
    Gmap.setMapTypeId("styled_map");
}
