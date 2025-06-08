import { Server } from 'socket.io'
import http from 'http'
import express from 'express'


const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors : {
    origin : ["http://localhost:5173"]
  }
})

export function getReceiverSocketId(userId){
  return userSocketMap[userId];
}

// to get online users
const userSocketMap = {}; // {userId} : socketId 

// to listen for any incoming messages
io.on('connection', (socket) => { // here socket means a client
  console.log("A user connected ", socket.id);
  const userId = socket.handshake.query.userId
  if(userId) {
    userSocketMap[userId] = socket.id
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  // when the client disconnects
  socket.on('disconnect', () => {
    console.log("A user disconnected ", socket.id);
    delete userSocketMap[userId]
  })
})

export {io, app, server}