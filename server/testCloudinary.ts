import 'dotenv/config';
import cloudinary from './config/cloudinary.js';

async function run() {
    try {
        console.log("Using API Key:", process.env.CLOUDINARY_API_KEY);
        console.log("Using Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
        const res = await cloudinary.api.ping();
        console.log('Ping Success:', res);
    } catch(e) {
        console.error('Cloudinary Ping Error:', e);
    }
    process.exit(0);
}
run();
