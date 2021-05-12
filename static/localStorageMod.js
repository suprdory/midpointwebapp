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

export function newMeetHandlerLS(meet, key) {
    var newMeet = createNewMeetForLocStor(meet)
    var meetsArray = getMeetsArray()
    // console.log('New Meet', newMeet)
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


function liMaker(text, liurl, ul) {
    const li = document.createElement('li')
    var a = document.createElement('a')
    a.textContent = text
    a.href = liurl
    a.className = "meetlistelement"
    li.appendChild(a)
    ul.appendChild(li)
}

export function updateListLS(ul) {
    var meetsArray = getMeetsArray()
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild)
    }
    meetsArray.slice().reverse().forEach((meet) => {
        var liurl = "/meetmap.html?meetid=" + meet.id + '&meetkey=' + meet.key;
        // console.log(liurl)
        liMaker(meet.name + ' ' + meet.date, liurl, ul);
    })
}