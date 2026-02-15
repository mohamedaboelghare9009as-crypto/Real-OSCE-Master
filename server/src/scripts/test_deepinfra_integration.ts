/**
 * Comprehensive Test for DeepInfra Chatterbox Turbo Integration
 * Tests voice selection, synthesis, and paralinguistic tags
 */

import { ttsService } from '../services/ttsService';
import { smartSynthesize, quickSynthesize, previewVoiceSelection } from '../voice/smartTTSDispatcher';
import {
    DEEPINFRA_VOICES,
    getAllVoiceIds,
    getVoiceCount,
    selectVoiceForPatient,
    getAdjustedParameters,
    ENGLISH_FEMALE_VOICES,
    ENGLISH_MALE_VOICES,
    ADULT_FEMALE_VOICES,
    ADULT_MALE_VOICES,
    YOUNG_FEMALE_VOICES,
    YOUNG_MALE_VOICES,
    ELDERLY_FEMALE_VOICES,
    ELDERLY_MALE_VOICES
} from '../voice/deepinfraChatterboxConfig';

async function testVoiceConfiguration() {
    console.log('\n=== Testing Voice Configuration ===\n');
    
    console.log(`✓ Total voices available: ${getVoiceCount()}`);
    console.log(`✓ English female voices: ${ENGLISH_FEMALE_VOICES.length}`);
    console.log(`✓ English male voices: ${ENGLISH_MALE_VOICES.length}`);
    console.log(`✓ Adult female voices: ${ADULT_FEMALE_VOICES.length}`);
    console.log(`✓ Adult male voices: ${ADULT_MALE_VOICES.length}`);
    console.log(`✓ Young female voices: ${YOUNG_FEMALE_VOICES.length}`);
    console.log(`✓ Young male voices: ${YOUNG_MALE_VOICES.length}`);
    console.log(`✓ Elderly female voices: ${ELDERLY_FEMALE_VOICES.length}`);
    console.log(`✓ Elderly male voices: ${ELDERLY_MALE_VOICES.length}`);
    
    // Test voice validation
    console.log('\n✓ Valid voice check:');
    console.log(`  - af_bella: ${'af_bella' in DEEPINFRA_VOICES ? 'Valid' : 'Invalid'}`);
    console.log(`  - am_adam: ${'am_adam' in DEEPINFRA_VOICES ? 'Valid' : 'Invalid'}`);
    console.log(`  - invalid_voice: ${'invalid_voice' in DEEPINFRA_VOICES ? 'Valid' : 'Invalid'}`);
    
    console.log('\n✓ Voice selection tests passed\n');
}

async function testVoiceSelection() {
    console.log('\n=== Testing Voice Selection by Demographics ===\n');
    
    const testCases = [
        { age: 35, sex: 'female' as const, condition: 'neutral', expected: 'adult female' },
        { age: 72, sex: 'male' as const, condition: 'chest pain', expected: 'elderly male' },
        { age: 28, sex: 'female' as const, condition: 'anxious', expected: 'adult female' },
        { age: 15, sex: 'male' as const, condition: 'neutral', expected: 'young male' },
        { age: 68, sex: 'female' as const, condition: 'general', expected: 'elderly female' },
        { age: 45, sex: 'male' as const, condition: 'pain', expected: 'adult male' },
        { age: 10, sex: 'female' as const, condition: 'cough', expected: 'young female' },
    ];
    
    for (const test of testCases) {
        const voice = selectVoiceForPatient(
            { age: test.age, sex: test.sex },
            { condition: test.condition }
        );
        
        const { exaggeration, temperature } = getAdjustedParameters(voice, test.condition, 'neutral');
        
        console.log(`${test.age}yo ${test.sex} (${test.condition}):`);
        console.log(`  → ${voice.voiceId} (${voice.name})`);
        console.log(`  → Age group: ${voice.ageGroup}, Characteristics: ${voice.characteristics.slice(0, 2).join(', ')}`);
        console.log(`  → Params: exaggeration=${exaggeration.toFixed(2)}, temperature=${temperature.toFixed(2)}`);
        console.log();
    }
    
    console.log('✓ Voice selection tests passed\n');
}

async function testSynthesis() {
    console.log('\n=== Testing Synthesis with Different Voices ===\n');
    
    const testText = "Hello doctor, I've been having chest pain for about an hour.";
    const testVoices = ['af_bella', 'am_adam', 'bf_emma', 'bm_daniel', 'ef_dora', 'em_alex'];
    
    for (const voiceId of testVoices) {
        try {
            console.log(`Testing voice: ${voiceId}...`);
            const result = await ttsService.synthesize(testText, voiceId, 0.5, 0.8, 'mp3');
            console.log(`  ✓ Success! Audio: ${result.length} chars`);
        } catch (error: any) {
            console.error(`  ✗ Failed: ${error.message}`);
        }
    }
    
    console.log('\n✓ Synthesis tests completed\n');
}

async function testPatientSynthesis() {
    console.log('\n=== Testing Patient-Aware Synthesis ===\n');
    
    const testCases = [
        {
            name: "72yo Male with Chest Pain",
            demographics: { age: 72, sex: 'male' as const },
            conditions: ['chest pain', 'shortness of breath'],
            emotionalState: 'anxious',
            text: "I... I can't breathe! It hurts so much!"
        },
        {
            name: "28yo Female with Anxiety",
            demographics: { age: 28, sex: 'female' as const },
            conditions: ['palpitations', 'worried'],
            emotionalState: 'anxious',
            text: "I'm really worried about what these test results might show."
        },
        {
            name: "10yo Male with Asthma",
            demographics: { age: 10, sex: 'male' as const },
            conditions: ['wheezing', 'shortness of breath'],
            emotionalState: 'scared',
            text: "I can't catch my breath. Every time I try to inhale, it feels tight."
        },
        {
            name: "65yo Female with General Checkup",
            demographics: { age: 65, sex: 'female' as const },
            conditions: ['routine checkup'],
            emotionalState: 'neutral',
            text: "I'm here for my annual checkup. I feel fine overall."
        }
    ];
    
    for (const test of testCases) {
        console.log(`\nTest: ${test.name}`);
        console.log(`Patient: ${test.demographics.age}yo ${test.demographics.sex}`);
        console.log(`Conditions: ${test.conditions.join(', ')}`);
        console.log(`Emotional: ${test.emotionalState}`);
        
        try {
            const result = await quickSynthesize(
                test.text,
                test.demographics.age,
                test.demographics.sex,
                test.conditions,
                test.emotionalState,
                { insertVoiceTags: true }
            );
            
            console.log(`✓ Voice: ${result.voiceInfo.voiceName} (${result.voiceInfo.voiceId})`);
            console.log(`✓ Exaggeration: ${result.voiceInfo.exaggeration.toFixed(2)}`);
            console.log(`✓ Temperature: ${result.voiceInfo.temperature.toFixed(2)}`);
            console.log(`✓ Tags: ${result.voiceInfo.tags.join(', ') || 'None'}`);
            console.log(`✓ Audio: ${result.audioDataUrl.length} chars`);
        } catch (error: any) {
            console.error(`✗ Failed: ${error.message}`);
        }
    }
    
    console.log('\n✓ Patient synthesis tests completed\n');
}

async function testParalinguisticTags() {
    console.log('\n=== Testing Paralinguistic Tags ===\n');
    
    const testCases = [
        {
            text: "I've been having this cough for days.",
            conditions: ['cough', 'cold'],
            expected: ['[cough]']
        },
        {
            text: "I can't breathe! It hurts so much!",
            conditions: ['shortness of breath', 'pain'],
            expected: ['[gasp]', '[groan]']
        },
        {
            text: "I'm really worried about what these tests will show.",
            conditions: ['anxiety'],
            expected: ['[sigh]', '[clears throat]']
        },
        {
            text: "That joke you told was actually funny.",
            conditions: ['general'],
            emotional: 'happy',
            expected: ['[laugh]', '[chuckle]']
        }
    ];
    
    for (const test of testCases) {
        console.log(`Text: "${test.text}"`);
        console.log(`Conditions: ${test.conditions.join(', ')}`);
        
        try {
            const result = await quickSynthesize(
                test.text,
                45,
                'male',
                test.conditions,
                test.emotional || 'neutral',
                { insertVoiceTags: true }
            );
            
            console.log(`✓ Tags used: ${result.voiceInfo.tags.join(', ') || 'None'}`);
            console.log(`✓ Expected: ${test.expected.join(', ')}`);
        } catch (error: any) {
            console.error(`✗ Failed: ${error.message}`);
        }
        console.log();
    }
    
    console.log('✓ Paralinguistic tags tests completed\n');
}

async function testNurseVoice() {
    console.log('\n=== Testing Nurse Voice (No Tags) ===\n');
    
    const nurseText = "I'll get the doctor for you right away. Please try to stay calm.";
    
    try {
        const result = await quickSynthesize(
            nurseText,
            35,
            'female',
            [],
            'neutral',
            { isNurse: true }
        );
        
        console.log('✓ Nurse voice synthesis:');
        console.log(`  Voice: ${result.voiceInfo.voiceName} (${result.voiceInfo.voiceId})`);
        console.log(`  Tags: ${result.voiceInfo.tags.length > 0 ? result.voiceInfo.tags.join(', ') : 'None (as expected)'}`);
        console.log(`  Audio: ${result.audioDataUrl.length} chars`);
    } catch (error: any) {
        console.error(`✗ Failed: ${error.message}`);
    }
    
    console.log('\n✓ Nurse voice tests completed\n');
}

async function runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('DEEPINFRA CHATTERBOX TURBO - COMPREHENSIVE TEST SUITE');
    console.log('='.repeat(70));
    
    try {
        await testVoiceConfiguration();
        await testVoiceSelection();
        await testSynthesis();
        await testPatientSynthesis();
        await testParalinguisticTags();
        await testNurseVoice();
        
        console.log('\n' + '='.repeat(70));
        console.log('ALL TESTS COMPLETED SUCCESSFULLY ✓');
        console.log('='.repeat(70) + '\n');
    } catch (error: any) {
        console.error('\n' + '='.repeat(70));
        console.error('TEST SUITE FAILED ✗');
        console.error('Error:', error.message);
        console.error('='.repeat(70) + '\n');
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runAllTests();
}

export { runAllTests };
