
import axios from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();

async function testLatency(name: string, agent?: https.Agent) {
    console.log(`\n--- Testing ${name} ---`);

    const payload = {
        text: "This is a latency test for persistent connections.",
        voice: "Adam",
        response_format: "mp3"
    };

    const runTest = async (count: number) => {
        const start = Date.now();
        try {
            await axios.post(DEEPINFRA_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
                httpsAgent: agent
            });
            const duration = Date.now() - start;
            console.log(`[Run ${count}] Latency: ${duration}ms`);
            return duration;
        } catch (e: any) {
            console.error(`[Run ${count}] FAILED: ${e.message}`);
            return null;
        }
    };

    const results = [];
    for (let i = 1; i <= 3; i++) {
        const duration = await runTest(i);
        if (duration) results.push(duration);
    }

    if (results.length > 0) {
        const avg = results.slice(1).reduce((a, b) => a + b, 0) / (results.length - 1);
        console.log(`Average (excluding first run): ${avg.toFixed(2)}ms`);
        console.log(`First run (handshake): ${results[0]}ms`);
        console.log(`Improvement: ${(results[0] - avg).toFixed(2)}ms`);
    }
}

async function run() {
    if (!API_KEY) {
        console.error("Missing DEEPINFRA_TOKEN");
        return;
    }

    // 1. Test without persistent agent (standard behavior)
    await testLatency("Standard (No Keep-Alive)");

    // 2. Test with persistent agent
    const persistentAgent = new https.Agent({ keepAlive: true });
    await testLatency("Persistent (Keep-Alive)", persistentAgent);
}

run();
