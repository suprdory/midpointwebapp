import {newMeetHandlerLS, updateListLS,clearBadMeetsLS } from './localStorageMod.js'

document.getElementById("meetname_id").addEventListener("keypress", function (event) {
  if (event.keyCode == 13) {
    newmeet();
  }
}, { passive: true });
document.getElementById("submit_id").addEventListener("click", newmeet, { passive: true })

function newmeet() {
  // event.preventDefault()
  var mn = document.getElementById("meetname_id").value;
  // var mptype = document.getElementById("mptype-select").value;
  var mptype = 'temporal'
  if (mn == "") {
    alert("Enter meet name")
  } else {
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

// Previous meets 
clearBadMeetsLS();
updateListLS($('meetsList'));
