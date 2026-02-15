import { io } from 'socket.io-client';
import axios from 'axios';
import { IntentCategory } from '../src/services/intentRouter';

const API_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

async function runTest() {
    console.log("=== STARTING CONVERSATION TEST ===");

    // 1. Get Random Case (Surprise Me Simulation)
    console.log("\n[1] Fetching Random Case...");
    try {
        const caseRes = await axios.post(`${API_URL}/api/generate-case`, {
            specialty: 'Random',
            excludedIds: [] // First run
        });
        const caseData = caseRes.data;
        console.log(`> Random Case Selected: ${caseData.case_metadata?.title || caseData.metadata?.title} (ID: ${caseData._id})`);

        // 2. Start Simulation Session (Conceptual)
        // In real app, frontend calls /api/sessions/start. Here we simulate connection.
        const sessionId = `TEST_SESSION_${Date.now()}`;
        const caseId = caseData._id;

        // 3. Connect Socket
        console.log("\n[2] Connecting to WebSocket...");
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log("> Socket Connected!");
            runInteraction(socket, caseId, sessionId);
        });

        socket.on('ai-response-text', (data: any) => {
            console.log(`\n[AI RESPONSE] "${data.text}"`);
            console.log(`[META] Category: ${data.meta?.category}`);

            // Check Flow
            if (data.meta?.category === 'conversational') {
                console.log("✅ Conversation Flow Verified (Social)");
            } else if (data.meta?.category === 'clinical') {
                console.log("✅ Clinical Flow Verified (Medical)");
            } else {
                console.log("⚠️ Unknown Category");
            }
        });

    } catch (e: any) {
        console.error("Test Failed:", e.message);
    }
}

async function runInteraction(socket: any, caseId: string, sessionId: string) {
    // 4. Test Conversational Intent
    console.log("\n[3] Testing CONVERSATIONAL Intent...");
    console.log("User: 'Hello, how are you doing today?'");
    socket.emit('message', {
        text: 'Hello, how are you doing today?',
        caseId,
        sessionId
    });

    // Wait a bit
    await new Promise(r => setTimeout(r, 4000));

    // 5. Test Clinical Intent
    console.log("\n[4] Testing CLINICAL Intent (Medical Grounding)...");
    console.log("User: 'Where exactly is the pain located?'");
    socket.emit('message', {
        text: 'Where exactly is the pain located?',
        caseId,
        sessionId
    });

    // Wait a bit
    await new Promise(r => setTimeout(r, 4000));

    console.log("\n=== TEST COMPLETE ===");
    process.exit(0);
}

runTest();
