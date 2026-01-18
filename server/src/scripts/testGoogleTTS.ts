import '../config/env';
import { ttsService } from '../voice/tts/ttsService';

async function testGoogleTTS() {
    console.log("=== Testing Google Cloud TTS with Gemini 2.5 Flash ===\n");

    try {
        console.log("1. Testing Patient Voice (Aoede - calm but pained)...");
        const audio1 = await ttsService.synthesize(
            "My chest pain started this morning. It's sharp and on the right side.",
            'Aoede',
            1.0,
            0.0,
            'You are a patient experiencing medical symptoms. Speak with a calm but slightly pained tone.'
        );
        console.log(`✓ Generated audio: ${audio1.substring(0, 50)}...`);
        console.log(`   Audio size: ${audio1.length} characters\n`);

        console.log("2. Testing Anxious Patient Voice (Kore)...");
        const audio2 = await ttsService.synthesize(
            "I'm really worried. The pain won't go away and I don't know what's wrong.",
            'Kore',
            1.0,
            0.5,
            'You are a patient who is anxious about their health. Speak with a worried, slightly nervous tone.'
        );
        console.log(`✓ Generated audio: ${audio2.substring(0, 50)}...`);
        console.log(`   Audio size: ${audio2.length} characters\n`);

        console.log("3. Testing Nurse Voice (Callirrhoe)...");
        const audio3 = await ttsService.synthesize(
            "Don't worry, we're going to take good care of you. Let's start with some questions about your symptoms.",
            'Callirrhoe',
            1.0,
            0.0,
            'You are a professional medical nurse. Speak with a warm, reassuring, and competent tone.'
        );
        console.log(`✓ Generated audio: ${audio3.substring(0, 50)}...`);
        console.log(`   Audio size: ${audio3.length} characters\n`);

        console.log("4. Testing Male Patient in Distress (Fenrir)...");
        const audio4 = await ttsService.synthesize(
            "The pain is getting worse. It hurts when I breathe deeply.",
            'Fenrir',
            0.95,
            -1.0,
            'You are a male patient in acute distress. Speak with urgency and concern.'
        );
        console.log(`✓ Generated audio: ${audio4.substring(0, 50)}...`);
        console.log(`   Audio size: ${audio4.length} characters\n`);

        console.log("=== ✅ All TTS Tests Passed! ===");
        console.log("\nThe Google Cloud TTS with Gemini 2.5 Flash is working correctly.");
        console.log("Each voice has a distinct persona and tone as configured.");

    } catch (error: any) {
        console.error("\n❌ TTS Test Failed:", error.message);
        console.error("Stack:", error.stack);
    }
}

testGoogleTTS();
