import toast from 'react-hot-toast'
import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create((set, get) => ({
  authUser : null,
  isSigningUp : false,
  isLoggingIn : false,
  isUpdatingProfile : false,
  isCheckingAuth : true,
  onlineUsers : [],
  socket : null,

  checkAuth : async() => {
    try {
      const res = await axiosInstance.get("/auth/check")
      set({authUser:res.data})
      get().connectSocket()
    } catch(error) {
      console.log("Error in checkAuth :", error.message)
      set({authUser:null})
    } finally {
      set({isCheckingAuth : false})
    }
  },

  signup  : async (data) => {
    set({isSigningUp : true})
    try  {
      const res = await axiosInstance.post('/auth/signup', data);
      set({authUser : res.data})
      toast.success("Account created successfully")
      get().connectSocket()
    } catch(error) {
      toast.error(error.response.data.message)
    } finally {
      set ({isSigningUp : false})
    }
  },

  logout : async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({authUser : null})
      get().disconnectSocket()
      toast.success("Logged out successfully")
      
    } catch(error) {
      toast.error(error.response.data.message)
    }
  },

  login : async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // once you login, socket.io should know that you are connected
      get().connectSocket();

    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket : () => {
    const {authUser} = get()

    if(!authUser) return; // not an authenticated user
    // if already connected then don't create a new one
    if(get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query : {
        userId : authUser._id,
      }
    })
    socket.connect()
    set({ socket : socket })

    socket.on("getOnlineUsers", (userIds) => {
      set({onlineUsers : userIds})
    })
  },

  disconnectSocket : () => {
    if(get().socket?.connected)  
      get().socket.disconnect();
    
  }
}))