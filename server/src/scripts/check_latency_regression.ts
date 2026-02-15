
import axios from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';

dotenv.config();

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();

async function singleCall(name: string, agent?: https.Agent) {
    const start = Date.now();
    try {
        await axios.post(DEEPINFRA_URL, {
            text: "Short test.",
            voice: "Adam",
            response_format: "mp3"
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
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
    console.log("--- Starting Isolation Test ---");

    // 1. Warm up server (No agent)
    await singleCall("No-Agent Warmup");

    // 2. Test Baseline (No agent)
    await singleCall("No-Agent Baseline 1");
    await singleCall("No-Agent Baseline 2");

    // 3. Test Keep-Alive (Shared agent)
    const agent = new https.Agent({ keepAlive: true });
    await singleCall("Keep-Alive Warmup", agent);
    await singleCall("Keep-Alive Test 1", agent);
    await singleCall("Keep-Alive Test 2", agent);
}

run();
