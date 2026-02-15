
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

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
        } else {
            console.log(`Error Response: ${Buffer.from(response.data).toString('utf8')}`);
        }
    } catch (e: any) {
        console.error(`Request failed: ${e.message}`);
    }
}

async function runTests() {
    if (!API_KEY) {
        console.error("No API key found!");
        return;
    }

    // Test 1: voice_id (current implementation)
    await testPayload("voice_id", {
        text: "This is a test with voice_id.",
        voice_id: "ztwqaauovmrne4zmhocy",
        response_format: "mp3"
    });

    // Test 2: voice (from debug script)
    await testPayload("voice", {
        text: "This is a test with voice.",
        voice: "ztwqaauovmrne4zmhocy",
        response_format: "mp3"
    });

    // Test 3: Preset name
    await testPayload("preset_name", {
        text: "This is a test with preset name.",
        voice: "Steve",
        response_format: "mp3"
    });

    // Test 4: Streaming with voice_id
    await testPayload("streaming_voice_id", {
        text: "This is a test with streaming and voice_id.",
        voice_id: "ztwqaauovmrne4zmhocy",
        response_format: "mp3", // Use mp3 for test since pcm might be tricky to detect
        stream: true
    });
}

runTests();
