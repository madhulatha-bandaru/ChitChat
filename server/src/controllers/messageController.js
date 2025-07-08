import Message from '../models/messageModel.js'
import User from '../models/userModel.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js'


export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const otherUsers = await User.find({_id :{$ne : loggedInUserId}}).select("-password"); // select every
    // other user except himself to display on chats section and exclude password from every user
    res.status(200).json(otherUsers)
  } catch(error) {
    console.error("error in getUsersForSideBar: ", error.message)
    res.status(500).json({message : "Internal Server Error"})
  }
}

export const getMessages = async (req, res) => {
  try {
    const {id:userToChatId} = req.params // receiver id, which comes on clicking that person's chat

    const myId = req.user._id // sender id

    // retrieve all the messages of that particular pair of people
    const messages = await Message.find({
      $or:[
        {senderId : myId, receiverId : userToChatId},
        {senderId : userToChatId, receiverId : myId}
      ]
    })

    res.status(200).json(messages)
  } catch (error) {
    console.error("error in getMessages controller : ", error.message)
    res.status(500).json({message : "Internal Server Error"})
  }
}

export const sendMessage = async (req, res) => {
  try {
    const {text, image} = req.body
    const {id : receiverId} = req.params
    const senderId = req.user._id

    let imageUrl;

    // if user sends an image, that must be uploaded to cloudinary
    if(image) {
      // upload base64 image to cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadedResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image : imageUrl,
    })

    await newMessage.save()

    // real-time functionality of socket.io

    const receiverSocketId = getReceiverSocketId(receiverId)

    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage)

  } catch (error) { 
    console.error("error in sendMessage controller : ", error.message)
    res.status(500).json({message : "Internal Server Error"})
  }
}
