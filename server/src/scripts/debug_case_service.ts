
import { caseService } from '../services/caseService';
import { MOCK_CASE_ID } from '../data/mockCase';

async function run() {
    console.log("=== DEBUG CASE SERVICE ===");
    console.log(`MOCK_CASE_ID constant: "${MOCK_CASE_ID}"`);

    const testId = 'mock-case-001';
    console.log(`Testing ID: "${testId}"`);
    console.log(`Match? ${testId === MOCK_CASE_ID}`);

    const result = await caseService.getCaseById(testId);
    if (result) {
        console.log("SUCCESS: Case found!");
        console.log("Title:", (result as any).case_metadata?.title || (result as any).metadata?.title);
    } else {
        console.error("FAILURE: Case not found.");
    }
}

run();
