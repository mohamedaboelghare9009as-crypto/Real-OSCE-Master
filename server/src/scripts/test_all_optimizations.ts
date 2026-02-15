import { ttsService } from '../services/ttsService';
import { ttsCache } from '../voice/ttsCache';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive End-to-End TTS Optimization Tests
 * Tests all optimizations:
 * 1. Cache (instant for common phrases)
 * 2. WAV format (baseline)
 * 3. Streaming API (PCM streaming)
 * 4. Chunk size (100 vs 150)
 * 5. Parallel synthesis (simulated)
 */

const VOICE_ID = 's81gfv15gmkv7ads8yzo'; // Britney

async function testCache() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 1: TTS Cache');
    console.log('='.repeat(60));

    const commonPhrase = "Hello, how can I help you?";

    // First request (cache miss)
    console.log('\n  [1.1] Cache MISS (cold start)');
    const start1 = Date.now();
    await ttsService.synthesize(commonPhrase, VOICE_ID, 0.5, 0.8, 0.5, 'wav');
    const time1 = Date.now() - start1;
    console.log(`  ✅ Time: ${time1}ms`);

    // Second request (cache hit)
    console.log('\n  [1.2] Cache HIT (should be instant)');
    const start2 = Date.now();
    const cached = await ttsCache.get(commonPhrase, VOICE_ID);
    const time2 = Date.now() - start2;

    if (cached) {
        console.log(`  ✅ Time: ${time2}ms (${((time1 - time2) / time1 * 100).toFixed(1)}% faster)`);
    } else {
        console.log(`  ❌ Cache miss (unexpected)`);
    }
}

async function testFormats() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 2: Audio Formats');
    console.log('='.repeat(60));

    const text = "The pain started yesterday morning.";

    // Test WAV
    console.log('\n  [2.1] WAV Format');
    const wavStart = Date.now();
    const wavResult = await ttsService.synthesize(text, VOICE_ID, 0.5, 0.8, 0.5, 'wav');
    const wavTime = Date.now() - wavStart;
    console.log(`  ✅ Time: ${wavTime}ms, Size: ${(wavResult.length / 1024).toFixed(2)} KB`);

    // Test PCM
    console.log('\n  [2.2] PCM Format');
    const pcmStart = Date.now();
    const pcmResult = await ttsService.synthesize(text, VOICE_ID, 0.5, 0.8, 0.5, 'pcm');
    const pcmTime = Date.now() - pcmStart;
    console.log(`  ✅ Time: ${pcmTime}ms, Size: ${(pcmResult.length / 1024).toFixed(2)} KB`);

    if (wavTime < pcmTime) {
        console.log(`\n  🏆 WAV is ${((pcmTime - wavTime) / pcmTime * 100).toFixed(1)}% faster (CORRECT CHOICE)`);
    } else {
        console.log(`\n  ⚠️  PCM is ${((wavTime - pcmTime) / wavTime * 100).toFixed(1)}% faster`);
    }
}

async function testStreaming() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 3: Streaming API');
    console.log('='.repeat(60));

    const text = "The pain started yesterday morning when I woke up.";

    // Standard synthesis
    console.log('\n  [3.1] Standard Synthesis (WAV)');
    const standardStart = Date.now();
    await ttsService.synthesize(text, VOICE_ID, 0.5, 0.8, 0.5, 'wav');
    const standardTime = Date.now() - standardStart;
    console.log(`  ✅ Time: ${standardTime}ms`);

    // Streaming synthesis
    console.log('\n  [3.2] Streaming Synthesis (PCM)');
    const streamStart = Date.now();
    let ttfb = 0;
    let chunks = 0;

    const stream = ttsService.synthesizeStream(text, VOICE_ID, 0.5, 0.8, 0.5, 'pcm');
    for await (const chunk of stream) {
        if (chunks === 0) {
            ttfb = Date.now() - streamStart;
        }
        chunks++;
    }

    const streamTime = Date.now() - streamStart;
    console.log(`  ✅ Time: ${streamTime}ms, TTFB: ${ttfb}ms, Chunks: ${chunks}`);

    if (streamTime < standardTime) {
        console.log(`\n  🏆 Streaming is ${((standardTime - streamTime) / standardTime * 100).toFixed(1)}% faster`);
    } else {
        console.log(`\n  ⚠️  Standard is ${((streamTime - standardTime) / streamTime * 100).toFixed(1)}% faster`);
    }
}

async function testParallelSimulation() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 4: Parallel vs Sequential Synthesis');
    console.log('='.repeat(60));

    const chunks = [
        "The pain started yesterday morning when I woke up.",
        "It's been constant and getting worse throughout the day.",
        "I'm really worried about what this could mean for me."
    ];

    // Sequential
    console.log('\n  [4.1] Sequential Synthesis (3 chunks)');
    const seqStart = Date.now();
    for (const chunk of chunks) {
        await ttsService.synthesize(chunk, VOICE_ID, 0.5, 0.8, 0.5, 'wav');
    }
    const seqTime = Date.now() - seqStart;
    console.log(`  ✅ Time: ${seqTime}ms (avg: ${(seqTime / chunks.length).toFixed(0)}ms/chunk)`);

    // Parallel
    console.log('\n  [4.2] Parallel Synthesis (3 chunks)');
    const parStart = Date.now();
    await Promise.all(chunks.map(chunk =>
        ttsService.synthesize(chunk, VOICE_ID, 0.5, 0.8, 0.5, 'wav')
    ));
    const parTime = Date.now() - parStart;
    console.log(`  ✅ Time: ${parTime}ms (avg: ${(parTime / chunks.length).toFixed(0)}ms/chunk)`);

    const speedup = ((seqTime - parTime) / seqTime * 100).toFixed(1);
    console.log(`\n  🏆 Parallel is ${speedup}% faster (${(seqTime / parTime).toFixed(1)}x speedup)`);
}

async function testChunkSizes() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 5: Chunk Size Optimization');
    console.log('='.repeat(60));

    const longText = "The pain started yesterday morning when I woke up and it's been constant since then. I've tried taking painkillers but they haven't helped much.";

    const sizes = [50, 75, 100, 150];

    for (const size of sizes) {
        const chunks = [];
        let remaining = longText;

        while (remaining.length >= size) {
            chunks.push(remaining.substring(0, size));
            remaining = remaining.substring(size);
        }
        if (remaining.trim()) chunks.push(remaining.trim());

        console.log(`\n  [5.${sizes.indexOf(size) + 1}] Chunk size ${size} chars (${chunks.length} chunks)`);
        const start = Date.now();

        await Promise.all(chunks.map(chunk =>
            ttsService.synthesize(chunk, VOICE_ID, 0.5, 0.8, 0.5, 'wav')
        ));

        const time = Date.now() - start;
        const avgTime = (time / chunks.length).toFixed(0);
        console.log(`  ✅ Total: ${time}ms, Avg: ${avgTime}ms/chunk`);
    }
}

async function runAllTests() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║       COMPREHENSIVE TTS OPTIMIZATION TEST SUITE         ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    try {
        await testCache();
        await new Promise(r => setTimeout(r, 2000));

        await testFormats();
        await new Promise(r => setTimeout(r, 2000));

        await testStreaming();
        await new Promise(r => setTimeout(r, 2000));

        await testParallelSimulation();
        await new Promise(r => setTimeout(r, 2000));

        await testChunkSizes();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETE');
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ TEST SUITE FAILED:', error.message);
        console.error(error.stack);
    }
}

runAllTests().then(() => process.exit(0));
