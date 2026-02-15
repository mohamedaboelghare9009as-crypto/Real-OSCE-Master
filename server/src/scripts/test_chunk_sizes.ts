import { smartSynthesize } from '../voice/smartTTSDispatcher';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test 75-char vs 100-char chunk sizes to find optimal performance
 */

const longText = "The pain started yesterday morning when I woke up and it's been constant throughout the entire day since then. I've tried taking painkillers but they haven't helped much at all and I'm really worried about what this could mean. It's affecting my daily activities and I can't sleep properly anymore because of the discomfort.";

async function testChunkSize(chunkSize: number) {
    console.log(`\n📊 Testing ${chunkSize}-char chunks`);
    console.log(`   Text length: ${longText.length} chars`);

    const chunks = [];
    let remaining = longText;

    while (remaining.length >= chunkSize) {
        chunks.push(remaining.substring(0, chunkSize));
        remaining = remaining.substring(chunkSize);
    }
    if (remaining.trim()) chunks.push(remaining.trim());

    console.log(`   Chunks: ${chunks.length}`);

    const start = Date.now();

    // Simulate sequential synthesis
    for (let i = 0; i < chunks.length; i++) {
        await smartSynthesize(chunks[i], { demographics: { age: 30, sex: 'female' } });
    }

    const duration = Date.now() - start;
    const avgPerChunk = (duration / chunks.length).toFixed(0);

    console.log(`   ✅ Total: ${duration}ms`);
    console.log(`   ⚡ Avg per chunk: ${avgPerChunk}ms`);
    console.log(`   📊 ms/char: ${(duration / longText.length).toFixed(2)}ms/char`);

    return { chunkSize, chunks: chunks.length, duration, avgPerChunk, msPerChar: (duration / longText.length).toFixed(2) };
}

async function compareChunkSizes() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║         CHUNK SIZE OPTIMIZATION TEST                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    const results = [];

    // Test 75-char chunks
    results.push(await testChunkSize(75));
    await new Promise(r => setTimeout(r, 2000));

    // Test 100-char chunks (current)
    results.push(await testChunkSize(100));
    await new Promise(r => setTimeout(r, 2000));

    // Test 125-char chunks
    results.push(await testChunkSize(125));

    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    COMPARISON                            ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('┌─────────────┬────────┬──────────┬────────────┬──────────┐');
    console.log('│ Chunk Size  │ Chunks │ Total    │ Avg/Chunk  │ ms/char  │');
    console.log('├─────────────┼────────┼──────────┼────────────┼──────────┤');

    for (const result of results) {
        const size = `${result.chunkSize} chars`.padEnd(11);
        const chunks = String(result.chunks).padStart(6);
        const total = `${result.duration}ms`.padStart(8);
        const avg = `${result.avgPerChunk}ms`.padStart(10);
        const msChar = String(result.msPerChar).padStart(8);

        console.log(`│ ${size} │ ${chunks} │ ${total} │ ${avg} │ ${msChar} │`);
    }

    console.log('└─────────────┴────────┴──────────┴────────────┴──────────┘');

    // Find best
    const best = results.reduce((prev, curr) =>
        parseFloat(curr.msPerChar) < parseFloat(prev.msPerChar) ? curr : prev
    );

    console.log(`\n🏆 WINNER: ${best.chunkSize}-char chunks (${best.msPerChar}ms/char)`);

    if (best.chunkSize === 100) {
        console.log('   ✅ Current setting is optimal!');
    } else {
        const improvement = (((results.find(r => r.chunkSize === 100)!.duration - best.duration) / results.find(r => r.chunkSize === 100)!.duration) * 100).toFixed(1);
        console.log(`   🚀 ${improvement}% faster than current (100 chars)`);
        console.log(`   💡 RECOMMENDATION: Change CHUNK_SIZE to ${best.chunkSize} in socketService.ts`);
    }

    console.log('\n');
}

compareChunkSizes().then(() => process.exit(0));
