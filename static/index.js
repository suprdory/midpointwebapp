const baseUrl = 'http://localhost:5000/'
const $ = id => document.getElementById(id);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
pw=urlParams.get('pw')

function showError(error){
    console.log(error);
}
function getmeets() {
    // newmeetdata={meetname:mn};
    url='meet?pw='+ pw
    json=fetch(baseUrl + url,{
      method:'GET',
    // body:JSON.stringify(newmeetdata),
      headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp => resp.json())
    .then(data=>printMeetBtns(data))
}

function printMeetBtns(meets) {
  for (meet of meets) {
    console.log(meet.meetid)
    var a = document.createElement('a');
    var linkText = document.createTextNode(meet.meetname);
    a.appendChild(linkText);
    a.title = "Meet link";
    a.href = 'meet.html?meetid='+ meet.meetid+'&meetkey='+meet.meetKey;
    $('current').appendChild(a);
  }
}

function clearMeetList(){
  const parent = document.getElementById("current")
  while (parent.firstChild) {
      parent.firstChild.remove()
  }
}

function newmeet() {
  var mn = document.getElementById("meetname_id").value;
  newmeetdata={meetname:mn};
  url='meet' + '?=' + pw;
  fetch(baseUrl+url,{
    method:'POST',
    body:JSON.stringify(newmeetdata),
    headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(data=>{return data.json()})
    .then(res=>{console.log(res)})
    .then(error=>{console.log(error)})
    .then(clearMeetList())
    .then(getmeets())
  // window.location.href = "/web/meet";
}

getmeets()
