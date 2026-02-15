
/**
 * Quick TTS Diagnostic Test
 * Tests if DeepInfra TTS is working correctly
 */

import { ttsService } from './services/ttsService';
import { smartSynthesize, quickSynthesize } from './voice/smartTTSDispatcher';

async function testBasicTTS() {
    console.log('\n=== Basic TTS Test ===\n');
    
    try {
        console.log('Testing basic synthesis with af_bella...');
        const result = await ttsService.synthesize(
            "Hello doctor, I have chest pain.",
            'af_bella',
            0.5,
            0.8,
            'mp3'
        );
        console.log('✓ Basic TTS successful!');
        console.log(`  Audio length: ${result.length} characters`);
        console.log(`  Preview: ${result.substring(0, 100)}...`);
        return true;
    } catch (error: any) {
        console.error('✗ Basic TTS failed:', error.message);
        return false;
    }
}

async function testPatientTTS() {
    console.log('\n=== Patient TTS Test ===\n');
    
    const mockCaseData = {
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
    
    try {
        console.log('Testing patient-aware synthesis...');
        console.log('Patient: 72yo Male with chest pain, anxious');
        
        const result = await smartSynthesize(
            "I can't breathe! It hurts so much!",
            mockCaseData,
            { isNurse: false }
        );
        
        console.log('✓ Patient TTS successful!');
        console.log(`  Voice: ${result.voiceInfo.voiceId} (${result.voiceInfo.voiceName})`);
        console.log(`  Tags: ${result.voiceInfo.tags.join(', ') || 'None'}`);
        console.log(`  Audio length: ${result.audioDataUrl.length} characters`);
        return true;
    } catch (error: any) {
        console.error('✗ Patient TTS failed:', error.message);
        console.error('  Stack:', error.stack);
        return false;
    }
}

async function testNurseTTS() {
    console.log('\n=== Nurse TTS Test ===\n');
    
    const mockCaseData = {
        truth: {
            demographics: {
                age: 35,
                sex: 'Female'
            },
            chief_complaint: 'General'
        }
    };
    
    try {
        console.log('Testing nurse synthesis...');
        
        const result = await smartSynthesize(
            "I'll get the doctor for you right away.",
            mockCaseData,
            { isNurse: true }
        );
        
        console.log('✓ Nurse TTS successful!');
        console.log(`  Voice: ${result.voiceInfo.voiceId} (${result.voiceInfo.voiceName})`);
        console.log(`  Tags: ${result.voiceInfo.tags.join(', ') || 'None (correct for nurse)'}`);
        console.log(`  Audio length: ${result.audioDataUrl.length} characters`);
        return true;
    } catch (error: any) {
        console.error('✗ Nurse TTS failed:', error.message);
        return false;
    }
}

async function runDiagnostics() {
    console.log('\n' + '='.repeat(70));
    console.log('TTS DIAGNOSTIC TESTS');
    console.log('='.repeat(70));
    
    const results = {
        basic: await testBasicTTS(),
        patient: await testPatientTTS(),
        nurse: await testNurseTTS()
    };
    
    console.log('\n' + '='.repeat(70));
    console.log('RESULTS:');
    console.log(`  Basic TTS: ${results.basic ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Patient TTS: ${results.patient ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Nurse TTS: ${results.nurse ? '✓ PASS' : '✗ FAIL'}`);
    console.log('='.repeat(70) + '\n');
    
    if (!results.basic || !results.patient || !results.nurse) {
        console.error('Some tests failed. Check the errors above.');
        process.exit(1);
    } else {
        console.log('All tests passed! TTS is working correctly.');
        console.log('\nIf patients are not hearing voices in the simulation,');
        console.log('the issue is likely in the socket connection or frontend.');
    }
}

runDiagnostics().catch(console.error);
