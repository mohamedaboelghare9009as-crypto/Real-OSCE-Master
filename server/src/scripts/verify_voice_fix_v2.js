
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
            responseType: 'arraybuffer',
            validateStatus: () => true
        });
        console.log(`Status: ${response.status}`);
        if (response.status === 200) {
            const buffer = Buffer.from(response.data);
            console.log(`Success! Data length: ${buffer.length} bytes`);
            console.log(`Magic: ${buffer.subarray(0, 4).toString('hex')} (${buffer.subarray(0, 4).toString('ascii')})`);

            // Check for MP3 signature (ID3 or 0xFF)
            if (buffer[0] === 0xFF || buffer.subarray(0, 3).toString() === 'ID3') {
                console.log("Confirmed: Valid MP3 signature.");
            } else {
                console.log("Warning: Does not look like standard MP3.");
            }
        } else {
            console.log(`Body: ${Buffer.from(response.data).toString('utf8')}`);
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

    await test("MP3 Synthesis Test", {
        text: "The voice system is now operational.",
        voice_id: UUID,
        response_format: "mp3"
    });
}

run();
