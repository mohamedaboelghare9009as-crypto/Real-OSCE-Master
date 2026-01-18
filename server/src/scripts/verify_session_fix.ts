
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testSessionFlow() {
    try {
        console.log('1. Creating Session for Mock Case...');
        const sessionRes = await axios.post(`${BASE_URL}/sessions`, {
            userId: 'test-verifier',
            caseId: 'mock-case-001'
        });

        const session = sessionRes.data;
        console.log('Session Created:', session);

        if (!session.id && !session._id) {
            throw new Error('Session ID missing in response');
        }

        const sessionId = session.id || session._id;
        console.log(`Using Session ID: ${sessionId}`);

        console.log('2. Sending Chat Message...');
        const chatRes = await axios.post(`${BASE_URL}/chat`, {
            engine: 'v2',
            message: 'Hello doctor, I have chest pain.',
            caseId: 'mock-case-001',
            sessionId: sessionId,
            userId: 'test-verifier'
        });

        console.log('Chat Response:', chatRes.data);

        if (chatRes.data.text) {
            console.log('SUCCESS: Voice/Text response received:', chatRes.data.text);
        } else {
            console.warn('WARNING: No text response received');
        }

    } catch (error: any) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
    }
}

testSessionFlow();
