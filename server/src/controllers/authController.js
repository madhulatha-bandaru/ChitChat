import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js'
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res) => {
  const { fullName, email, password } = req.body;
  try {
    if(!fullName || !email || !password) {
      return res.status(400).json({message : "All fields are required"})
    }

    // check the length of the password
    if(password.length < 8) {
      return res.status(400).json({message : "Password must be at least 8 characters"})
    }

    const user = await User.findOne({email})

    if(user) {
      return res.status(400).json({message : "Account already exists!"})
    }

    // hash password

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT)) // generate a salt
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password : hashedPassword
    })

    if(newUser) {
      // generate jwt token - utils.js
      generateToken(newUser._id, res)

      await newUser.save();

      res.status(201).json({
        _id : newUser._id,
        fullName : newUser.fullName,
        email : newUser.email,
        profilePic : newUser.profilePic
      })

    } else {
      res.status(400).json({message : "Invalid user data"})
    }

  } catch (error) {
    console.log("Error in signup controller ", error.message)
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

export const login = async (req,res) => {
  const { email, password } = req.body;
  try {
    if(!email) {
      return res.status(400).json({message : "Enter your email address"})
    }

    if(!password) {
      return res.status(400).json({message : "Enter your password"})
    }
  
    const user = await User.findOne({email})
  
    if(!user) {
        return res.status(400).json({message : "Invalid credentials"})
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if(!isValidPassword) {
      return res.status(400).json({message : "Invalid credentials"})
    }

    generateToken(user._id, res)

    res.status(200).json({
      _id : user._id,
        fullName : user.fullName,
        email : user.email,
        profilePic : user.profilePic,
        createdAt : user.createdAt
    })
  }catch (error) {
    console.log("Error in login controller ", error.message)
    res.status(500).json({
      message : "Internal Server Error"
    })
  }

}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge : 0
    })
    res.status(200).json({message:"Logged out successfully"})
  }catch (error) {
    console.log("Error in logout controller ", error.message) 
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id 

    if(!profilePic) {
      return res.status(400).json({message:"Profile pic is required"})
    }

    const uploadedResponse = await cloudinary.uploader.upload(profilePic)

    // update in the database as well
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadedResponse.secure_url}, {new:true})
    // secure_url is a field that cloudinary gives you back
    res.status(200).json(updatedUser);

  } catch(error){
    console.log("Error in updateProfile controller : ", error.message)
    return res.status(500).json({message : "Internal Server Error"})
  }
}

export const checkAuth = (req,res) => {
  try {
    return res.status(200).json(req.user)
  }catch(error) {
    console.log("Error in checkAuth controller ", error.message)
    res.status(500).json({message : "Internal server error"})
  }
}
