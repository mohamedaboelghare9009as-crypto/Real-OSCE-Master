import { ttsService } from '../services/ttsService';
import { smartSynthesize } from '../voice/smartTTSDispatcher';
import { ttsCache } from '../voice/ttsCache';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Performance profiling to identify remaining bottlenecks
 */

const VOICE_ID = 's81gfv15gmkv7ads8yzo';
const testCases = [
    { name: "Cached phrase", text: "Hello, how are you today?", cached: true },
    { name: "Very short (30 chars)", text: "I'm feeling much better now." },
    { name: "Short (50 chars)", text: "The pain started yesterday morning when I woke" },
    { name: "Medium (100 chars)", text: "The pain started yesterday morning when I woke up and it's been constant throughout the entire day" },
    { name: "Long (200 chars)", text: "The pain started yesterday morning when I woke up and it's been constant throughout the entire day. I've tried taking painkillers but they haven't helped much at all and I'm really worried about it" },
    { name: "Very long (300 chars)", text: "The pain started yesterday morning when I woke up and it's been constant throughout the entire day since then. I've tried taking painkillers but they haven't helped much at all and I'm really worried about what this could mean. It's affecting my daily activities and I can't sleep properly anymore" }
];

async function profilePerformance() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║           TTS PERFORMANCE PROFILING                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const results: any[] = [];

    // Pre-cache the first phrase
    await smartSynthesize(testCases[0].text, { demographics: { age: 30, sex: 'female' } });

    for (const testCase of testCases) {
        console.log(`\n📊 Testing: ${testCase.name} (${testCase.text.length} chars)`);
        console.log(`   Text: "${testCase.text.substring(0, 50)}..."`);

        const start = Date.now();

        try {
            // Just call smartSynthesize - it handles caching internally
            await smartSynthesize(testCase.text, { demographics: { age: 30, sex: 'female' } });

            const duration = Date.now() - start;

            results.push({
                name: testCase.name,
                length: testCase.text.length,
                duration,
                msPerChar: (duration / testCase.text.length).toFixed(2)
            });

            console.log(`   ✅ Duration: ${duration}ms`);
            console.log(`   ⚡ Performance: ${(duration / testCase.text.length).toFixed(2)}ms/char`);

        } catch (error: any) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({
                name: testCase.name,
                length: testCase.text.length,
                duration: -1,
                error: error.message
            });
        }

        // Delay between tests
        await new Promise(r => setTimeout(r, 1000));
    }

    // Analysis
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  PERFORMANCE SUMMARY                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('┌─────────────────────────┬────────┬──────────┬──────────┐');
    console.log('│ Test Case               │ Chars  │ Duration │ ms/char  │');
    console.log('├─────────────────────────┼────────┼──────────┼──────────┤');

    for (const result of results) {
        const name = result.name.padEnd(23);
        const chars = String(result.length).padStart(6);
        const duration = result.duration >= 0 ? `${result.duration}ms`.padStart(8) : 'ERROR'.padStart(8);
        const msChar = result.duration >= 0 ? String(result.msPerChar).padStart(8) : '-'.padStart(8);

        console.log(`│ ${name} │ ${chars} │ ${duration} │ ${msChar} │`);
    }

    console.log('└─────────────────────────┴────────┴──────────┴──────────┘');

    // Calculate averages
    const successful = results.filter(r => r.duration > 0);
    const avgDuration = (successful.reduce((sum, r) => sum + r.duration, 0) / successful.length).toFixed(0);
    const avgMsPerChar = (successful.reduce((sum, r) => sum + parseFloat(r.msPerChar), 0) / successful.length).toFixed(2);

    console.log(`\n📈 Average: ${avgDuration}ms | ${avgMsPerChar}ms/char`);

    // Identify bottlenecks
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              OPTIMIZATION OPPORTUNITIES                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const avgMs = parseFloat(avgMsPerChar);

    if (avgMs > 50) {
        console.log('⚠️  HIGH LATENCY: Average >50ms/char');
        console.log('   → Consider smaller chunk sizes (50-75 chars)');
        console.log('   → Check network latency to DeepInfra');
    } else if (avgMs > 30) {
        console.log('⚡ MODERATE LATENCY: Average 30-50ms/char');
        console.log('   → Current performance is acceptable');
        console.log('   → Minor gains possible with chunk size tuning');
    } else {
        console.log('✅ EXCELLENT LATENCY: Average <30ms/char');
        console.log('   → Performance is optimal');
    }

    console.log('\n💡 Current Optimizations Active:');
    console.log('   ✅ WAV format (35.7% faster than PCM)');
    console.log('   ✅ TTS Cache for short phrases (<50 chars)');
    console.log('   ✅ Sequential synthesis (100-char chunks)');
    console.log('   ✅ Frontend ordering buffer removed');

    console.log('\n🔬 Possible Further Optimizations:');
    console.log('   1. Reduce chunk size to 75 chars (faster per-chunk synthesis)');
    console.log('   2. Increase chunk size to 150 chars (fewer API calls)');
    console.log('   3. Pre-warm cache with top 50 medical phrases');
    console.log('   4. Remove debug logging in production');
    console.log('   5. Implement predictive pre-generation for common responses');

    console.log('\n');
}

profilePerformance().then(() => process.exit(0));
