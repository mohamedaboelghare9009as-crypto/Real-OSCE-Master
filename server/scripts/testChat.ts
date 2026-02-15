
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function run() {
    try {
        console.log("1. Generating Case...");
        const caseRes = await axios.post(`${BASE_URL}/generate-case`, {});
        const caseId = caseRes.data.case._id || caseRes.data.case.id; // Corrected ID access
        console.log(`Generated Case ID: ${caseId}`);
        console.log(`Title: ${caseRes.data.case.title}`);

        const sessionId = `test-session-${Date.now()}`;
        const headers = {
            'x-session-id': sessionId,
            'x-case-id': caseId,
            'Content-Type': 'application/json'
        };

        const send = async (msg: string) => {
            console.log(`\nUser: "${msg}"`);
            try {
                const res = await axios.post(`${BASE_URL}/chat`, { message: msg }, { headers });
                console.log(`AI: "${res.data.text}"`);
                console.log(`Intent: ${res.data.finalIntent}`);
                console.log(`Meta:`, res.data.meta);
            } catch (e: any) {
                console.error("Chat Error:", e.response?.data || e.message);
            }
        };

        await send("Hello there");
        await send("How are you today?");
        await send("What brings you in?");
        await send("Can you count to ten?");
        await send("Do you have any pain?");
        await send("Where is the pain?"); // Character/Radiation
        await send("Are you married?"); // Social History
        await send("Do you have any hobbies?"); // Social History

    } catch (e: any) {
        console.error("Test Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

run();
