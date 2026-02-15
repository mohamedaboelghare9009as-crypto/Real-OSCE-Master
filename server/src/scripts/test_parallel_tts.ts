
import { ttsService } from '../services/ttsService';
import { voiceTagsEngine } from '../voice/tags/voiceTagsEngine';
import fs from 'fs';
import path from 'path';

async function testOptimization() {
    console.log("=== Testing TTS Optimization & Paralinguistics ===");

    // 1. Test Tag Placement Naturalness
    console.log("\n--- Testing Tag Placement ---");
    const longText = "I have been feeling very short of breath lately, especially when I walk up the stairs. It is quite worrying, to be honest... I just don't know what is wrong with me. I've tried taking it easy, but even just sitting here, I feel like I'm not getting enough air. My chest feels tight, and sometimes I get this sharp pain right here. It's been going on for a few days now, and I'm starting to get really scared. Do you think it could be something serious? My father had heart problems, you see.";
    const context = {
        conditions: ['respiratory', 'breathless', 'chest pain', 'heart problems'],
        emotionalState: 'worried',
        sentencePosition: 'start' as const,
        sentenceLength: 10,
        paragraphIndex: 0,
        totalParagraphs: 1
    };

    const taggedText = voiceTagsEngine.insertTags(longText, context);
    console.log("Original:", longText);
    console.log("Tagged:  ", taggedText);

    // Verify formatting
    const tagMatch = taggedText.match(/\[[a-z ]+\]/g);
    console.log("Found Tags:", tagMatch || "None");

    // 2. Test Parallel Synthesis Speed
    console.log("\n--- Testing Parallel Synthesis Speed ---");
    const startTime = Date.now();

    try {
        const audioDataUrl = await ttsService.synthesize(
            taggedText,
            'am_adam',
            0.5,
            0.8,
            0.5,
            'mp3'
        );

        const duration = Date.now() - startTime;
        console.log(`\nSynthesis took ${duration}ms for ${taggedText.length} characters.`);

        const base64Data = audioDataUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const outputPath = path.join(__dirname, 'test_parallel_result.mp3');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Audio saved to ${outputPath} (${buffer.length} bytes)`);

    } catch (error: any) {
        console.error("Synthesis failed:", error.message);
    }
}

testOptimization();
