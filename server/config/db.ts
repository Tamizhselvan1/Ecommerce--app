import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB. Error details:");
    console.error(error.message);
    console.error("\n💡 IMPORTANT: If you are on Vercel, make sure you have added 0.0.0.0/0 to your MongoDB Atlas Network Access to allow Vercel to connect!");
  }
};

export default connectDB;