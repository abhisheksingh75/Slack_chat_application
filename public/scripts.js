// const socket = io("http://localhost:9000/")
const username = prompt("Please enter your name") || "Anonymous Usere"
const socket = io("http://localhost:9000/", {
  query: {
    username: username,
  },
})
let nsSocket = ""
socket.on("nsList", (nsList) => {
  //   render namespaces on ui
  let namespacesDiv = document.querySelector(".namespaces")
  namespacesDiv.innerHTML = ""
  nsList.forEach((nameSpace) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${nameSpace.endpoint}><img src="${nameSpace.img}" /></div>`
  })

  //   add eventlistener for each Namespaces
  Array.from(document.querySelectorAll(".namespace")).forEach((ele) => {
    ele.addEventListener("click", (event) => {
      const nameSpace = ele.getAttribute("ns")
      joinNs(nameSpace)
    })
  })
  joinNs(nsList[0].endpoint)
})
