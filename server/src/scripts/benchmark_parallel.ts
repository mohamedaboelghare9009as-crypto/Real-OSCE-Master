
import axios from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';

dotenv.config();

const DEEPINFRA_URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';
const API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();

async function runParallelTest(name: string, agent: https.Agent | undefined, requests: number) {
    console.log(`\n--- Starting ${name} (${requests} parallel requests) ---`);

    // Create an array of promises to fire simultaneously
    const promises = Array.from({ length: requests }).map(async (_, index) => {
        const start = Date.now();
        try {
            await axios.post(DEEPINFRA_URL, {
                text: `Test sentence ${index}.`,
                voice_id: "s81gfv15gmkv7ads8yzo", // Britney
                response_format: "mp3"
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
                httpsAgent: agent
            });
            const duration = Date.now() - start;
            // console.log(`[${name}] Request ${index} finished in ${duration}ms`);
            return duration;
        } catch (e: any) {
            console.error(`[${name}] Request ${index} FAILED: ${e.message}`);
            return null;
        }
    });

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const validResults = results.filter(r => r !== null) as number[];
    if (validResults.length > 0) {
        const avg = validResults.reduce((a, b) => a + b, 0) / validResults.length;
        const max = Math.max(...validResults);
        const min = Math.min(...validResults);

        console.log(`[${name}] Results:`);
        console.log(`  Total Batch Time: ${totalTime}ms`);
        console.log(`  Average Latency: ${avg.toFixed(2)}ms`);
        console.log(`  Min Latency: ${min}ms`);
        console.log(`  Max Latency: ${max}ms`);
        console.log(`  Success Rate: ${validResults.length}/${requests}`);
    } else {
        console.log(`[${name}] All requests failed.`);
    }
}

async function run() {
    // 1. Baseline: No Agent (Parallel connections created by OS/Node)
    await runParallelTest("Baseline (No Keep-Alive)", undefined, 5);

    // 2. Pooled: Shared Agent with Keep-Alive
    // Use similar settings to current ConnectionManager
    const pooledAgent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 10000,
        maxSockets: Infinity, // Allow unlimited parallel sockets
        maxFreeSockets: 256,
        scheduling: 'lifo'
    });

    // Warm up the pool slightly
    await runParallelTest("Pool Warmup", pooledAgent, 1);

    // Actual Test
    await runParallelTest("Pooled (Keep-Alive)", pooledAgent, 5);
}

run();
