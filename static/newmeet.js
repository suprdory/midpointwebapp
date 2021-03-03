function newmeet() {
  var mn = document.getElementById("meetname_id").value;
  // var pw = document.getElementById("password_id").value;
  newmeetdata={meetname:mn};
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
    .then(data => opennewmeet(data))
    // .then(res=>{console.log(res)})
    // .then(error=>{console.log(error)})
    .catch((error) => {
      alert('Fail')
      console.log('Something went wrong.', error);
    });
  // window.location.href = "/web/meet";
}

function opennewmeet(meet){
  if (meet.meetKey != null){
    meetid=meet.meetid;
    meetKey=meet.meetKey;
    window.location.href = "/adduser.html?meetid=" + meetid +'&meetkey='+meetKey
  }
}
