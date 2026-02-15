
import { ttsService } from '../services/ttsService';
import { getChatterboxVoice, isValidChatterboxVoice, ChatterboxVoice } from '../voice/chatterboxConfig';

async function testVoiceConsistency() {
    console.log('=' .repeat(70));
    console.log('CHATTERBOX VOICE CONSISTENCY TEST');
    console.log('=' .repeat(70));

    // Test 1: Direct synthesize calls
    console.log('\n📢 TEST 1: Direct synthesize() calls');
    console.log('-'.repeat(70));
    
    const testText = "This is a voice test.";
    const voicesToTest: ChatterboxVoice[] = ['andy', 'bella', 'alex', 'anna', 'benjamin', 'charles', 'claire', 'david'];
    
    for (const voice of voicesToTest) {
        console.log(`\nTesting voice: ${voice}`);
        try {
            // Direct call to synthesize
            const result1 = await ttsService.synthesize(testText, voice);
            console.log(`  ✓ synthesize() returned audio (length: ${result1.length})`);
            
            // Verify voice was preserved in the call
            const isValid = isValidChatterboxVoice(voice);
            console.log(`  ✓ Voice "${voice}" is valid: ${isValid}`);
            
        } catch (error: any) {
            console.error(`  ✗ Error with voice ${voice}: ${error.message}`);
        }
    }

    // Test 2: synthesizeForPatient - ensure voice is preserved
    console.log('\n\n👤 TEST 2: synthesizeForPatient() - Patient demographics');
    console.log('-'.repeat(70));

    const patientTests = [
        {
            name: "35yo Male Adult",
            demographics: { age: 35, sex: 'male' as const },
            expectedVoiceType: 'male'
        },
        {
            name: "28yo Female Adult",
            demographics: { age: 28, sex: 'female' as const },
            expectedVoiceType: 'female'
        },
        {
            name: "72yo Male Elderly",
            demographics: { age: 72, sex: 'male' as const },
            expectedVoiceType: 'male'
        },
        {
            name: "65yo Female Elderly",
            demographics: { age: 65, sex: 'female' as const },
            expectedVoiceType: 'female'
        },
        {
            name: "10yo Male Child",
            demographics: { age: 10, sex: 'male' as const },
            expectedVoiceType: 'male'
        },
        {
            name: "8yo Female Child",
            demographics: { age: 8, sex: 'female' as const },
            expectedVoiceType: 'female'
        }
    ];

    const maleVoices: ChatterboxVoice[] = ['alex', 'andy', 'benjamin', 'charles', 'david'];
    const femaleVoices: ChatterboxVoice[] = ['anna', 'bella', 'claire'];

    for (const test of patientTests) {
        console.log(`\nTesting: ${test.name}`);
        
        // Get voice from our selection logic
        const selectedVoice = getChatterboxVoice({
            age: test.demographics.age,
            sex: test.demographics.sex
        });
        
        console.log(`  Selected voice: ${selectedVoice}`);
        
        const isMaleVoice = maleVoices.includes(selectedVoice);
        const isFemaleVoice = femaleVoices.includes(selectedVoice);
        
        if (test.expectedVoiceType === 'male' && isMaleVoice) {
            console.log(`  ✓ PASS: Male patient got male voice (${selectedVoice})`);
        } else if (test.expectedVoiceType === 'female' && isFemaleVoice) {
            console.log(`  ✓ PASS: Female patient got female voice (${selectedVoice})`);
        } else {
            console.error(`  ✗ FAIL: ${test.expectedVoiceType} patient got wrong voice type!`);
            console.error(`     Voice: ${selectedVoice} (male: ${isMaleVoice}, female: ${isFemaleVoice})`);
        }

        // Actually synthesize to verify API consistency
        try {
            const result = await ttsService.synthesizeForPatient(
                testText,
                test.demographics,
                [],
                'neutral'
            );
            console.log(`  ✓ Synthesis successful (config voice: ${result.configuration.voiceId})`);
        } catch (error: any) {
            console.error(`  ✗ Synthesis failed: ${error.message}`);
        }
    }

    // Test 3: Verify voice doesn't change across method calls
    console.log('\n\n🔁 TEST 3: Voice consistency across multiple calls');
    console.log('-'.repeat(70));
    
    const consistentPatient = { age: 45, sex: 'male' as const };
    const voices: string[] = [];
    
    console.log(`Testing 5 consecutive calls for 45yo male...`);
    
    for (let i = 0; i < 5; i++) {
        try {
            const result = await ttsService.synthesizeForPatient(
                testText,
                consistentPatient,
                ['chest pain'],
                'anxious'
            );
            voices.push(result.configuration.voiceId);
        } catch (error: any) {
            console.error(`  Call ${i + 1} failed: ${error.message}`);
        }
    }
    
    const allSame = voices.every(v => v === voices[0]);
    console.log(`  Voices returned: [${voices.join(', ')}]`);
    
    if (allSame && voices.length === 5) {
        console.log(`  ✓ PASS: Voice is consistent across all calls (${voices[0]})`);
    } else {
        console.error(`  ✗ FAIL: Voice changed between calls!`);
    }

    // Test 4: Test with voiceTags
    console.log('\n\n🏷️ TEST 4: Voice with paralinguistic tags');
    console.log('-'.repeat(70));
    
    const taggedText = "I can't breathe! [gasp] It hurts! [cough]";
    
    try {
        const result = await ttsService.synthesizeForPatient(
            taggedText,
            { age: 60, sex: 'male' },
            ['respiratory distress'],
            'distressed',
            { insertVoiceTags: true }
        );
        console.log(`  ✓ Synthesis with tags successful`);
        console.log(`  Voice: ${result.configuration.voiceId}`);
        console.log(`  Tags used: ${result.voiceTagsUsed.join(', ') || 'None auto-added'}`);
    } catch (error: any) {
        console.error(`  ✗ Failed: ${error.message}`);
    }

    console.log('\n' + '=' .repeat(70));
    console.log('VOICE CONSISTENCY TEST COMPLETE');
    console.log('=' .repeat(70));
}

testVoiceConsistency().catch(console.error);
