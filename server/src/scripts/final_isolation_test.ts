
import axios from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';

dotenv.config();

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();

async function test(name: string, payload: any, agent?: https.Agent) {
    const start = Date.now();
    try {
        await axios.post(DEEPINFRA_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
            httpsAgent: agent
        });
        const duration = Date.now() - start;
        console.log(`[${name}] Latency: ${duration}ms`);
        return duration;
    } catch (e: any) {
        console.log(`[${name}] FAILED: ${e.message}`);
        return null;
    }
}

async function run() {
    console.log("--- FINAL ISOLATION TEST ---");
    const voiceId = 's81gfv15gmkv7ads8yzo'; // Britney UUID

    const agent = new https.Agent({ keepAlive: true });

    // Scenario A: Field 'voice' (No Agent)
    await test("Field 'voice' / No Agent", { text: "Test.", voice: "Britney", response_format: "mp3" });

    // Scenario B: Field 'voice_id' (No Agent)
    await test("Field 'voice_id' / No Agent", { text: "Test.", voice_id: voiceId, response_format: "mp3" });

    // Scenario C: Field 'voice_id' (With Agent)
    await test("Field 'voice_id' / With Agent", { text: "Test.", voice_id: voiceId, response_format: "mp3" }, agent);

    // Scenario D: Full Payload (The slow one)
    await test("Full Payload / With Agent", {
        text: "Test.",
        voice_id: voiceId,
        response_format: "mp3",
        exaggeration: 0.5,
        temperature: 0.8,
        top_p: 0.95,
        repetition_penalty: 1.2
    }, agent);
}

run();
