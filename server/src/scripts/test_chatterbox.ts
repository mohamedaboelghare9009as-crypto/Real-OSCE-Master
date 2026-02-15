
import { ttsService } from '../services/ttsService';
import fs from 'fs';
import path from 'path';

async function testChatterbox() {
    console.log("=== Testing Chatterbox TTS ===");

    // Test Case: Acute Pain
    const text = "I... I can't breathe! [cough] It hurts so much! [gasp]";
    console.log(`Input Text: "${text}"`);

    try {
        console.log("Synthesizing Steve (lowercase key check)...");
        const dataUri = await ttsService.synthesize(text, 'steve', 0.9, 0.8, 0.2);

        console.log("\nSynthesizing Tarkos...");
        const tarkosData = await ttsService.synthesize("Hello, I am Tarkos.", 'Tarkos', 0.4, 0.8, 0.5);

        const base64Data = dataUri.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const outputPath = path.join(__dirname, 'test_chatterbox.mp3');
        fs.writeFileSync(outputPath, buffer);

        console.log(`\nSUCCESS: Audio saved to ${outputPath}`);
        console.log(`Size: ${buffer.length} bytes`);
    } catch (e: any) {
        console.error("\nFAILURE:", e.message);
    }
}

testChatterbox();
