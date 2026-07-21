import "dotenv/config";
import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import connectDB from "../config/db.js";
const makeAdmin = async () => {
    try {
        // You MUST connect to the database first!
        await connectDB();
        const email = process.env.ADMIN_EMAIL;
        if (!email) {
            console.error("No ADMIN_EMAIL provided in environment variables!");
            return;
        }
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        if (user) {
            await clerkClient.users.updateUserMetadata(user.clerkId, { publicMetadata: { role: 'admin' } });
            console.log(`Successfully made ${email} an admin!`);
        }
        else {
            console.log(`User with email ${email} not found in database.`);
        }
    }
    catch (error) {
        console.error("Admin promotion failed:", error.message);
    }
};
export default makeAdmin;
