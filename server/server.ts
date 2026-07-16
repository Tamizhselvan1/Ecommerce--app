import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";

// Disable Vercel's default body parser so we can get the raw body for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from "./controllers/webhooks.js";
import makeAdmin from "./scripts/makeAdmin.js";

const app = express();

//connect to mongodb
await connectDB();

app.post('/api/clerk',express.raw({type: 'application/json'}), clerkWebhook)

// Middleware
app.use(cors())
app.use(express.json());
app.use(clerkMiddleware())

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

await makeAdmin()

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

export default app;