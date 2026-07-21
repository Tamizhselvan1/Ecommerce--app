// @ts-nocheck
import { Webhook } from 'svix';
import 'dotenv/config';

async function testWebhook() {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) throw new Error("Missing secret");
  
  const wh = new Webhook(secret);
  const payload = {
    data: {
      id: "user_test_" + Date.now(),
      first_name: "Test",
      last_name: "Webhook",
      email_addresses: [{ email_address: "testwebhook" + Date.now() + "@example.com" }],
      image_url: "https://example.com/avatar.jpg"
    },
    object: "event",
    type: "user.created"
  };

  const payloadString = JSON.stringify(payload);
  const headers = wh.sign(payloadString);

  try {
    const res = await fetch("http://localhost:3000/api/clerk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: payloadString
    });

    const text = await res.text();
    console.log("Response status:", res.status);
    console.log("Response text:", text);
  } catch(err) {
    console.error("Fetch failed:", err);
  }
}

testWebhook();
