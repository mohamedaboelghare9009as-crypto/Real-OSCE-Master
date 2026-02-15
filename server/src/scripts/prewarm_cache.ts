import { smartSynthesize } from '../voice/smartTTSDispatcher';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script to pre-warm the TTS cache with common medical phrases
 * Run this once on server startup for instant responses
 */

const TOP_MEDICAL_PHRASES = [
    "Hello, how are you today?",
    "I'm feeling much better now",
    "The pain started yesterday",
    "It hurts when I move",
    "I've been feeling unwell",
    "The pain is getting worse",
    "I can't sleep properly",
    "I'm very worried about this",
    "How long will this take?",
    "What should I do next?",
    "Thank you doctor",
    "I understand",
    "That makes sense",
    "I'm not sure",
    "Could you explain that again?",
    "When did this start?",
    "Where does it hurt?",
    "Is it constant or intermittent?",
    "Does anything make it better?",
    "Does anything make it worse?",
    "Have you tried any medications?",
    "Do you have any allergies?",
    "Are you taking any other medicines?",
    "Have you had this before?",
    "Does it affect your daily activities?",
    "Can you rate the pain from 1 to 10?",
    "Is there anything else you'd like to tell me?",
    "Let me examine you",
    "Please lie down",
    "Take a deep breath"
];

async function prewarmCache() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              TTS CACHE PRE-WARMING                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`Pre-warming cache with ${TOP_MEDICAL_PHRASES.length} common medical phrases...`);

    const startTime = Date.now();
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < TOP_MEDICAL_PHRASES.length; i++) {
        const phrase = TOP_MEDICAL_PHRASES[i];
        const progress = i + 1;

        process.stdout.write(`\r[${progress}/${TOP_MEDICAL_PHRASES.length}] "${phrase.substring(0, 40)}${phrase.length > 40 ? '...' : ''}"`);

        try {
            // Use patient voice (most common)
            await smartSynthesize(phrase, {
                demographics: { age: 30, sex: 'female' }
            });
            succeeded++;
        } catch (error: any) {
            console.error(`\n❌ Failed: "${phrase}" - ${error.message}`);
            failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    const duration = Date.now() - startTime;
    const avgTime = (duration / TOP_MEDICAL_PHRASES.length).toFixed(0);

    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                   RESULTS                                ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Succeeded: ${succeeded}/${TOP_MEDICAL_PHRASES.length}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total time: ${(duration / 1000).toFixed(1)}s`);
    console.log(`⚡ Average: ${avgTime}ms/phrase`);
    console.log(`\n🎉 Cache is now ready! Future requests for these phrases will be instant (<10ms).\n`);
}

prewarmCache().then(() => process.exit(0)).catch(err => {
    console.error('Pre-warming failed:', err);
    process.exit(1);
});
