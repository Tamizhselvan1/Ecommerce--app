import { Webhook } from "svix";
import { Request, Response } from "express";
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  const secretKey = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  
  if (!secretKey) {
    console.error("❌ Missing CLERK_WEBHOOK_SIGNING_SECRET");
    return res.status(500).send("Server configuration error");
  }

  // Check what req.body actually is
  console.log("Req body type:", typeof req.body);
  console.log("Is Buffer:", Buffer.isBuffer(req.body));

  // If req.body is a Buffer (from express.raw), convert it to string. 
  // If it's an object (from express.json), stringify it (fallback).
  let payloadString: string;
  if (Buffer.isBuffer(req.body)) {
    payloadString = req.body.toString('utf8');
  } else if (typeof req.body === 'object') {
    payloadString = JSON.stringify(req.body);
  } else {
    payloadString = String(req.body);
  }

  const svixHeaders = {
    "svix-id": req.headers["svix-id"] as string,
    "svix-signature": req.headers["svix-signature"] as string,
    "svix-timestamp": req.headers["svix-timestamp"] as string,
  };

  console.log("Svix Headers:", svixHeaders);

  const wh = new Webhook(secretKey);
  let evt: any;
  
  try {
    evt = wh.verify(payloadString, svixHeaders);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed!");
    console.error("Exact Svix Error:", err.message);
    console.error("Payload snippet:", payloadString.substring(0, 100) + "...");
    return res.status(400).send(`Error verifying webhook: ${err.message}`);
  }

  try {
    console.log("✅ Webhook verified. Event type:", evt.type);
    
    // Ensure database is connected before running Mongoose queries!
    const connectDB = (await import("../config/db.js")).default;
    await connectDB();

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