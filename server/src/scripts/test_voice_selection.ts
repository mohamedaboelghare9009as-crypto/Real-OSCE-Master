
import { selectVoiceForPatient, PatientProfile } from '../voice/deepinfraChatterboxConfig';

function test(age: number, sex: any, label: string) {
    console.log(`\n--- Testing: ${label} (${age}yo ${sex}) ---`);
    const profile: PatientProfile = { age, sex };
    const voice = selectVoiceForPatient(profile);
    console.log(`RESULT: ${voice.name} (${voice.voiceId}) - ${voice.sex}`);

    // Safety check
    const expectedSex = String(sex).toLowerCase();
    if (voice.sex !== expectedSex) {
        console.error(`ERROR: Expected ${expectedSex} voice, but got ${voice.sex}`);
    } else {
        console.log(`SUCCESS: Matched ${expectedSex} sex.`);
    }
}

async function run() {
    console.log("=== Testing Voice Selection Logic ===");

    // Test case-sensitivity ("Male" vs "male")
    test(45, 'Male', "Capitalized Male");
    test(45, 'male', "Lowercase male");

    // Test Female
    test(30, 'Female', "Capitalized Female");
    test(30, 'female', "Lowercase female");

    // Test different age groups
    test(10, 'male', "Child Male");
    test(75, 'female', "Elderly Female");

    // Test fallback
    test(30, 'unknown', "Unknown sex (Fallback)");
}

run();
