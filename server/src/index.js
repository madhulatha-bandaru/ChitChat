import express from "express"
import dotenv from "dotenv"
import path from 'path'
import cookieParser from "cookie-parser"
import cors from 'cors';

import authRoutes from "./routes/authRoutes.js"
import messageRoutes from './routes/messageRoutes.js'
import { connectDB } from "./lib/db.js"
import { app, server } from './lib/socket.js'

dotenv.config()

const port = process.env.PORT;
const __dirname = path.resolve()

app.use(express.json({ limit: '10mb' })) // allows you to extract json data out of body
app.use(cookieParser())
app.use(cors({
  origin : "http://localhost:5173",
  credentials:true
}))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))
  })
}

server.listen(port, () => {
  console.log(`Server is running on port : ${port}`)
  connectDB()
})