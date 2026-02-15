
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
        if (response.status === 200) {
            console.log(`Success! Data length: ${response.data.byteLength || response.data.length} bytes`);
        } else {
            console.log(`Body: ${JSON.stringify(response.data)}`);
        }
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

    // Test: Full parameters WITHOUT stream: true
    await test("Full parameters (No Stream)", {
        text: "The voice system is now operational.",
        voice_id: UUID,
        exaggeration: 0.5,
        cfg: 0.5,
        temperature: 0.8,
        response_format: "mp3"
    });
}

run();
