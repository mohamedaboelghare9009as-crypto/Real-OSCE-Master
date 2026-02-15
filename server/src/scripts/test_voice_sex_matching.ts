
import { dynamicVoiceEngine, VoiceTag } from '../voice';
import { ttsService } from '../services/ttsService';

async function testVoiceSexMatching() {
    console.log('=' .repeat(70));
    console.log('VOICE SEX MATCHING VERIFICATION TEST');
    console.log('=' .repeat(70));

    const testCases = [
        {
            name: "Adult Male (35) - Neutral",
            demographics: { age: 35, sex: 'male', name: 'John' },
            conditions: [],
            emotionalState: 'neutral',
            expectedSex: 'male'
        },
        {
            name: "Adult Female (28) - Neutral",
            demographics: { age: 28, sex: 'female', name: 'Sarah' },
            conditions: [],
            emotionalState: 'neutral',
            expectedSex: 'female'
        },
        {
            name: "Elderly Male (72) - Chest Pain",
            demographics: { age: 72, sex: 'male', name: 'Mr. Thompson' },
            conditions: ['chest pain'],
            emotionalState: 'anxious',
            expectedSex: 'male'
        },
        {
            name: "Elderly Female (78) - Pain",
            demographics: { age: 78, sex: 'female', name: 'Mrs. Davis' },
            conditions: ['back pain'],
            emotionalState: 'tired',
            expectedSex: 'female'
        },
        {
            name: "Pediatric Male (10) - Asthma",
            demographics: { age: 10, sex: 'male', name: 'Tommy' },
            conditions: ['asthma', 'wheezing'],
            emotionalState: 'upset',
            expectedSex: 'male'
        },
        {
            name: "Pediatric Female (8) - Cold",
            demographics: { age: 8, sex: 'female', name: 'Emma' },
            conditions: ['cold', 'cough'],
            emotionalState: 'tired',
            expectedSex: 'female'
        },
        {
            name: "Young Adult Male (25) - Anxious",
            demographics: { age: 25, sex: 'male', name: 'David' },
            conditions: ['anxiety', 'palpitations'],
            emotionalState: 'anxious',
            expectedSex: 'male'
        },
        {
            name: "Young Adult Female (24) - Anxious",
            demographics: { age: 24, sex: 'female', name: 'Emily' },
            conditions: ['anxiety'],
            emotionalState: 'worried',
            expectedSex: 'female'
        }
    ];

    const maleVoices = ['alex', 'andy', 'benjamin', 'charles', 'david'];
    const femaleVoices = ['anna', 'bella', 'claire'];

    let passedTests = 0;
    let failedTests = 0;

    for (const testCase of testCases) {
        console.log('\n' + '-'.repeat(70));
        console.log(`Test: ${testCase.name}`);
        console.log('-'.repeat(70));

        const config = dynamicVoiceEngine.getVoiceConfiguration({
            demographics: {
                age: testCase.demographics.age,
                sex: testCase.demographics.sex as 'male' | 'female',
                name: testCase.demographics.name
            },
            conditions: testCase.conditions,
            emotionalState: testCase.emotionalState
        });

        const voiceId = config.voiceId.toLowerCase();
        const isMaleVoice = maleVoices.includes(voiceId);
        const isFemaleVoice = femaleVoices.includes(voiceId);

        console.log(`  Patient: ${testCase.demographics.name} (${testCase.demographics.age}yo ${testCase.demographics.sex})`);
        console.log(`  Selected Voice: ${config.voiceId}`);
        console.log(`  Style: ${config.mood}`);
        console.log(`  Expected Sex: ${testCase.expectedSex}`);
        console.log(`  Detected Voice Type: ${isMaleVoice ? 'Male' : isFemaleVoice ? 'Female' : 'Unknown'}`);

        const matches = 
            (testCase.expectedSex === 'male' && isMaleVoice) ||
            (testCase.expectedSex === 'female' && isFemaleVoice);

        if (matches) {
            console.log('  ✓ PASS: Voice matches patient sex');
            passedTests++;
        } else {
            console.log('  ✗ FAIL: Voice does NOT match patient sex');
            failedTests++;
        }
    }

    console.log('\n' + '=' .repeat(70));
    console.log('TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`Passed: ${passedTests} ✓`);
    console.log(`Failed: ${failedTests} ✗`);
    console.log(`Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log('\n✓ All voice sex matching tests passed!');
    } else {
        console.log('\n⚠ Some voice sex matching tests failed. Review the configuration.');
    }
}

testVoiceSexMatching().catch(console.error);
