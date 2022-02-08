var pw = urlParams.get('pw')

function getMeet() {
    let url = '?pw=' + pw
    let json = fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        // body:JSON.stringify(meetdata)
    })
        .then(resp => resp.json())
        .then(data => procMeetList(data))
}

function procMeetList(data) {
    data.sort((a, b) => (a.meetid > b.meetid ? -1 : 1))
    var table = document.getElementById("meetListTab")
    for (let meet of data) {
        var row = table.insertRow(-1);
        var id = row.insertCell(0);
        id.innerHTML=meet['meetid']
        
        var name = row.insertCell(1);
        var linktarget = 'https://www.findthemidpoint.com/meetmap.html?meetid=' + meet['meetid'] + '&meetkey=' + meet['meetKey']
        var link = document.createElement("a");
        link.setAttribute("href", linktarget)
        // link.className = "someCSSclass";
        var linkText = document.createTextNode(meet['meetname']);
        link.appendChild(linkText);
        name.appendChild(link);

        var date = row.insertCell(2);
        var meetdate = new Date(Date.parse(meet['date']));
        // console.log(meetdate)
        date.innerHTML = meetdate.toLocaleString()

    }

    // tab.innerHTML=data
    // console.log(data)
}



getMeet()