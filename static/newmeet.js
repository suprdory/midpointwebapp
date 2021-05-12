import {getMeetsArray} from './localStorageMod.js'

document.getElementById("meetname_id").addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
       newmeet();
   }
},{passive: true});
document.getElementById("submit_id").addEventListener("click",newmeet,{passive: true})

function newmeet() {
  // event.preventDefault()
  var mn = document.getElementById("meetname_id").value;
  // var mptype = document.getElementById("mptype-select").value;
  var mptype='temporal'
  if (mn=="") {
    alert("Enter meet name")
  } else {
    var newmeetdata={
      meetname:mn,
      mptype:mptype
    };
    // var pw = document.getElementById("password_id").value;
    // url='meet' + '?pw=' + pw;
    var url='meet'
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
    var meetid=meet.meetid;
    var meetKey=meet.meetKey;

    var newMeet={
      'name': meet.meetname,
      'id' : meet.meetid,
      'key': meet.meetKey,
      'date': new Date().toUTCString()
    }
    newMeetHandler(newMeet, "id")

    window.location.href = "/adduser.html?meetid=" + meetid +'&meetkey='+meetKey
  }
}

// Previous meets 
function updateList() {
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild)
  }
  meetsArray.slice().reverse().forEach((meet) => {
    var liurl = "/meetmap.html?meetid=" + meet.id + '&meetkey=' + meet.key;
    liMaker(meet.name + ' ' + meet.date,liurl );
  })
}

function liMaker(text,liurl) {
  const li = document.createElement('li')
  var a = document.createElement('a')
  // a.textContent = text
  // a.href = liurl
  li.appendChild(a)
  a.className = "meetlistelement"
  ul.appendChild(li)
}

function newMeetHandler(newMeet, key) {
  console.log('New Meet', newMeet)
  //remove matching items
  for (var i = meetsArray.length - 1; i >= 0; i--) {
    var meet = meetsArray[i]
    console.log(meet[key])
    console.log(newMeet[key])
    if (meet[key] == newMeet[key]) {
      meetsArray.splice(i, 1)
      console.log(meet, "match")
    }
  }
  meetsArray.push(newMeet);
  console.log(meetsArray)
  localStorage.setItem('meets', JSON.stringify(meetsArray))
}

const ul = document.querySelector('ul')
var meetsArray = getMeetsArray();
updateList();
