import {newMeetHandlerLS, updateListLS,clearBadMeetsLS } from './localStorageMod.js'

function wakeServer() {
    fetch(baseUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
    })
        .then(resp => resp.json())
        .catch((error) => {
            console.log('Server Woken?', error)})
        }


function newMeetonEnter(e){
    if (e.key == "Enter") {
        newmeet();
      }
}
document.getElementById("meetname_id").addEventListener("keypress", newMeetonEnter, { passive: true });
document.getElementById("submit_id").addEventListener("click", newmeet, { passive: true })

function newmeet() {
  // event.preventDefault()
  var mn = document.getElementById("meetname_id").value;
  // var mptype = document.getElementById("mptype-select").value;
  var mptype = 'temporal'
  if (mn == "") {
    
    alert("Enter meet name")
  } else {
    
    // ask user to wait (API server may take time to wake) and disable further clicks, enters
    document.getElementById("submit_id").innerHTML="Wait...";
    document.getElementById("submit_id").removeEventListener("click", newmeet);
    document.getElementById("meetname_id").removeEventListener("keypress",newMeetonEnter(e));

    var newmeetdata = {
      meetname: mn,
      mptype: mptype
    };
    // var pw = document.getElementById("password_id").value;
    // url='meet' + '?pw=' + pw;
    var url = 'meet'
    fetch(baseUrl + url, {
      method: 'POST',
      body: JSON.stringify(newmeetdata),
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then(data => opennewmeet(data))
      .catch((error) => {
        console.log('Something went wrong.', error);
        alert('Fail')
      });
  }
}

function opennewmeet(meet) {
  console.log(meet)
  if (meet.meetKey != null) {
    var meetid = meet.meetid;
    var meetKey = meet.meetKey;

    newMeetHandlerLS(meet, "id")
    updateListLS($('meetsList'));
    window.location.href = "/adduser.html?meetid=" + meetid +'&meetkey='+meetKey
  }
}

wakeServer()
// Previous meets 
clearBadMeetsLS();
updateListLS($('meetsList'));
