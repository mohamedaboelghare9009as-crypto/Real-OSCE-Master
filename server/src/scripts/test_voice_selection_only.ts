
/**
 * Direct Voice Selection Test
 * Tests voice selection logic directly without API calls
 */

import { extractPatientProfile } from '../voice/patientProfileExtractor';
import { selectVoiceForPatient, getAdjustedParameters, isValidVoiceId, getVoiceById, DEEPINFRA_VOICES } from '../voice/deepinfraChatterboxConfig';

console.log('=== DIRECT VOICE SELECTION TEST ===\n');

// Test 1: Basic extraction
console.log('Test 1: Patient Profile Extraction');
const testCase1 = {
    truth: {
        demographics: {
            age: 72,
            sex: 'Male',
            name: 'Mr. Thompson'
        },
        chief_complaint: 'Chest pain',
        emotional_state: 'anxious'
    }
};

const profile1 = extractPatientProfile(testCase1);
console.log('Input:', JSON.stringify(testCase1.truth.demographics));
console.log('Extracted:', profile1.demographics);
console.log('Expected: 72yo male');
console.log('Match:', profile1.demographics.age === 72 && profile1.demographics.sex === 'male' ? '✓ PASS' : '✗ FAIL');
console.log();

// Test 2: Voice selection for 72yo male
console.log('Test 2: Voice Selection for 72yo Male');
const voice1 = selectVoiceForPatient(
    { age: 72, sex: 'male' },
    { condition: 'chest pain', emotionalState: 'anxious' }
);
console.log('Selected voice:', voice1.voiceId, `(${voice1.name})`);
console.log('Voice sex:', voice1.sex);
console.log('Is male voice:', voice1.sex === 'male' ? '✓ PASS' : '✗ FAIL');
console.log();

// Test 3: Voice selection for 28yo female
console.log('Test 3: Voice Selection for 28yo Female');
const voice2 = selectVoiceForPatient(
    { age: 28, sex: 'female' },
    { condition: 'anxiety', emotionalState: 'nervous' }
);
console.log('Selected voice:', voice2.voiceId, `(${voice2.name})`);
console.log('Voice sex:', voice2.sex);
console.log('Is female voice:', voice2.sex === 'female' ? '✓ PASS' : '✗ FAIL');
console.log();

// Test 4: Voice selection for 15yo male
console.log('Test 4: Voice Selection for 15yo Male');
const voice3 = selectVoiceForPatient(
    { age: 15, sex: 'male' },
    { condition: 'sprained ankle', emotionalState: 'neutral' }
);
console.log('Selected voice:', voice3.voiceId, `(${voice3.name})`);
console.log('Voice sex:', voice3.sex);
console.log('Voice age group:', voice3.ageGroup);
console.log();

// Test 5: Voice validation
console.log('Test 5: Voice ID Validation');
const testVoices = ['af_bella', 'am_adam', 'bf_alice', 'invalid_voice'];
testVoices.forEach(v => {
    const valid = isValidVoiceId(v);
    console.log(`${v}: ${valid ? '✓ Valid' : '✗ Invalid'}`);
});
console.log();

// Test 6: Check if all expected voices exist
console.log('Test 6: Critical Voices Exist');
const criticalVoices = [
    'af_bella', 'af_sarah', 'af_nova', 'af_jessica',
    'am_adam', 'am_eric', 'am_onyx', 'am_michael',
    'bf_emma', 'bf_lily', 'bm_daniel', 'bm_george',
    'ef_dora', 'em_alex'
];

let allExist = true;
criticalVoices.forEach(v => {
    const voice = getVoiceById(v);
    if (!voice) {
        console.log(`✗ Missing: ${v}`);
        allExist = false;
    }
});
console.log(allExist ? '✓ All critical voices exist' : '✗ Some voices missing');
console.log();

// Test 7: Parameter adjustment
console.log('Test 7: Parameter Adjustment');
const testVoice = getVoiceById('am_eric')!;
const params = getAdjustedParameters(testVoice, 'pain', 'anxious');
console.log('Base params:', { exaggeration: testVoice.exaggeration, temperature: testVoice.temperature });
console.log('Adjusted params:', params);
console.log('Pain reduces exaggeration:', params.exaggeration < testVoice.exaggeration ? '✓ PASS' : 'Note: No change');
console.log();

// Summary
console.log('=== TEST SUMMARY ===');
console.log('Profile extraction:', profile1.demographics.sex === 'male' ? '✓' : '✗');
console.log('Male voice selection:', voice1.sex === 'male' ? '✓' : '✗');
console.log('Female voice selection:', voice2.sex === 'female' ? '✓' : '✗');
console.log('Voice validation:', isValidVoiceId('af_bella') && !isValidVoiceId('invalid') ? '✓' : '✗');
console.log();
