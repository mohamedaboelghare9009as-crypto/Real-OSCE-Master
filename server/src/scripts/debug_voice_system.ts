
/**
 * Voice Debug Test
 * Tests voice selection with actual case data
 */

import { extractPatientProfile } from '../voice/patientProfileExtractor';
import { selectVoiceForPatient, getAdjustedParameters, isValidVoiceId } from '../voice/deepinfraChatterboxConfig';
import { smartSynthesize } from '../voice/smartTTSDispatcher';
import { ttsService } from '../services/ttsService';

// Test case data structures
const testCases = [
    {
        name: "Mock Case V2 (Male, 55, Chest Pain)",
        data: {
            truth: {
                demographics: {
                    age: 55,
                    sex: 'Male',
                    occupation: 'Accountant'
                },
                chief_complaint: 'I have a crushing pain in my chest.',
                emotional_state: "Anxious, in severe pain, scared of dying"
            }
        }
    },
    {
        name: "Elderly Female",
        data: {
            truth: {
                demographics: {
                    age: 72,
                    sex: 'Female',
                    name: 'Mrs. Davis'
                },
                chief_complaint: 'Back pain',
                emotional_state: 'tired'
            }
        }
    },
    {
        name: "Young Male",
        data: {
            truth: {
                demographics: {
                    age: 16,
                    sex: 'Male'
                },
                chief_complaint: 'Sprained ankle',
                emotional_state: 'neutral'
            }
        }
    },
    {
        name: "Middle-aged Female Anxiety",
        data: {
            truth: {
                demographics: {
                    age: 35,
                    sex: 'Female'
                },
                chief_complaint: 'Palpitations',
                emotional_state: 'anxious'
            }
        }
    }
];

async function testVoiceSelection() {
    console.log('\n=== Testing Voice Selection ===\n');
    
    for (const testCase of testCases) {
        console.log(`\nTest: ${testCase.name}`);
        console.log('Data:', JSON.stringify(testCase.data, null, 2));
        
        try {
            // Extract profile
            const profile = extractPatientProfile(testCase.data);
            console.log('Extracted Profile:');
            console.log(`  Age: ${profile.demographics.age}`);
            console.log(`  Sex: ${profile.demographics.sex}`);
            console.log(`  Name: ${profile.demographics.name || 'N/A'}`);
            console.log(`  Conditions: ${profile.conditions.join(', ') || 'None'}`);
            console.log(`  Emotional: ${profile.emotionalState}`);
            
            // Select voice
            const voice = selectVoiceForPatient(
                { age: profile.demographics.age, sex: profile.demographics.sex },
                { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
            );
            
            console.log('Selected Voice:');
            console.log(`  ID: ${voice.voiceId}`);
            console.log(`  Name: ${voice.name}`);
            console.log(`  Sex: ${voice.sex}`);
            console.log(`  Age Group: ${voice.ageGroup}`);
            console.log(`  Characteristics: ${voice.characteristics.join(', ')}`);
            
            // Get parameters
            const params = getAdjustedParameters(voice, profile.conditions[0] || 'neutral', profile.emotionalState);
            console.log('Parameters:');
            console.log(`  Exaggeration: ${params.exaggeration.toFixed(2)}`);
            console.log(`  Temperature: ${params.temperature.toFixed(2)}`);
            
        } catch (error: any) {
            console.error('Error:', error.message);
        }
        
        console.log('\n---');
    }
}

async function testActualSynthesis() {
    console.log('\n=== Testing Actual Synthesis ===\n');
    
    const testText = "Hello doctor, I've been having some pain.";
    
    for (const testCase of testCases.slice(0, 2)) { // Just test first 2
        console.log(`\nTesting: ${testCase.name}`);
        
        try {
            const result = await smartSynthesize(
                testText,
                testCase.data,
                { isNurse: false }
            );
            
            console.log('✓ Success!');
            console.log(`  Voice: ${result.voiceInfo.voiceId}`);
            console.log(`  Audio length: ${result.audioDataUrl.length} chars`);
            
        } catch (error: any) {
            console.error('✗ Failed:', error.message);
        }
    }
}

async function validateVoices() {
    console.log('\n=== Validating Voice IDs ===\n');
    
    const criticalVoices = [
        'af_bella', 'af_sarah', 'af_nova', 'af_jessica',
        'am_adam', 'am_eric', 'am_onyx', 'am_michael',
        'bf_emma', 'bf_lily', 'bm_daniel', 'bm_george',
        'ef_dora', 'em_alex', 'pm_alex'
    ];
    
    for (const voiceId of criticalVoices) {
        const isValid = isValidVoiceId(voiceId);
        console.log(`${voiceId}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
    }
}

async function runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('VOICE SYSTEM DEBUG');
    console.log('='.repeat(70));
    
    await validateVoices();
    await testVoiceSelection();
    // await testActualSynthesis(); // Commented out to avoid API calls during debug
    
    console.log('\n' + '='.repeat(70));
    console.log('DEBUG COMPLETE');
    console.log('='.repeat(70) + '\n');
}

runAllTests().catch(console.error);
