function joinNs(endpoint) {
  if (nsSocket) {
    nsSocket.close()
    document
      .querySelector(".message-form")
      .removeEventListener("submit", formSubmition)
  }
  nsSocket = io(`http://localhost:9000${endpoint}`)
  nsSocket.on("nsRoomLoad", (nsRoom) => {
    let roomList = document.querySelector(".room-list")
    roomList.innerHTML = ""
    nsRoom.forEach((room) => {
      roomList.innerHTML += `<li class = 'room'><span class="glyphicon ${
        room.privateRoom ? "glyphicon-lock" : "glyphicon-globe"
      }"></span>${room.roomTitle}</li>`
    })
    // add event listener on each room
    let roomNodes = document.querySelectorAll(".room")
    Array.from(roomNodes).forEach((ele) => {
      ele.addEventListener("click", (event) => {
        joinRoom(event.target.innerText)
        // console.log("joinroom", event.target.innerText)
      })
    })

    // add room automcatically...first time here
    const topRoom = document.querySelector(".room")
    const topRoomName = topRoom.innerText
    joinRoom(topRoomName)

    nsSocket.on("messageToClients", (msg) => {
      const newMsg = buildMsgHTML(msg)
      document.querySelector("#messages").innerHTML += newMsg
      document.querySelector("#user-message").value = ""
    })

    //javascript code to add message
    document
      .querySelector(".message-form")
      .addEventListener("submit", formSubmition)
  })
}
function formSubmition(event) {
  event.preventDefault()
  newMessage = document.querySelector("#user-message").value
  nsSocket.emit("newMessageToServer", { text: newMessage })
}

function formSubmition(event) {
  event.preventDefault()
  newMessage = document.querySelector("#user-message").value
  nsSocket.emit("newMessageToServer", { text: newMessage })
}

function buildMsgHTML(msg) {
  const localtime = new Date(msg.time).toLocaleString()
  const newMsg = `
        <li>
          <div class="user-image">
            <img src=${msg.avatar} />
          </div>
          <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${localtime}</span></div>
            <div class="message-text">
              ${msg.text}
            </div>
          </div>
        </li>`
  return newMsg
}
