import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../config/db.js";

// Disable Vercel's default body parser so we can get the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get raw body
async function getRawBody(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const secretKey = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    
    if (!secretKey) {
      console.error("❌ Missing CLERK_WEBHOOK_SIGNING_SECRET");
      return res.status(500).send("Server configuration error");
    }

    const payload = await getRawBody(req);
    const headers = req.headers;

    const wh = new Webhook(secretKey);
    let evt: any;
    
    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return res.status(400).send("Error verifying webhook");
    }

    console.log("✅ Webhook verified. Event type:", evt.type);

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
    console.error("❌ Error processing webhook:", err);
    return res.status(500).send("Server error");
  }
}
