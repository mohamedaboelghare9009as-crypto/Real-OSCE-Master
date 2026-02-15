
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_KEY = process.env.DEEPINFRA_API_KEY;
if (!API_KEY) {
    console.error('DEEPINFRA_API_KEY not found in .env');
    process.exit(1);
}

const VOICE_ID = 'am_adam';
const TEXT = "This is a test to see if I am Adam or Alice. [chuckle] Hopefully Adam.";

async function testOpenAICurrent() {
    console.log('\n--- Testing OpenAI Endpoint (Current Implementation) ---');
    const url = 'https://api.deepinfra.com/v1/openai/audio/speech';
    const payload = {
        model: 'ResembleAI/chatterbox-turbo',
        input: TEXT,
        voice: VOICE_ID, // am_adam at root
        response_format: 'mp3',
        exaggeration: 0.8
    };

    try {
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer'
        });
        fs.writeFileSync('debug_openai_current.mp3', Buffer.from(response.data));
        console.log('Success: debug_openai_current.mp3 created (Size: ' + response.data.length + ')');
    } catch (error: any) {
        console.error('Error:', error.response?.data?.toString() || error.message);
    }
}

async function testOpenAIExtraBody() {
    console.log('\n--- Testing OpenAI Endpoint (With extra_body) ---');
    const url = 'https://api.deepinfra.com/v1/openai/audio/speech';

    // Attempting to pass voice in extra_body as suggested
    const payload = {
        model: 'ResembleAI/chatterbox-turbo',
        input: TEXT,
        voice: 'alloy', // Standard placeholder to satisfy validation?
        extra_body: {
            voice: VOICE_ID,
            exaggeration: 0.8
        },
        response_format: 'mp3'
    };

    try {
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer'
        });
        fs.writeFileSync('debug_openai_extrabody.mp3', Buffer.from(response.data));
        console.log('Success: debug_openai_extrabody.mp3 created (Size: ' + response.data.length + ')');
    } catch (error: any) {
        console.error('Error:', error.response?.data?.toString() || error.message);
    }
}

async function testInferenceFlat() {
    console.log('\n--- Testing Inference Endpoint (Flat Structure, voice param) ---');
    const url = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

    // Flat JSON. Using 'voice' instead of 'voice_id'
    const payload = {
        input: TEXT, // inference usually takes 'input' or 'text'? 
        // Validating: most inference endpoints take 'input'
        voice: VOICE_ID,
        response_format: 'mp3',
        exaggeration: 0.8
    };

    try {
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            responseType: 'json' // Inference usually returns JSON with base64 audio
        });

        if (response.data.audio) {
            const buffer = Buffer.from(response.data.audio.replace(/^data:audio\/.*;base64,/, ''), 'base64');
            fs.writeFileSync('debug_inference_flat.mp3', buffer);
            console.log('Success: debug_inference_flat.mp3 created (Size: ' + buffer.length + ')');
        } else {
            console.log('Response (No Audio):', JSON.stringify(response.data).substring(0, 200));
        }

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

async function run() {
    await testOpenAICurrent();
    await testOpenAIExtraBody();
    await testInferenceFlat();
}

run();
