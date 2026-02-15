import { ttsService } from '../services/ttsService';
import fs from 'fs';
import path from 'path';

async function testAllCustomVoices() {
    console.log("=== Testing All Custom DeepInfra Voices ===\n");

    const testCases = [
        {
            voice: 'Tarkos',
            text: "Hello, I'm Tarkos. This is a test of my voice with some emotion. [sigh] I hope this sounds natural.",
            exaggeration: 0.5,
            temperature: 0.8
        },
        {
            voice: 'steve',
            text: "Hi there, I'm Steve. [cough] I'm here to help with your medical simulation. [chuckle] How does this sound?",
            exaggeration: 0.6,
            temperature: 0.85
        },
        {
            voice: 'Britney',
            text: "Hey! I'm Britney! [laugh] I'm feeling really anxious right now. [sigh] Can you help me?",
            exaggeration: 0.7,
            temperature: 0.9
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n--- Testing Voice: ${testCase.voice} ---`);
        console.log(`Text: "${testCase.text}"`);
        console.log(`Parameters: exaggeration=${testCase.exaggeration}, temperature=${testCase.temperature}`);

        try {
            const dataUri = await ttsService.synthesize(
                testCase.text,
                testCase.voice,
                testCase.exaggeration,
                testCase.temperature,
                0.6  // Higher CFG for better paralinguistic tags
            );

            const base64Data = dataUri.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');

            const outputPath = path.join(__dirname, `test_${testCase.voice.toLowerCase()}.mp3`);
            fs.writeFileSync(outputPath, buffer);

            console.log(`✅ SUCCESS: Audio saved to ${outputPath}`);
            console.log(`   Size: ${buffer.length} bytes`);
        } catch (e: any) {
            console.error(`❌ FAILURE for ${testCase.voice}:`, e.message);
        }
    }

    console.log("\n=== All Tests Complete ===");
}

testAllCustomVoices();
