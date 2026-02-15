import { smartSynthesize } from '../voice/smartTTSDispatcher';
import { ttsCache } from '../voice/ttsCache';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Benchmark Quick Wins Optimizations
 * Tests: WAV format, TTSCache, and sentence-level chunking
 */

const MOCK_CASE = {
    truth: {
        demographics: { age: 45, sex: 'male', name: 'John Doe', occupation: 'Teacher' },
        emotional_state: 'Anxious',
        history: { chief_complaint: 'Chest pain' },
        conditions: ['chest_pain', 'shortness_of_breath']
    }
};

const TEST_PHRASES = [
    "Hello",                                    // Cacheable
    "It hurts",                                 // Cacheable
    "Since yesterday",                          // Cacheable
    "The pain is in my chest and it feels like pressure.",  // Long
    "I've been experiencing shortness of breath and dizziness." // Long
];

async function runBenchmark() {
    console.log('\n=== TTS Quick Wins Benchmark ===\n');

    // Pre-warm cache with common phrases
    console.log('[Setup] Pre-warming cache...');
    const voiceId = 'am_adam'; // Default male voice
    await ttsCache.warmCache(voiceId);
    console.log('[Setup] Cache ready\n');

    // Test each phrase
    for (let i = 0; i < TEST_PHRASES.length; i++) {
        const phrase = TEST_PHRASES[i];
        console.log(`\n--- Test ${i + 1}: "${phrase.substring(0, 40)}${phrase.length > 40 ? '...' : ''}" ---`);

        // First attempt (may hit cache)
        const start1 = Date.now();
        const result1 = await smartSynthesize(phrase, MOCK_CASE);
        const latency1 = Date.now() - start1;

        console.log(`First attempt: ${latency1}ms`);
        console.log(`Voice used: ${result1.voiceInfo.voiceName} (${result1.voiceInfo.voiceId})`);
        console.log(`Audio size: ${(result1.audioDataUrl.length / 1024).toFixed(2)} KB`);

        // Second attempt (should hit cache if phrase < 50 chars)
        const start2 = Date.now();
        const result2 = await smartSynthesize(phrase, MOCK_CASE);
        const latency2 = Date.now() - start2;

        console.log(`Second attempt: ${latency2}ms`);

        if (latency2 < 100) {
            console.log('✅ CACHE HIT - Instant response!');
        }
    }

    // Cache stats
    console.log('\n--- Cache Statistics ---');
    const stats = ttsCache.getStats();
    console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
    console.log(`Common phrases loaded: ${stats.phrases}`);

    console.log('\n=== Benchmark Complete ===\n');
}

runBenchmark().catch(console.error);
