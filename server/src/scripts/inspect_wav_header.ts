
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DEEPINFRA_TOKEN = process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY;
const url = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

async function inspectWav() {
    console.log("Checking WAV header from DeepInfra...");

    const payload = {
        text: "Test.",
        voice_id: "s81gfv15gmkv7ads8yzo",
        response_format: "pcm"
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
        console.log("First 100 bytes (hex):", buffer.slice(0, 100).toString('hex'));

        // Look for 'data' chunk
        const dataIndex = buffer.indexOf('data');
        if (dataIndex !== -1) {
            const dataSize = buffer.readUInt32LE(dataIndex + 4);
            console.log(`'data' tag found at index ${dataIndex}. Reported data size: ${dataSize}`);
            console.log(`Bytes after header: ${buffer.length - (dataIndex + 8)}`);
        } else {
            console.log("'data' tag NOT found in the first part of the buffer.");
        }

        fs.writeFileSync(path.join(__dirname, 'inspect_result.wav'), buffer);
        console.log("Saved to inspect_result.wav for manual inspection.");

    } catch (err: any) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Response:", Buffer.from(err.response.data).toString());
        }
    }
}

inspectWav();
