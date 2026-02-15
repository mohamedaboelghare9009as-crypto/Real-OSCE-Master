
import axios from 'axios';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = process.env.DEEPINFRA_TOKEN;

async function debugDeepInfra() {
    if (!API_KEY) {
        console.error("DEEPINFRA_TOKEN not found in environment");
        return;
    }

    console.log("Testing DeepInfra Chatterbox Turbo...");

    // Test payload - using a preset voice first to rule out custom voice issues
    const payload = {
        text: "Testing one two three.",
        voice: "Adam",
        response_format: "mp3"
    };

    try {
        console.log("Sending request...");
        const response = await axios.post(DEEPINFRA_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            validateStatus: () => true // Accept all status codes to see errors
        });

        console.log("\n--- RESPONSE HEADERS ---");
        console.log(response.headers);
        console.log("------------------------");

        console.log(`Status: ${response.status} ${response.statusText}`);

        const data = Buffer.from(response.data);
        console.log(`Data length: ${data.length} bytes`);
        console.log(`First 50 bytes (hex): ${data.subarray(0, 50).toString('hex')}`);
        console.log(`First 100 chars (utf8): ${data.subarray(0, 100).toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.')}`);

        // Save raw output for inspection
        const debugPath = path.join(__dirname, 'debug_response.bin');
        fs.writeFileSync(debugPath, data);
        console.log(`\nSaved raw response to ${debugPath}`);

        // Check if it looks like JSON
        try {
            const json = JSON.parse(data.toString('utf8'));
            console.log("\nParsed as JSON:");
            console.log(JSON.stringify(json, null, 2).substring(0, 500) + "...");
        } catch (e) {
            console.log("\nNot valid JSON (expected if binary audio)");
        }

    } catch (error: any) {
        console.error("Axios Error:", error.message);
    }
}

debugDeepInfra();
