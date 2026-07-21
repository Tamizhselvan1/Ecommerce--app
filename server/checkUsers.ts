import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const users = await User.find();
    console.log('Users in DB:', users.length);
    console.log(users);
    process.exit(0);
}

run();
