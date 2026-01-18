
import { caseService } from '../services/caseService';
import { sessionService } from '../services/sessionService';
import { MOCK_CASE_ID } from '../data/mockCase';

async function verifyOfflineMock() {
    console.log("--- Starting Offline Mode Verification ---");

    try {
        // 1. Verify Mock Case Retrieval
        console.log("\n1. Testing CaseService (Mock Fallback)...");
        const mockCase = await caseService.getCaseById(MOCK_CASE_ID);
        if (mockCase && mockCase.metadata.id === MOCK_CASE_ID) {
            console.log("✅ CaseService returned Mock Case correctly.");
        } else {
            console.error("❌ CaseService failed to return Mock Case.", mockCase);
        }

        // 2. Verify Session Creation (Mock Fallback)
        console.log("\n2. Testing SessionService (Mock Session)...");
        const userId = 'verify-user-123';
        const session = await sessionService.createSession(userId, MOCK_CASE_ID);

        if (session && session.caseId === MOCK_CASE_ID) {
            console.log("✅ SessionService created Mock Session correctly.");
        } else {
            console.error("❌ SessionService failed to create Mock Session.", session);
        }

        // 3. Verify Session Retrieval
        console.log("\n3. Testing SessionService (Find Active)...");
        const activeSession = await sessionService.findActiveSession(userId, MOCK_CASE_ID);
        if (activeSession) {
            console.log("✅ SessionService found active Mock Session.");
        } else {
            console.error("❌ SessionService failed to find active Mock Session.");
        }

        // 4. Verify Random Case Fallback (simulate failure by just asking without DB)
        // Since we didn't mock DB failure explicitly in code (just catch blocks), 
        // valid DB connection might actually fetch real data if DB is up. 
        // But if DB is down (which user said), it should return mock.
        console.log("\n4. Testing Random Case Fallback (Mock Mode)...");
        const randomMock = await caseService.getRandomCase({ mockMode: true });
        if (randomMock && randomMock.metadata.id === MOCK_CASE_ID) {
            console.log("✅ CaseService returned Mock Case in mock mode.");
        } else {
            console.error("❌ Failed forced mock mode.");
        }

        console.log("\n--- Verification Complete ---");
        process.exit(0);

    } catch (e) {
        console.error("❌ Verification Script Error:", e);
        process.exit(1);
    }
}

verifyOfflineMock();
