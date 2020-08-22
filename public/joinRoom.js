function joinRoom(roomTitle) {
  // send this roomname to the server
  nsSocket.emit("joinRoom", roomTitle, (newNumberofMembers) => {
    // update room title
    document.querySelector(".curr-room-text").innerText = roomTitle
    // update ui with total number of members
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${newNumberofMembers} <span class="glyphicon glyphicon-user"></span
    ></span>`
  })
  nsSocket.on("historyCatchUp", (history) => {
    const messageUl = document.querySelector("#messages")
    messageUl.innerHTML = ""
    history.forEach((msg) => {
      messageUl.innerHTML += buildMsgHTML(msg)
    })
    messageUl.scrollTop = messageUl.scrollHeight
  })
  nsSocket.on("updateMembers", (memberCnt) => {
    // update ui with total number of members
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${memberCnt} <span class="glyphicon glyphicon-user"></span
    ></span>`
    // update room title
    document.querySelector(".curr-room-text").innerText = roomTitle
  })

  let searchBox = document.querySelector("#search-box")
  searchBox.addEventListener("input", (e) => {
    let messages = Array.from(document.querySelectorAll(".message-text"))
    messages.forEach((msg) => {
      if (
        msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1
      ) {
        // the msg doesn't contain user search term
        msg.parentElement.parentElement.style.display = "none"
      } else {
        msg.parentElement.parentElement.style.display = "flex"
      }
    })
  })
}
