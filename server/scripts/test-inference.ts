
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const DEEPINFRA_TOKEN = process.env.DEEPINFRA_TOKEN;
const URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

async function testTTS() {
    if (!DEEPINFRA_TOKEN) {
        console.error("No token found");
        return;
    }

    console.log("Testing DeepInfra Inference API...");
    try {
        const payload = {
            input: {
                text: "Hello, this is a test of the new inference API.",
                voice: "Adam",
                exaggeration: 0.4,
                cfg: 0.5,
                temperature: 0.8
            },
            response_format: "mp3"
        };

        const startTime = Date.now();
        const response = await axios.post(URL, payload, {
            headers: {
                'Authorization': `Bearer ${DEEPINFRA_TOKEN}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        console.log(`Response size: ${response.data.byteLength} bytes`);
        console.log(`Time taken: ${Date.now() - startTime}ms`);

        if (response.headers['content-type']?.includes('application/json')) {
            const json = JSON.parse(Buffer.from(response.data).toString('utf8'));
            console.log("JSON response keys:", Object.keys(json));
            if (json.audio) {
                console.log("Audio found in JSON (base64)");
            }
        } else {
            console.log("Binary response received.");
        }

    } catch (error: any) {
        if (error.response) {
            console.error(`Error ${error.response.status}:`, Buffer.from(error.response.data).toString('utf8'));
        } else {
            console.error("Error:", error.message);
        }
    }
}

testTTS();
