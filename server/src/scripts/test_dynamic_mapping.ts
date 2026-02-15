
import { mapCaseToVoiceParams } from '../voice/deepinfraChatterboxConfig';
import { PatientProfile } from '../voice/deepinfraChatterboxConfig';

console.log("=== Testing Dynamic Voice Mapping ===\n");

const scenarios: { name: string, profile: PatientProfile, condition: string, emotion: string }[] = [
    {
        name: "70yo Male with Chest Pain (Should be Tarkos, High Pain params)",
        profile: { age: 70, sex: 'male', language: 'english' },
        condition: 'Severe Chest Pain',
        emotion: 'distressed'
    },
    {
        name: "25yo Male with Anxiety (Should be Steve, High Anxiety params)",
        profile: { age: 25, sex: 'male', language: 'english' },
        condition: 'Generalized Anxiety',
        emotion: 'nervous'
    },
    {
        name: "30yo Female with Asthma (Should be Britney, Urgent params)",
        profile: { age: 30, sex: 'female', language: 'english' },
        condition: 'Asthma Attack (breath)',
        emotion: 'fearful'
    },
    {
        name: "45yo Male Neutral (Should be Steve/Tarkos, Standard params)",
        profile: { age: 45, sex: 'male', language: 'english' },
        condition: 'Back Pain',
        emotion: 'neutral'
    }
];

scenarios.forEach(scenario => {
    console.log(`--- Scenario: ${scenario.name} ---`);
    const result = mapCaseToVoiceParams(scenario.profile, scenario.condition, scenario.emotion);
    console.log(`Voice: ${result.voiceName} (${result.voiceId})`);
    console.log(`Params: Exaggeration=${result.exaggeration.toFixed(2)}, Temp=${result.temperature.toFixed(2)}, CFG=${result.cfg}`);
    console.log('');
});
