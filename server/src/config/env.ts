import dotenv from 'dotenv';
import path from 'path';

// Explicitly load the .env file from the server directory
const envPath = path.resolve(__dirname, '../../.env');
console.log("[EnvLoader] Loading .env from:", envPath);
dotenv.config({ path: envPath });

// Use GOOGLE_APPLICATION_CREDENTIALS from environment
import fs from 'fs';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (credentialsPath) {
    if (!fs.existsSync(credentialsPath)) {
        console.warn("[EnvLoader] Warning: GOOGLE_APPLICATION_CREDENTIALS path is invalid:", credentialsPath);
    } else {
        console.log("[EnvLoader] Google Cloud JSON Key found at:", credentialsPath);
    }
} else {
    console.warn("[EnvLoader] No GOOGLE_APPLICATION_CREDENTIALS provided. Google Cloud services (TTS, etc.) will be disabled.");
}
