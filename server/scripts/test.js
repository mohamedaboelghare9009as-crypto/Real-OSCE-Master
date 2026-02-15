const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://127.0.0.1:3001';
const SOCKET_URL = 'http://127.0.0.1:3001';

async function runTest() {
    console.log("=== STARTING CONVERSATION TEST (JS) ===");

    try {
        // 1. Get Random Case
        console.log("\n[1] Fetching Random Case...");
        const caseRes = await axios.post(`${API_URL}/api/generate-case`, {
            specialty: 'Random',
            excludedIds: [],
            mockMode: false
        });
        const caseData = caseRes.data;
        const title = caseData.case_metadata?.title || caseData.metadata?.title || "Unknown Case";
        // Fix: Extract ID from various possible locations in Mock/Real data
        const id = caseData._id || caseData.id || caseData.metadata?.id || caseData.case_metadata?.case_id;
        console.log(`> Random Case Selected: ${title} (ID: ${id})`);

        const sessionId = `TEST_SESSION_${Date.now()}`;
        const caseId = id;

        // 2. Connect
        console.log("\n[2] Connecting to WebSocket...");
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log("> Socket Connected!");

            // 3. Test Conversational
            console.log("\n[3] Testing CONVERSATIONAL Intent...");
            console.log("User: 'Hello, how are you doing today?'");
            socket.emit('message', {
                text: 'Hello, how are you doing today?',
                caseId,
                sessionId
            });
        });

        socket.on('ai-response-text', (data) => {
            console.log(`\n[AI RESPONSE] "${data.text}"`);
            console.log(`[META] Category: ${data.meta?.category}`);

            if (data.meta?.category === 'conversational') {
                console.log("✅ Conversation Flow Verified");
                // 4. Test Clinical
                console.log("\n[4] Testing CLINICAL Intent...");
                console.log("User: 'Do you have any pain?'");
                socket.emit('message', {
                    text: 'Do you have any pain?',
                    caseId,
                    sessionId
                });
            } else if (data.meta?.category === 'clinical') {
                console.log("✅ Clinical Flow Verified");

                // 5. Test Information Restriction
                console.log("\n[5] Testing INFORMATION RESTRICTION (Asking for Exam findings in History stage)...");
                console.log("User: 'What do your heart sounds sound like?'");
                socket.emit('message', {
                    text: 'What do your heart sounds sound like?',
                    caseId,
                    sessionId
                });
            } else if (data.text.toLowerCase().includes("don't know") || data.text.toLowerCase().includes("exam") || data.text.toLowerCase().includes("doctor")) {
                console.log("✅ Information Restriction Verified (AI did not reveal exam findings)");
                console.log("\n=== TEST COMPLETE ===");
                // Clean exit
                socket.disconnect();
                process.exit(0);
            } else {
                console.log("❌ Information Restriction Failed! AI revealed restricted info.");
                socket.disconnect();
                process.exit(1);
            }
        });

        socket.on('connect_error', (err) => {
            console.error("Connection Error:", err.message);
            process.exit(1);
        });

    } catch (e) {
        console.error("Test Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

runTest();
