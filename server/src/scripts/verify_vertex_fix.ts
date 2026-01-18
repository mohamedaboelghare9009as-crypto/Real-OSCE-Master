
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { IntentResolver } from '../engine/core/IntentResolver';

async function main() {
    console.log("=== Verifying Vertex AI Fix ===");
    console.log("Model ID expected: publishers/google/models/gemini-1.5-flash");
    console.log("Region expected: us-central1");

    try {
        const resolver = new IntentResolver();
        console.log("IntentResolver initialized.");

        const query = "Can you explain the socio-economic implications of medical simulations?";
        console.log(`Testing query: "${query}"`);

        const result = await resolver.resolve(query);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.confidence > 0) {
            console.log("✅ SUCCESS: Intent resolved successfully.");
        } else {
            console.log("⚠️ WARNING: Intent resolved but confidence is 0 (fallback?).");
        }

    } catch (error: any) {
        console.error("❌ FAILED: ", error);
    }
}

main();
