import mongoose from "mongoose";

// Global cache for serverless environments like Vercel
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    const db = await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB. Error details:");
    console.error(error.message);
    console.error("\n💡 IMPORTANT: If you are on Vercel, make sure you have added 0.0.0.0/0 to your MongoDB Atlas Network Access to allow Vercel to connect!");
  }
};

export default connectDB;