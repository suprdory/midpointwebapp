document.getElementById("meetname_id").addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
       newmeet();
   }
});
document.getElementById("submit_id").addEventListener("click",newmeet)

function newmeet() {
  // event.preventDefault()
  var mn = document.getElementById("meetname_id").value;
  if (mn=="") {
    alert("Enter meet name")
  } else {
    newmeetdata={meetname:mn};
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
