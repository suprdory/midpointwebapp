import { newMeetHandlerLS } from './localStorageMod.js'
var meetid=urlParams.get('meetid')
var meetkey=urlParams.get('meetkey')

let gRouteModes = [
    {text:'Walking', gName:'WALKING'},
    {text:'Cycling', gName:'BICYCLING'},
    {text:'Public Transport', gName:'TRANSIT'},
    {text:'Driving', gName:'DRIVING'}
]

let mptypes = [
  { text: 'Temporal', val: 'temporal' },
  { text: 'Spatial', val: 'spatial' },
]

$("adduser_id").href='adduser.html?meetid='+meetid+'&meetkey='+meetkey
$("meetmap_id").href='meetmap.html?meetid='+meetid+'&meetkey='+meetkey
$("deletemeet_id").addEventListener("click", function () { deletemeet(meetid) });

function getMeet(meetid) {
    // meetdata={meetkey:meetkey};
    let url='meet/' + meetid + '?meetkey=' +meetkey
    let json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'},
      // body:JSON.stringify(meetdata)
    })
    .then(resp => resp.json())
    .then(data => populateMeetTable(data))
}

function clearUserList() {
    const parent = document.getElementById("userTable")
    for (var i = 1; i < parent.rows.length;) {
        parent.deleteRow(i);
    }
}

function getUsers(meetid) {
    // newmeetdata={meetname:mn};
    clearUserList()
    let url='meetusers/' + meetid + '?meetkey=' +meetkey
    let json=fetch(baseUrl + url,{
      method:'GET',
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp => resp.json())
    .then(data => populateUserTable(data))
}

function deleteUser(userid) {
  // console.log('deleteuser(' + userid + ')');
  let url='user/' + userid.toString() + '?meetkey=' +meetkey
  fetch(baseUrl+url,{method:'DELETE'})
    // .then(data=>{return data.json()})
    .then(res=>{console.log(res)})
    .then(error=>{console.log(error)})
    .then(function(){getUsers(meetid)})
    // window.location.href = "/web/meet/{{meet.meetid}}";
  }
function deletemeet(meetid) {
    let url='meet/' + meetid.toString() + '?meetkey=' +meetkey
    fetch(baseUrl+url,{method:'DELETE'})
      // .then(data=>{return data.json()})
      .then(res=>{console.log(res)})
      .then(error=>{console.log(error)})
      .then(function(){window.location.href = "/"})
    }

function populateMeetTable(data){
  // console.log(data);
  var table = document.getElementById("meetTable");
  var row = table.insertRow(-1);
  var meetidtab = row.insertCell(0);
  var meetnametab = row.insertCell(1);
  var meetdate = row.insertCell(2);

  var mptypeSel = row.insertCell(3);
  var meetUpdate = row.insertCell(4);

  let mptypeInp = document.createElement("select")
  mptypeInp.className = 'mapbutton noclick'
  mptypeInp.id = "mptype"

  for (let mptype of mptypes) {
    var option = document.createElement("option");
    option.text = mptype.text;
    option.value = mptype.val;
    mptypeInp.add(option)
  }
  mptypeInp.value = data.mptype
  mptypeSel.appendChild(mptypeInp)
  // var mplon = row.insertCell(3);
  // var mplat = row.insertCell(4);

  meetidtab.innerHTML = data.meetid;
  meetnametab.innerHTML = data.meetname;
  meetdate.innerHTML = data.date;

  let ubtn = document.createElement("a");
  ubtn.className = 'mapbutton'
  ubtn.textContent = "Update"
  ubtn.id = "btnUpdate";
  ubtn.addEventListener("click", function () {updateMeet(data.meetid) });
  meetUpdate.appendChild(ubtn)

  // mptype.innerHTML = data.mptype;
  // mplon.innerHTML = parseFloat(data.midpoint_lon).toFixed(4);
  // mplat.innerHTML = parseFloat(data.midpoint_lat).toFixed(4);
}

function populateUserTable(data){
  // console.log(data);
  var table = document.getElementById("userTable");
  for (let d of data){
    var row = table.insertRow(-1);

    var useridtab = row.insertCell(0);
    var usernametab = row.insertCell(-1);

    let uNameInput = document.createElement("input")
    uNameInput.className = "mapbutton noclick"
    uNameInput.classList.add('narrow')
    console.log(uNameInput.classList)
    uNameInput.value = d.username
    uNameInput.id = "username" + d.userid;
    usernametab.appendChild(uNameInput)

    // var ulon = row.insertCell(-1);
    // var ulat = row.insertCell(-1);
    var udur = row.insertCell(-1);
    var udist = row.insertCell(-1);

    var gMode = row.insertCell(-1);
    let gModeInp = document.createElement("select")
    gModeInp.className = 'mapbutton narrow noclick'
    gModeInp.id="gMode"+d.userid

    for (let gmode of gRouteModes) {
        var option =  document.createElement("option");
        option.text = gmode.text;
        option.value = gmode.gName;
        gModeInp.add(option)
    }
    gModeInp.value=d.gRouteMode
    gMode.appendChild(gModeInp)

    var uUpdate = row.insertCell(-1);
    var udel = row.insertCell(-1);

    useridtab.innerHTML = d.userid;
    // ulon.innerHTML = parseFloat(d.lon).toFixed(4);
    // ulat.innerHTML = parseFloat(d.lat).toFixed(4);
    udur.innerHTML =d.gRouteDuration;
    udist.innerHTML = d.gRouteDistance;

    let ubtn = document.createElement("a");
    ubtn.className = 'mapbutton'
    ubtn.textContent = "Update"
    ubtn.id = "btnUpdate" + d.userid;
    ubtn.addEventListener("click",function(){updateUser(d.userid)});
    uUpdate.appendChild(ubtn)

    let btn = document.createElement("a");
    btn.className = 'mapbutton'
    btn.textContent = "Delete"
    btn.id = "btn" + d.userid;
    btn.addEventListener("click",function(){deleteUser(d.userid)});
    udel.appendChild(btn)
  }
}

function updateUser(userid) {
  let patchdata={
    username:$("username"+userid).value,
    gRouteMode:$("gMode"+userid).value,
  };
  console.log(patchdata)
  let url='/user/'+userid.toString()+'?meetkey='+meetkey;
  fetch(baseUrl+url,{
    method:'PATCH',
    body:JSON.stringify(patchdata),
    headers:{'Content-Type': 'application/json; charset=utf-8'}})
  .then(data=>{return data.json()})
  .then(res=>{console.log(res)})
  // .then(error=>{console.log(error)})
  // window.location.href = "/web/meet/" + meet;
}

function updateMeet(meetid) {
  let patchdata = {
    mptype: $("mptype").value,
  };
  console.log(patchdata)
  let url = '/meet/' + meetid.toString() + '?meetkey=' + meetkey;
  fetch(baseUrl + url, {
    method: 'PATCH',
    body: JSON.stringify(patchdata),
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
    .then(data => { return data.json() })
    .then(res => { console.log(res) })
  // .then(error=>{console.log(error)})
  // window.location.href = "/web/meet/" + meet;
}

getMeet(meetid);
getUsers(meetid);
