
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPaths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server/.env')
];

let envLoaded = false;
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        console.log(`Loading .env from: ${p}`);
        dotenv.config({ path: p });
        envLoaded = true;
        break;
    }
}

if (!envLoaded) console.warn("WARNING: Could not find .env file in standard locations.");

const API_KEY = process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY!;
if (!API_KEY) {
    console.error("ERROR: DEEPINFRA_TOKEN or DEEPINFRA_API_KEY not found in .env");
    process.exit(1);
}

const CUSTOM_VOICE_ID = 'wdki0osc9z5j77snyw08'; // Tarkos

async function debugVoice() {
    console.log("=== Debugging DeepInfra Custom Voice ===");
    console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);
    console.log(`Target Voice ID: ${CUSTOM_VOICE_ID}`);

    // 1. Try to GET voice details (if endpoint exists)
    // The "Create Voice" docs suggest /v1/voices might exist contextually
    /* 
    try {
        console.log("\n--- Checking Voice Details ---");
        const response = await axios.get(`https://api.deepinfra.com/v1/voices/${CUSTOM_VOICE_ID}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log("Voice Found:", response.data);
    } catch (error: any) {
        console.log("Could not GET voice details (might not be a valid endpoint or 404):", error.message);
        if (error.response) console.log("Status:", error.response.status);
    }
    */

    // 2. Try Synthesis with explicit voice_id
    console.log("\n--- Attempting Synthesis ---");
    const payload = {
        text: "This is a test of the custom voice Tarkos.",
        voice_id: CUSTOM_VOICE_ID, // Exact field name from docs
        response_format: "mp3"
    };

    try {
        const start = Date.now();
        const response = await axios.post(
            'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'json' // Expect JSON with audio in base64 or similar? 
                // Documentation says "Output: Waiting for audio data...". Usually binary or JSON with audio field.
                // Chatterbox Turbo usually returns JSON with "audio" field (base64) or direct audio?
                // My ttsService assumes JSON with "audio".
            }
        );

        console.log(`Status: ${response.status}`);
        console.log("Headers:", response.headers);
        console.log("Data Keys:", Object.keys(response.data));

        if (response.data.audio) {
            console.log("Audio field present (starts with):", response.data.audio.substring(0, 50));
            // Save to file to manually check if possible (I can't hear it but I can check size)
            const audioBuffer = Buffer.from(response.data.audio.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
            const outputPath = path.join(__dirname, 'debug_voice_output.mp3');
            fs.writeFileSync(outputPath, audioBuffer);
            console.log(`Saved audio to ${outputPath} (${audioBuffer.length} bytes)`);
        } else {
            console.log("No 'audio' field in response:", response.data);
        }

        if (response.data.inference_status) {
            console.log("Inference Status:", response.data.inference_status);
        }

    } catch (error: any) {
        console.error("Synthesis Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugVoice();
