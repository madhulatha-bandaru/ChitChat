import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the Database successfully")
  } catch(error) {
    console.log("Error during Database connection : " + error);
  }
}
