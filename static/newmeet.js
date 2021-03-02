function newmeet() {
  var mn = document.getElementById("meetname_id").value;
  var pw = document.getElementById("password_id").value;
  newmeetdata={meetname:mn};
  url='meet' + '?pw=' + pw;
  fetch(baseUrl+url,{
    method:'POST',
    body:JSON.stringify(newmeetdata),
    headers:{'Content-Type': 'application/json; charset=utf-8'}})
    .then(resp=>resp.json())
    .then(data => opennewmeet(data))
    .then(res=>{console.log(res)})
    .then(error=>{console.log(error)})

  // window.location.href = "/web/meet";
}

function opennewmeet(meet){
  meetid=meet.meetid;
  meetKey=meet.meetKey;
  window.location.href = "/meet.html?meetid=" + meetid +'&meetkey='+meetKey
}
