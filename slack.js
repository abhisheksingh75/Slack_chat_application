const express = require("express")
const app = express()
const socketio = require("socket.io")
let namespaces = require("./data/namespaces")

app.use(express.static(__dirname + "/public"))

const expressServer = app.listen(9000, () =>
  console.log(`server is listening on port 9000`)
)

const io = socketio(expressServer)

io.on("connect", (socket) => {
  // console.log(socket.handshake)
  //  build an array  to send back with img and endpoints for namespace
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    }
  })
  //   send the nsdata
  socket.emit("nsList", nsData)
})

// loop through namespaces and listen for connection
namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on("connect", (nsSocket) => {
    const username = nsSocket.handshake.query.username
    // console.log(`${nsSocket.id} has join ${namespace.endpoint}`)
    //socket has connected to one of our namespaces
    nsSocket.emit("nsRoomLoad", namespace.rooms)

    // connect with room
    nsSocket.on("joinRoom", (roomToJoin, numberOfuserCallback) => {
      // leave all other rooms on this socket, before joining to new room in same socket

      const roomTitle = Object.keys(nsSocket.rooms)[1]
      if (roomToJoin !== roomTitle) {
        nsSocket.leave(roomTitle, () => {
          UpdateroomCount(namespace, roomTitle)
        })

        nsSocket.join(roomToJoin)
        UpdateroomCount(namespace, roomToJoin)
      }
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin
      })
      nsSocket.emit("historyCatchUp", nsRoom.history)
      // Once new user joins send the updated number of users to all user
      UpdateroomCount(namespace, roomToJoin)

      // Once user disconnect, send the updated count to all users
      nsSocket.on("disconnect", (reason) => {
        io.of(namespace.endpoint)
          .in(roomToJoin)
          .clients((error, clients) => {
            io.of(namespace.endpoint)
              .in(roomToJoin)
              .emit("updateMembers", clients.length)
          })
      })
    })

    nsSocket.on("newMessageToServer", (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: "https://via.placeholder.com/30",
      }
      //  sent all message to all sockets  that this room in
      // how to find all sockets for this room ?
      const roomtoJoin = Object.keys(nsSocket.rooms)[1]
      console.log("roomtoJoin", roomtoJoin, "roomtile")
      // we need to find the room object for this room
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomtoJoin
      })

      nsRoom.history.push(fullMsg)
      io.of(namespace.endpoint)
        .in(nsRoom.roomTitle)
        .emit("messageToClients", fullMsg)
    })
  }) //closing of #namespaces loop
})

function UpdateroomCount(namespace, roomToJoin) {
  io.of(namespace.endpoint)
    .in(roomToJoin)
    .clients((error, clients) => {
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .emit("updateMembers", clients.length)
    })
}
