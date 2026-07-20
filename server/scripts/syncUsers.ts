import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

async function syncUsers() {
  await connectDB();
  
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing CLERK_SECRET_KEY");
    process.exit(1);
  }

  try {
    console.log("Fetching users from Clerk API...");
    const res = await fetch("https://api.clerk.com/v1/users", {
      headers: {
        "Authorization": `Bearer ${secretKey}`
      }
    });

    if (!res.ok) {
      throw new Error(`Clerk API error: ${res.status} ${res.statusText}`);
    }

    const users = await res.json();
    console.log(`Found ${users.length} users in Clerk.`);

    for (const clerkUser of users) {
      const email = clerkUser.email_addresses?.[0]?.email_address;
      const userData = {
        clerkId: clerkUser.id,
        email: email,
        name: `${clerkUser.first_name ?? ""} ${clerkUser.last_name ?? ""}`.trim(),
        image: clerkUser.image_url,
      };

      await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        userData,
        { upsert: true, new: true }
      );
      console.log(`✅ Synced user: ${userData.name} (${userData.email})`);
    }

    console.log("🎉 All users synced successfully!");
  } catch (err) {
    console.error("❌ Error syncing users:", err);
  }
  
  process.exit(0);
}

syncUsers();
