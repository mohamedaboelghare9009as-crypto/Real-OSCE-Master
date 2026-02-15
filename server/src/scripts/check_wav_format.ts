
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEEPINFRA_TOKEN = process.env.DEEPINFRA_TOKEN || 'vPVVf57LINOs3Lzyw4yy5pk6TLYKLU3I';
const url = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

async function checkFormat(format: 'mp3' | 'pcm' | 'wav') {
    console.log(`\n--- Checking format: ${format} ---`);
    const payload = {
        text: "Testing the audio format.",
        voice_id: "s81gfv15gmkv7ads8yzo", // Britney
        response_format: format
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${DEEPINFRA_TOKEN}`,
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data);
        console.log(`Received ${buffer.length} bytes`);
        console.log("First 16 bytes (hex):", buffer.slice(0, 16).toString('hex'));
        console.log("First 16 bytes (ASCII):", buffer.slice(0, 16).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));

        if (format === 'wav' || buffer.slice(0, 4).toString() === 'RIFF') {
            const sampleRate = buffer.readUInt32LE(24);
            console.log(`Detected Sample Rate (WAV header): ${sampleRate}`);
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

async function run() {
    await checkFormat('mp3');
    await checkFormat('pcm');
    await checkFormat('wav');
}

run();
