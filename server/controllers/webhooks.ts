import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  let evt: any;
  try {
    const secretKey = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secretKey) {
      throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET");
    }
    evt = await verifyWebhook(req, { signingSecret: secretKey });
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).send("Error verifying webhook");
  }

  try {
    console.log("✅ Webhook verified. Event type:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      console.log("Processing user data for Clerk ID:", evt.data.id);
      
      const user = await User.findOne({ clerkId: evt.data.id });
      const email = evt.data.email_addresses?.[0]?.email_address;
      
      const userData = {
        clerkId: evt.data.id,
        email: email,
        name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
        image: evt.data.image_url,
      };

      console.log("User data to save:", userData);

      if (user) {
        console.log("Updating existing user...");
        await User.findOneAndUpdate({ clerkId: evt.data.id }, userData);
        console.log("User updated successfully");
      } else {
        console.log("Creating new user...");
        await User.create(userData);
        console.log("User created successfully");
      }
    } else if (evt.type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: evt.data.id });
      console.log("User deleted successfully");
    }

    return res.json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("❌ Error saving user to database:", err);
    return res.status(500).send("Database error");
  }
};