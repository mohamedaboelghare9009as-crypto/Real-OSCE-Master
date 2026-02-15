
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const tokenMatch = envContent.match(/DEEPINFRA_TOKEN=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

async function test(label, payload) {
    console.log(`\n--- ${label} ---`);
    try {
        const response = await axios.post(DEEPINFRA_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            validateStatus: () => true
        });
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${JSON.stringify(response.data)}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    if (!token) {
        console.error("Token not found!");
        return;
    }

    const UUID = "ztwqaauovmrne4zmhocy"; // Steve

    // 1. Basic request
    await test("Basic voice_id", {
        text: "Hello",
        voice_id: UUID
    });

    // 2. With all parameters like in ttsService
    await test("Full parameters", {
        text: "Hello world.",
        voice_id: UUID,
        exaggeration: 0.5,
        cfg: 0.5,
        temperature: 0.8,
        response_format: "mp3"
    });

    // 3. With stream: true
    await test("With stream: true", {
        text: "Hello world.",
        voice_id: UUID,
        stream: true
    });
}

run();
