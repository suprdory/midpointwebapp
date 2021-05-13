export function deleteMeetLS(meetid) {
    console.log("meetid", meetid)
    var meetsArray = getMeetsArray();
    for (var i = meetsArray.length - 1; i >= 0; i--) {
        var meeti = meetsArray[i]
        console.log(i, meeti["id"], meetid, meeti["id"] == meetid)
        if (meeti["id"] == meetid) {
            meetsArray.splice(i, 1)
            console.log(meeti, "match")
        }
    }
    localStorage.setItem('meets', JSON.stringify(meetsArray))

}

export function clearBadMeetsLS() {
    var meetsArray = getMeetsArray();
    for (var i = meetsArray.length - 1; i >= 0; i--) {
        var meeti = meetsArray[i]
        console.log(i, meeti["id"],)
        if (!meeti["id"]) {
            meetsArray.splice(i, 1)
            console.log(meeti, "match")
        }
    }
    localStorage.setItem('meets', JSON.stringify(meetsArray))
}


function createNewMeetForLocStor(meet) {
    var newMeet = {
        'name': meet.meetname,
        'id': meet.meetid,
        'key': meet.meetKey,
        'date': new Date().toUTCString()
    }
    return (newMeet)
}

function getMeetsArray() {
    let meetsArray = localStorage.getItem('meets')
        ? JSON.parse(localStorage.getItem('meets'))
        : []
    return (meetsArray)
}

export function newMeetHandlerLS(meet) {
    var key = 'id'
    var newMeet = createNewMeetForLocStor(meet)
    var meetsArray = getMeetsArray()
    console.log('meet', meet)
    //remove matching items
    for (var i = meetsArray.length - 1; i >= 0; i--) {
        var meeti = meetsArray[i]
        // console.log(meet[key])
        // console.log(newMeet[key])
        if (meeti[key] == newMeet[key] && meeti[key]) {
            meetsArray.splice(i, 1)
            console.log(meet, "match")
        }
    }
    if (newMeet.id) {
        meetsArray.push(newMeet);
    }

    console.log('New Meet', newMeet)
    console.log(meetsArray)
    localStorage.setItem('meets', JSON.stringify(meetsArray))
}


function liMaker(meet, liurl, tab) {
    // const li = document.createElement('li')
    let elapsedTime = timeSince(new Date(meet.date))
    let tr = document.createElement('tr');
    let td_name = document.createElement('td');
    let td_date = document.createElement('td');
    let td_forget = document.createElement('td')
    td_forget.style.textAlign = "center";

    let a = document.createElement('a');
    a.textContent = meet.name;
    a.href = liurl;
    a.className = "leftrow meetlistelement";
    td_name.appendChild(a);

    let b = document.createElement('a');
    b.textContent = elapsedTime + ' ago';
    b.className = "meetlistelement";
    b.href = liurl;
    td_date.appendChild(b);

    let c = document.createElement('a');
    c.textContent = 'X';
    c.className = "meetlistelement";
    c.addEventListener("click", function () {
        deleteMeetLS(meet.id);
        updateListLS(tab)
    })
    td_forget.appendChild(c);


    tr.appendChild(td_name);
    tr.appendChild(td_date);
    tr.appendChild(td_forget);
    tab.appendChild(tr);
    tab.appendChild(document.createElement("br"));
}

export function updateListLS(tab) {
    var meetsArray = getMeetsArray()
    while (tab.firstChild) {
        tab.removeChild(tab.firstChild)
    }
    console.log("MA", meetsArray)
    if (meetsArray.length==0) {
        let emptyListStr="No meets yet, create one above!";
        let a = document.createElement('a');
        a.textContent = emptyListStr;
        a.className = "meetlistelement";
        console.log("no meets")
        tab.appendChild(a)
    } else {
        let tr = document.createElement('tr');
        let th_name = document.createElement('th');
        let th_time = document.createElement('th');
        let th_forget = document.createElement('th');
        th_name.innerHTML="Name";
        th_time.innerHTML = "Last Accessed";
        th_forget.innerHTML = "Forget";
        tr.appendChild(th_name)
        tr.appendChild(th_time)
        tr.appendChild(th_forget)
        tab.appendChild(tr)

        meetsArray.slice().reverse().forEach((meet) => {
            var liurl = "/meetmap.html?meetid=" + meet.id + '&meetkey=' + meet.key;
            // console.log(liurl)
            if (meet.name) {
                liMaker(meet, liurl, tab);
            }
        })
    }

}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}