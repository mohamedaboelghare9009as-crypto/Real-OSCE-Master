
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Force load env from server directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY;

async function testPayload(label: string, payload: any) {
    console.log(`\n--- Testing ${label} ---`);
    console.log(`Payload: ${JSON.stringify(payload)}`);

    try {
        const response = await axios.post(DEEPINFRA_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            validateStatus: () => true
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.status === 200) {
            console.log(`Success! Audio size: ${response.data.byteLength} bytes`);

            // Inspect first 48 bytes for headers or format hints
            const buffer = Buffer.from(response.data);
            const header = buffer.slice(0, 48);
            console.log(`First 48 bytes (Hex): ${header.toString('hex')}`);
            console.log(`First 48 bytes (ASCII): ${header.toString('utf8').replace(/[^\x20-\x7E]/g, '.')}`);

            // It seems we are getting JSON! Let's see the structure.
            const text = buffer.toString('utf8');
            console.log(`Response Start (500 chars): ${text.substring(0, 500)}`);

            // Heuristic check for Float32 vs Int16
            // Float32 values are usually -1.0 to 1.0. 
            // In little-endian, small floats (e.g. 0.1) look like: cd cc cc 3d
            // Int16 values for speech (loud) use full range.

        } else {
            const errorBody = Buffer.from(response.data).toString('utf8');
            console.log(`Error Response Body: ${errorBody}`);
        }
    } catch (e: any) {
        console.error(`Request failed: ${e.message}`);
    }
}

async function runTests() {
    if (!API_KEY) {
        console.error("No API key found in process.env.DEEPINFRA_TOKEN or DEEPINFRA_API_KEY");
        console.log("Current env keys:", Object.keys(process.env).filter(k => k.includes('DEEP')));
        return;
    }

    const UUID = "ztwqaauovmrne4zmhocy"; // Steve

    // Test A: voice_id + mp3 (Should work if valid)
    await testPayload("voice_id + mp3", {
        text: "This is a test with voice_id and mp3.",
        voice_id: UUID,
        response_format: "mp3"
    });

    // Test B: voice_id + pcm (Checking if PCM is the issue)
    await testPayload("voice_id + pcm", {
        text: "This is a test with voice_id and pcm.",
        voice_id: UUID,
        response_format: "pcm"
    });

    // Test C: voice_id + stream: true + mp3
    await testPayload("voice_id + stream + mp3", {
        text: "This is a test with voice_id and stream.",
        voice_id: UUID,
        response_format: "mp3",
        stream: true
    });

    // Test D: voice_id + stream: true + pcm (This is what smartSynthesizeStream uses)
    await testPayload("voice_id + stream + pcm", {
        text: "This is a test with voice_id, stream and pcm.",
        voice_id: UUID,
        response_format: "pcm",
        stream: true
    });
}

runTests();
