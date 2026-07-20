import mongoose from "mongoose";
const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("✅ MongoDB connected successfully");
        });
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err);
        });
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        });
    }
    catch (error) {
        console.error("❌ Failed to connect to MongoDB. Error details:");
        console.error(error.message);
        console.error("\n💡 TIP: If you see 'querySrv ECONNREFUSED', it usually means your current Wi-Fi network, Firewall, or VPN is blocking the database connection, OR you haven't whitelisted your IP address in the MongoDB Atlas dashboard.");
        // We don't exit the process here so the Express server can still start and show routes
    }
};
export default connectDB;
