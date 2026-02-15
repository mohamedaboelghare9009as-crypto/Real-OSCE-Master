
import { ttsService } from '../services/ttsService';
import fs from 'fs';
import path from 'path';

async function testGoogleTTS() {
    console.log("=== Testing Google Cloud TTS (Existing Implementation) ===");

    // Test Case 1: Plain Text
    console.log("\n1. Testing Plain Text:");
    const plainText = "Hello, I'm feeling some chest pain. It started about an hour ago.";
    console.log(`Input: "${plainText}"`);

    try {
        const audioDataPlain = await ttsService.synthesize(
            plainText,
            'en-US-Journey-D', // Google Journey voice
            1.0,
            0.0,
            false // Not SSML
        );

        if (audioDataPlain.startsWith('data:audio/mp3;base64,')) {
            const base64 = audioDataPlain.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');
            const outputPath = path.join(__dirname, 'test_google_plain.mp3');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ SUCCESS: Plain text audio saved to ${outputPath}`);
            console.log(`Size: ${buffer.length} bytes`);
        } else {
            console.log(`✓ Mock mode (no credentials): ${audioDataPlain.substring(0, 50)}...`);
        }
    } catch (e: any) {
        console.error(`✗ FAILURE:`, e.message);
    }

    // Test Case 2: SSML with Prosody
    console.log("\n2. Testing SSML with Prosody:");
    const ssml = `<speak><prosody rate="0.85" pitch="-2st">I'm having trouble breathing. <break time="500ms"/> The pain is getting worse.</prosody></speak>`;
    console.log(`Input SSML: "${ssml}"`);

    try {
        const audioDataSsml = await ttsService.synthesize(
            ssml,
            'en-US-Journey-D',
            1.0, // speed controlled in SSML
            0.0, // pitch controlled in SSML
            true // Is SSML
        );

        if (audioDataSsml.startsWith('data:audio/mp3;base64,')) {
            const base64 = audioDataSsml.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');
            const outputPath = path.join(__dirname, 'test_google_ssml.mp3');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ SUCCESS: SSML audio saved to ${outputPath}`);
            console.log(`Size: ${buffer.length} bytes`);
        } else {
            console.log(`✓ Mock mode (no credentials): ${audioDataSsml.substring(0, 50)}...`);
        }
    } catch (e: any) {
        console.error(`✗ FAILURE:`, e.message);
    }

    // Test Case 3: Different Voice (Female)
    console.log("\n3. Testing Female Voice:");
    const femaleText = "I've been feeling tired lately. It's been going on for about two weeks.";
    console.log(`Input: "${femaleText}"`);

    try {
        const audioDataFemale = await ttsService.synthesize(
            femaleText,
            'en-US-Journey-F', // Female Journey voice
            1.0,
            0.0,
            false
        );

        if (audioDataFemale.startsWith('data:audio/mp3;base64,')) {
            const base64 = audioDataFemale.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');
            const outputPath = path.join(__dirname, 'test_google_female.mp3');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ SUCCESS: Female voice audio saved to ${outputPath}`);
            console.log(`Size: ${buffer.length} bytes`);
        } else {
            console.log(`✓ Mock mode (no credentials): ${audioDataFemale.substring(0, 50)}...`);
        }
    } catch (e: any) {
        console.error(`✗ FAILURE:`, e.message);
    }

    console.log("\n=== Test Complete ===");
    console.log("Note: If running without Google Cloud credentials, the service will use mock data.");
    console.log("Check for osce-ai-sim-d5b457979ae1.json in server directory for real audio generation.");
}

testGoogleTTS();
