import dotenv from 'dotenv';
import path from 'path';

// Explicitly load the .env file from the server directory
const envPath = path.resolve(__dirname, '../../.env');
console.log("[EnvLoader] Loading .env from:", envPath);
dotenv.config({ path: envPath });

// Set Google Cloud Credentials for Vertex AI & TTS
// Set Google Cloud Credentials for Vertex AI & TTS
const keyPath = path.resolve(__dirname, '../../../osce-ai-sim-d5b457979ae1.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
console.log("[EnvLoader] Set GOOGLE_APPLICATION_CREDENTIALS to:", keyPath);

// Check if file exists
import fs from 'fs';
if (!fs.existsSync(keyPath)) {
    console.error("[EnvLoader] FATAL: Google Cloud JSON Key not found at:", keyPath);
} else {
    console.log("[EnvLoader] Google Cloud JSON Key found.");
}
