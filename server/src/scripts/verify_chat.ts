import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyChat() {
    try {
        console.log('Checking Server Health...');
        try {
            await axios.get(`${API_URL}/health`);
            console.log('Server is UP.');
        } catch (e) {
            console.error('Server is DOWN. Please start the server.');
            return;
        }

        // 1. Get Cases (or generate one)
        console.log('Fetching cases...');
        let caseId;
        try {
            const casesRes = await axios.get(`${API_URL}/cases`);
            if (casesRes.data.length > 0) {
                caseId = casesRes.data[0]._id || casesRes.data[0].id;
                console.log(`Using existing Case ID: ${caseId}`);
            }
        } catch (e) {
            console.log('Could not fetch cases, trying generation...');
        }

        if (!caseId) {
            console.log('Generating a temporary case...');
            const genRes = await axios.post(`${API_URL}/generate-case`, { specialty: 'Cardiology' });
            caseId = genRes.data.id || genRes.data._id;
            console.log(`Generated Case ID: ${caseId}`);
        }

        if (!caseId) {
            console.error('Failed to get a Case ID.');
            return;
        }

        // 2. Chat with Patient (V2)
        const sessionId = `test-sess-${Date.now()}`;
        const payload = {
            engine: 'v2',
            caseId: caseId,
            sessionId: sessionId,
            message: 'Hello, I am Dr. Smith. What brings you in today?'
        };

        console.log(`Sending message to /api/chat (Session: ${sessionId})...`);
        const chatRes = await axios.post(`${API_URL}/chat`, payload);

        console.log('--- CHAT RESPONSE ---');
        // Check headers for transcript if V2 streams audio
        const transcript = chatRes.headers['x-transcript'];
        if (transcript) {
            console.log('Transcript (Header):', decodeURIComponent(transcript));
        }

        // Check body
        if (chatRes.data) {
            console.log('Body:', typeof chatRes.data === 'object' ? JSON.stringify(chatRes.data, null, 2) : chatRes.data);
        }

        if (chatRes.headers['content-type']?.includes('audio')) {
            console.log('Response is Audio Blob (Success for V2)');
        }

    } catch (error: any) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
}

verifyChat();
