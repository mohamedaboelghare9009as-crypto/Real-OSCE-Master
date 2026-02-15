
import * as dotenv from 'dotenv';
import path from 'path';

// Force load env from server directory BEFORE importing services
dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log(`[Verify] Loading env from: ${path.join(__dirname, '../../.env')}`);

import { smartSynthesizeStream } from '../voice/smartTTSDispatcher';

async function verifyTTS() {
    console.log("=== Verifying TTS Service ===");

    const text = "I am feeling [cough] really terrible today. My chest hurts.";
    const mockCaseData = {
        truth: {
            demographics: { age: 65, sex: 'male', name: 'John Doe' },
            emotional_state: 'agony',
            conditions: ['severe chest pain']
        }
    };

    console.log(`Input Text: "${text}"`);
    console.log("Patient: 65yo Male, Anxious, Chest Pain");

    try {
        const stream = smartSynthesizeStream(text, mockCaseData, {
            insertVoiceTags: true
        });

        let chunkCount = 0;
        let totalBytes = 0;
        const startTime = Date.now();

        console.log("\nStarting Stream...");

        for await (const chunk of stream) {
            chunkCount++;
            const hex = chunk.slice(0, 4).toString('hex');
            console.log(`[Chunk ${chunkCount}] received: ${chunk.length} bytes (First 4 bytes: ${hex})`);
            totalBytes += chunk.length;
        }

        const duration = Date.now() - startTime;
        console.log(`\nStream Complete!`);
        console.log(`Total Chunks: ${chunkCount}`);
        console.log(`Total Bytes: ${totalBytes}`);
        console.log(`Total Time: ${duration}ms`);

        if (totalBytes > 1000) {
            console.log("✅ Audio data received (Size looks reasonable)");
        } else {
            console.error("❌ Audio data too small (Likely silence or error)");
        }

    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message);
        console.error(error);
    }
}

verifyTTS();
