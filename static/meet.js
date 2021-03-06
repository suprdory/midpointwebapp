meetid=urlParams.get('meetid')
meetkey=urlParams.get('meetkey')

$("adduser_id").href='adduser.html?meetid='+meetid+'&meetkey='+meetkey
$("meetmap_id").href='meetmap.html?meetid='+meetid+'&meetkey='+meetkey

function getMeet(meetid) {
    // meetdata={meetkey:meetkey};
    url='meet/' + meetid + '?meetkey=' +meetkey
    json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'},
      // body:JSON.stringify(meetdata)
    })
    .then(resp => resp.json())
    .then(data => populateMeetTable(data))
}

function clearUserList(){
  const parent = document.getElementById("userTable")
  while (parent.firstChild) {
      parent.firstChild.remove()
  }
}

function getUsers(meetid) {
    // newmeetdata={meetname:mn};
    clearUserList()
    url='meetusers/' + meetid + '?meetkey=' +meetkey
    json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp => resp.json())
    .then(data => populateUserTable(data))
}

function deleteuser(userid) {
  // console.log('deleteuser(' + userid + ')');
  url='user/' + userid.toString() + '?meetkey=' +meetkey
  fetch(baseUrl+url,{method:'DELETE'})
    // .then(data=>{return data.json()})
    .then(res=>{console.log(res)})
    .then(error=>{console.log(error)})
    .then(function(){getUsers(meetid)})
    // window.location.href = "/web/meet/{{meet.meetid}}";
  }
function deletemeet(meetid) {
    url='meet/' + meetid.toString() + '?meetkey=' +meetkey
    fetch(baseUrl+url,{method:'DELETE'})
      // .then(data=>{return data.json()})
      .then(res=>{console.log(res)})
      .then(error=>{console.log(error)})
      .then(function(){window.location.href = "/"})
    }

function populateMeetTable(data){
  console.log(data);
  var table = document.getElementById("meetTable");
  var row = table.insertRow(-1);
  var meetidtab = row.insertCell(0);
  var meetnametab = row.insertCell(1);
  var meetdate = row.insertCell(2);
  var mplon = row.insertCell(3);
  var mplat = row.insertCell(4);

  meetidtab.innerHTML = data.meetid;
  meetnametab.innerHTML = data.meetname;
  meetdate.innerHTML = data.date;
  mplon.innerHTML = parseFloat(data.midpoint_lon).toFixed(4);
  mplat.innerHTML = parseFloat(data.midpoint_lat).toFixed(4);
}

function populateUserTable(data){
  console.log(data);
  var table = document.getElementById("userTable");
  for (let d of data){
    var row = table.insertRow(-1);
    var useridtab = row.insertCell(0);
    var usernametab = row.insertCell(-1);
    var ulon = row.insertCell(-1);
    var ulat = row.insertCell(-1);
    var udur = row.insertCell(-1);
    var udist = row.insertCell(-1);
    var gMode = row.insertCell(-1);
    var udel = row.insertCell(-1);

    useridtab.innerHTML = d.userid;
    usernametab.innerHTML = d.username;
    ulon.innerHTML = parseFloat(d.lon).toFixed(4);
    ulat.innerHTML = parseFloat(d.lat).toFixed(4);
    udur.innerHTML =d.gRouteDuration;
    udist.innerHTML = d.gRouteDistance;
    gMode.innerHTML = d.gRouteMode;

    let btn = document.createElement("a");
    btn.className = 'mapbutton'
    btn.textContent = "Delete"
    btn.id = "btn" + d.userid;
    // btn.addEventListener("click",deleteuser.bind(this,d.userid));
    btn.addEventListener("click",function(){deleteuser(d.userid)});
    udel.appendChild(btn)
  }
}

getMeet(meetid);
getUsers(meetid);
