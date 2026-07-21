import crypto from 'crypto';
import 'dotenv/config';

async function run() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
    
    const timestamp = Math.round((new Date).getTime()/1000);
    const signatureToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureToSign).digest('hex');

    const form = new FormData();
    form.append('file', 'data:text/plain;base64,aGVsbG8=');
    form.append('timestamp', timestamp.toString());
    form.append('api_key', apiKey as string);
    form.append('signature', signature);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    const res = await fetch(url, {
        method: 'POST',
        body: form
    });
    
    console.log(res.status);
    console.log(await res.text());
}
run();
