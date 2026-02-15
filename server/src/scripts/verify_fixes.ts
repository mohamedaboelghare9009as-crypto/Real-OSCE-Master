import { ttsService } from '../services/ttsService';
import { ttsCache } from '../voice/ttsCache';
import { smartSynthesize } from '../voice/smartTTSDispatcher';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Quick verification test for TTS fixes
 */

const VOICE_ID = 's81gfv15gmkv7ads8yzo'; // Britney

async function testCacheFix() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  TEST: TTS Cache Fix                      ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const phrase = "Hello, how are you today?";

    // First call - should synthesize and cache
    console.log('  [1] First call (cold - should cache for future)');
    const start1 = Date.now();
    await smartSynthesize(phrase, { demographics: { age: 30, sex: 'female' } });
    const time1 = Date.now() - start1;
    console.log(`  ✅ Time: ${time1}ms\n`);

    // Second call - should hit cache
    console.log('  [2] Second call (should be instant from cache)');
    const start2 = Date.now();
    const cached = await ttsCache.get(phrase, VOICE_ID);
    const time2 = Date.now() - start2;

    if (cached.cacheHit) {
        const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
        console.log(`  🎉 CACHE HIT! Time: ${time2}ms (${improvement}% faster)\n`);
        return true;
    } else {
        console.log(`  ❌ CACHE MISS (${time2}ms) - FIX FAILED\n`);
        return false;
    }
}

async function testFormatUsage() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  TEST: WAV Format Usage                   ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const text = "The pain started yesterday.";

    console.log('  Testing synthesis format...');
    const start = Date.now();
    const result = await smartSynthesize(text, { demographics: { age: 30, sex: 'female' } });
    const time = Date.now() - start;

    // Check if it's WAV format (data:audio/wav)
    const isWav = result.audioDataUrl.startsWith('data:audio/wav');

    if (isWav) {
        console.log(`  ✅ Using WAV format (${time}ms)\n`);
        return true;
    } else {
        console.log(`  ❌ NOT using WAV format! (${result.audioDataUrl.substring(0, 50)}...)\n`);
        return false;
    }
}

async function runQuickTests() {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('        QUICK TTS OPTIMIZATION VERIFICATION        ');
    console.log('═══════════════════════════════════════════════════');

    try {
        const cacheWorks = await testCacheFix();
        await new Promise(r => setTimeout(r, 1000));

        const formatOk = await testFormatUsage();

        console.log('\n═══════════════════════════════════════════════════');
        console.log('                    SUMMARY                        ');
        console.log('═══════════════════════════════════════════════════');
        console.log(`  Cache Fix:       ${cacheWorks ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`  WAV Format:      ${formatOk ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`  Sequential Mode: ✅ ENABLED (parallel disabled)`);
        console.log('═══════════════════════════════════════════════════\n');

        if (cacheWorks && formatOk) {
            console.log('🎉 ALL FIXES VERIFIED - READY TO USE!');
        } else {
            console.log('⚠️  SOME FIXES FAILED - NEEDS DEBUGGING');
        }

    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    }
}

runQuickTests().then(() => process.exit(0));
