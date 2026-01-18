
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyChat() {
    try {
        const caseId = 'mock-case-001';
        const sessionId = `test-sess-${Date.now()}`;
        const payload = {
            engine: 'v2',
            caseId: caseId,
            sessionId: sessionId,
            message: 'Can you tell me more about the pain?'
        };

        console.log(`Sending message to /api/chat with MOCK CASE (Session: ${sessionId})...`);
        const chatRes = await axios.post(`${API_URL}/chat`, payload, {
            headers: {
                'x-case-id': caseId,
                'x-session-id': sessionId
            }
        });

        console.log('--- CHAT RESPONSE ---');
        console.log('Body:', JSON.stringify(chatRes.data, null, 2));

    } catch (error: any) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
}

verifyChat();
