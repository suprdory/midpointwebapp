const form = document.querySelector('form')
const ul = document.querySelector('ul')
const button = document.querySelector('button')
const input = document.getElementById('item')

export function getMeetsArray(){
    let meetsArray = localStorage.getItem('meets')
        ? JSON.parse(localStorage.getItem('meets'))
        : []
    return(meetsArray)
}

export function newMeetHandler(newMeet,key){
    console.log('New Meet',newMeet)
    //remove matching items
    for(var i=meetsArray.length-1;i>=0;i--){
        meet = meetsArray[i]
        if (meet[key] == newMeet[key]) {
            itemsArray.splice(i, 1)
            console.log(item,"match")
        }
    }
    meetsArray.push(newMeet);
    localStorage.setItem('meets', JSON.stringify(meetsArray))
}

function liMaker(text) {
    const li = document.createElement('li')
    li.textContent = text
    ul.appendChild(li)
}

function updateList() {
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild)
    }
    meetsArray.slice().reverse().forEach((meet) => {
        liMaker(meet.name + ' ' + meet.date)
    })
}

// form.addEventListener('submit', function (e) {
//     e.preventDefault()

//     newItem = {
//         'name': input.value,
//         'date': new Date().toUTCString()
//     }
//     newItemHandler(newItem, "name")
//     updateList();
//     input.value = ''
// })

// button.addEventListener('click', function () {
//     localStorage.clear()
//     itemsArray = getItemsArray();
//     while (ul.firstChild) {
//         ul.removeChild(ul.firstChild)
//     }
// })


// itemsArray=getItemsArray();
// updateList();