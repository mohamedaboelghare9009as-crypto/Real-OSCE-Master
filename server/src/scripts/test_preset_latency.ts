
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = (process.env.DEEPINFRA_TOKEN || process.env.DEEPINFRA_API_KEY || '').trim();
const URL = 'https://api.deepinfra.com/v1/inference/ResembleAI/chatterbox-turbo';

async function testLatency(voiceId: string, text: string) {
    console.log(`\n--- Testing Latency for Voice: ${voiceId} ---`);
    console.log(`Text: "${text}"`);

    const startTime = Date.now();
    try {
        const response = await axios.post(URL, {
            text,
            voice_id: voiceId,
            response_format: 'mp3'
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        const duration = Date.now() - startTime;
        console.log(`SUCCESS: Response received in ${duration}ms`);
        return duration;
    } catch (error: any) {
        console.error(`FAILED: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

async function run() {
    if (!API_KEY) {
        console.error("Missing API Key");
        return;
    }

    const testText = "I'm not feeling very well today. My chest feels a bit tight.";

    // Test custom voice again (Tarkos)
    await testLatency('wdki0osc9z5j77snyw08', testText);

    // Test a common preset voice (if known) or just try a standard ID
    // Based on ResembleAI docs, standard IDs often look like 'af_bella' or 'am_adam'
    // Let's try to get available voices first if possible, but simplest is to just try a known fast one.
    // DeepInfra often has a set of default voices.

    console.log("\nTrying 'af_bella' (Common Resemble/Chatterbox preset)...");
    await testLatency('af_bella', testText);

    console.log("\nTrying 'am_adam' (Common Resemble/Chatterbox preset)...");
    await testLatency('am_adam', testText);
}

run();
