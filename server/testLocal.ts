import 'dotenv/config';
import cloudinary from './config/cloudinary.js';
import fs from 'fs';
async function run() {
    try {
        fs.writeFileSync('test.txt', 'hello');
        const res = await cloudinary.uploader.upload('test.txt', {resource_type: 'raw'});
        console.log('Success:', res.secure_url);
    } catch(e) {
        console.error('Error:', e);
    }
    process.exit(0);
}
run();
