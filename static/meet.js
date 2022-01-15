import {
    newMeetHandlerLS
} from './localStorageMod.js'
var meetid = urlParams.get('meetid')
var meetkey = urlParams.get('meetkey')

let gRouteModes = [{
        text: 'Walking',
        gName: 'WALKING'
    },
    {
        text: 'Cycling',
        gName: 'BICYCLING'
    },
    {
        text: 'Public Transport',
        gName: 'TRANSIT'
    },
    {
        text: 'Driving',
        gName: 'DRIVING'
    }
]

let mptypes = [{
        text: 'Temporal',
        val: 'temporal'
    },
    {
        text: 'Spatial',
        val: 'spatial'
    },
]

$("adduser_id").href = 'adduser.html?meetid=' + meetid + '&meetkey=' + meetkey
$("meetmap_id").href = 'meetmap.html?meetid=' + meetid + '&meetkey=' + meetkey
$("deletemeet_id").addEventListener("click", function () {
    deletemeet(meetid)
});

function getMeet(meetid) {
    // meetdata={meetkey:meetkey};
    let url = 'meet/' + meetid + '?meetkey=' + meetkey
    let json = fetch(baseUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
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
    let url = 'meetusers/' + meetid + '?meetkey=' + meetkey
    let json = fetch(baseUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(resp => resp.json())
        .then(data => populateUserTable(data))
}

function deleteUser(userid) {
    // console.log('deleteuser(' + userid + ')');
    let url = 'user/' + userid.toString() + '?meetkey=' + meetkey
    fetch(baseUrl + url, {
            method: 'DELETE'
        })
        // .then(data=>{return data.json()})
        .then(res => {
            console.log(res)
        })
        .then(error => {
            console.log(error)
        })
        .then(function () {
            getUsers(meetid)
        })
    // window.location.href = "/web/meet/{{meet.meetid}}";
}

function deletemeet(meetid) {
    let url = 'meet/' + meetid.toString() + '?meetkey=' + meetkey
    fetch(baseUrl + url, {
            method: 'DELETE'
        })
        // .then(data=>{return data.json()})
        .then(res => {
            console.log(res)
        })
        .then(error => {
            console.log(error)
        })
        .then(function () {
            window.location.href = "/"
        })
}

function populateMeetTable(data) {
    // console.log(data);
    var table = document.getElementById("meetTable");
    var row = table.insertRow(-1);
    
    var meetidtab = row.insertCell(0);
    meetidtab.innerHTML = data.meetid;
    

    let mNameInput = document.createElement("input")
    mNameInput.className = "mapbutton noclick"
    mNameInput.value = data.meetname
    mNameInput.id = "meetName"
    var meetnametab = row.insertCell(1);
    meetnametab.appendChild(mNameInput)

    let meetDate = new Date(data.date)
    
    let mHourInput = document.createElement("input")
    mHourInput.className = "mapbutton noclick ch2";
    mHourInput.value = meetDate.getHours();
    mHourInput.id = "meetHour"
    var meetHour = row.insertCell(2);
    meetHour.appendChild(mHourInput)

    let mDayInput = document.createElement("input")
    mDayInput.className = "mapbutton noclick ch2";
    mDayInput.value = meetDate.getDate();
    mDayInput.id = "meetDay"
    var meetDay = row.insertCell(3);
    meetDay.appendChild(mDayInput)

    let mMonthInput = document.createElement("input")
    mMonthInput.className = "mapbutton noclick ch2";
    mMonthInput.value = meetDate.getMonth()+1
    mMonthInput.id = "meetMonth"
    var meetMonth = row.insertCell(4);
    meetMonth.appendChild(mMonthInput)

    let mYearInput = document.createElement("input")
    mYearInput.className = "mapbutton noclick ch4";
    mYearInput.value = meetDate.getFullYear();
    mYearInput.id = "meetYear"
    var meetYear = row.insertCell(5);
    meetYear.appendChild(mYearInput)

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
    var mptypeSel = row.insertCell(6);
    mptypeSel.appendChild(mptypeInp)

    let ubtn = document.createElement("a");
    ubtn.className = 'mapbutton'
    ubtn.textContent = "Save"
    ubtn.id = "btnUpdate";
    ubtn.addEventListener("click", function () {
        updateMeet(data.meetid)
    });
    var meetUpdate = row.insertCell(7);
    meetUpdate.appendChild(ubtn)

}

function populateUserTable(data) {
    // console.log(data);
    var table = document.getElementById("userTable");
    for (let d of data) {
        var row = table.insertRow(-1);

        var useridtab = row.insertCell(0);
        var usernametab = row.insertCell(-1);

        let uNameInput = document.createElement("input")
        uNameInput.className = "mapbutton noclick"
        uNameInput.classList.add('narrow')
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
        gModeInp.id = "gMode" + d.userid

        for (let gmode of gRouteModes) {
            var option = document.createElement("option");
            option.text = gmode.text;
            option.value = gmode.gName;
            gModeInp.add(option)
        }
        gModeInp.value = d.gRouteMode
        gMode.appendChild(gModeInp)

        var uUpdate = row.insertCell(-1);
        var udel = row.insertCell(-1);

        useridtab.innerHTML = d.userid;
        // ulon.innerHTML = parseFloat(d.lon).toFixed(4);
        // ulat.innerHTML = parseFloat(d.lat).toFixed(4);
        udur.innerHTML = d.gRouteDuration;
        udist.innerHTML = d.gRouteDistance;

        let ubtn = document.createElement("a");
        ubtn.className = 'mapbutton'
        ubtn.textContent = "Save"
        ubtn.id = "btnUpdate" + d.userid;
        ubtn.addEventListener("click", function () {
            updateUser(d.userid)
        });
        uUpdate.appendChild(ubtn)

        let btn = document.createElement("a");
        btn.className = 'mapbutton'
        btn.textContent = "Delete"
        btn.id = "btn" + d.userid;
        btn.addEventListener("click", function () {
            deleteUser(d.userid)
        });
        udel.appendChild(btn)
    }
}

function updateUser(userid) {
    let patchdata = {
        username: $("username" + userid).value,
        gRouteMode: $("gMode" + userid).value,
    };
    console.log(patchdata)
    let url = '/user/' + userid.toString() + '?meetkey=' + meetkey;
    fetch(baseUrl + url, {
            method: 'PATCH',
            body: JSON.stringify(patchdata),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(data => {
            return data.json()
        })
        .then(res => {
            console.log(res)
        })
    // .then(error=>{console.log(error)})
    // window.location.href = "/web/meet/" + meet;
}

function updateMeet(meetid) {
    // console.log($("mptype"))
    // console.log($("meetName"))
    let newDate= new Date($("meetYear").value,$("meetMonth").value-1,$("meetDay").value,$("meetHour").value)
    // console.log(newDate.toISOString())
    let patchdata = {
        mptype: $("mptype").value,
        meetname: $("meetName").value,
        meetDate: newDate.toISOString(),
    };
    // console.log(patchdata)
    let url = '/meet/' + meetid.toString() + '?meetkey=' + meetkey;
    fetch(baseUrl + url, {
            method: 'PATCH',
            body: JSON.stringify(patchdata),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(data => {
            return data.json()
        })
        .then(res => {
            console.log(res)
        })
    // .then(error=>{console.log(error)})
    // window.location.href = "/web/meet/" + meet;
}

getMeet(meetid);
getUsers(meetid);
