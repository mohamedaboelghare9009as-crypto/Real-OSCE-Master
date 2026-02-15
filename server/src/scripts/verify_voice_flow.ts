
import { MOCK_CASE, MOCK_CASE_V2 } from '../data/mockCase';
import { extractPatientProfile } from '../voice/patientProfileExtractor';

// Simulate the ensureV2Format logic from caseService.ts
function simulateEnsureV2Format(data: any): any {
    if (data.truth) return data;

    // V1 to V2 mapping simulation (from caseService.ts)
    return {
        truth: {
            demographics: {
                age: data.history?.age || 45,
                sex: data.history?.sex || "Female", // <--- THE SUSPECTED ISSUE
            },
            history: {
                chief_complaint: data.history?.chiefComplaint || ""
            },
            emotional_state: "Normal"
        }
    };
}

console.log("=== Verifying Voice Flow for V1/V2 Cases ===\n");

// Test 1: V2 Case (Should work, has 'Male')
console.log("--- Test 1: V2 MOCK_CASE (Native V2) ---");
const v2Profile = extractPatientProfile(MOCK_CASE_V2);
console.log(`Input Sex: ${MOCK_CASE_V2.truth.demographics.sex}`);
console.log(`Extracted Sex: ${v2Profile.demographics.sex}`);
console.log(`Result: ${v2Profile.demographics.sex === 'male' ? 'PASS' : 'FAIL'}\n`);

// Test 2: V1 Case (Suspected to FAIL due to missing sex field)
console.log("--- Test 2: V1 MOCK_CASE (Converted) ---");
const convertedV1 = simulateEnsureV2Format(MOCK_CASE);
console.log(`V1 Description: "${MOCK_CASE.history.description}"`); // "Patient is a 55-year-old male..."
console.log(`Converted Sex: ${convertedV1.truth.demographics.sex}`);
const v1Profile = extractPatientProfile(convertedV1);
console.log(`Extracted Sex: ${v1Profile.demographics.sex}`);
console.log(`Result: ${v1Profile.demographics.sex === 'male' ? 'PASS' : 'FAIL'}\n`);
