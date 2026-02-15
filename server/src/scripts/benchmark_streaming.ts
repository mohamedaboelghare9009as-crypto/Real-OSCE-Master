import { ttsService } from '../services/ttsService';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test Streaming vs Non-Streaming Performance
 */

const TEST_TEXT = "The pain started yesterday morning when I woke up and it's been constant since then.";

async function testStandardSynthesis() {
    console.log('\n=== TEST 1: Standard Synthesis (WAV) ===');
    const start = Date.now();

    const result = await ttsService.synthesize(
        TEST_TEXT,
        's81gfv15gmkv7ads8yzo', // Britney
        0.5,
        0.8,
        0.5,
        'wav'
    );

    const duration = Date.now() - start;
    console.log(`✅ Standard WAV: ${duration}ms`);
    console.log(`   Audio size: ${result.length} chars (${(result.length / 1024).toFixed(2)} KB)`);

    return duration;
}

async function testPCMSynthesis() {
    console.log('\n=== TEST 2: Standard Synthesis (PCM) ===');
    const start = Date.now();

    const result = await ttsService.synthesize(
        TEST_TEXT,
        's81gfv15gmkv7ads8yzo', // Britney
        0.5,
        0.8,
        0.5,
        'pcm'
    );

    const duration = Date.now() - start;
    console.log(`✅ Standard PCM: ${duration}ms`);
    console.log(`   Audio size: ${result.length} chars (${(result.length / 1024).toFixed(2)} KB)`);

    return duration;
}

async function testStreamingSynthesis() {
    console.log('\n=== TEST 3: Streaming Synthesis (PCM) ===');
    const start = Date.now();
    let firstChunk = true;
    let ttfb = 0;
    let totalBytes = 0;
    let chunks = 0;

    const stream = ttsService.synthesizeStream(
        TEST_TEXT,
        's81gfv15gmkv7ads8yzo', // Britney
        0.5,
        0.8,
        0.5,
        'pcm'
    );

    for await (const chunk of stream) {
        if (firstChunk) {
            ttfb = Date.now() - start;
            console.log(`⚡ First chunk received: ${ttfb}ms`);
            firstChunk = false;
        }
        totalBytes += chunk.length;
        chunks++;
    }

    const duration = Date.now() - start;
    console.log(`✅ Streaming PCM: ${duration}ms (TTFB: ${ttfb}ms)`);
    console.log(`   Total bytes: ${totalBytes}, Chunks: ${chunks}`);

    return duration;
}

async function runBenchmark() {
    console.log('\n🔬 TTS Performance Benchmark');
    console.log(`Test text: "${TEST_TEXT}"`);
    console.log('='.repeat(60));

    try {
        const wavTime = await testStandardSynthesis();
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s between tests

        const pcmTime = await testPCMSynthesis();
        await new Promise(r => setTimeout(r, 1000));

        const streamTime = await testStreamingSynthesis();

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTS SUMMARY:');
        console.log(`   WAV (standard):     ${wavTime}ms`);
        console.log(`   PCM (standard):     ${pcmTime}ms`);
        console.log(`   PCM (streaming):    ${streamTime}ms`);
        console.log('='.repeat(60));

        if (streamTime < wavTime) {
            const improvement = ((wavTime - streamTime) / wavTime * 100).toFixed(1);
            console.log(`🎉 Streaming is ${improvement}% FASTER`);
        } else {
            const regression = ((streamTime - wavTime) / wavTime * 100).toFixed(1);
            console.log(`⚠️  Streaming is ${regression}% SLOWER!`);
        }

    } catch (error: any) {
        console.error('❌ Benchmark failed:', error.message);
        console.error(error.stack);
    }
}

runBenchmark().then(() => process.exit(0));
