import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testMcp() {
    try {
        // 1. Get Cases
        console.log('Fetching cases...');
        const casesRes = await axios.get(`${API_URL}/cases`);
        const cases = casesRes.data;

        if (cases.length === 0) {
            console.error('No cases found. Run seed script first.');
            return;
        }

        const caseId = cases[0]._id || cases[0].id;
        console.log(`Using Case ID: ${caseId} (${cases[0].metadata?.title || cases[0].title})`);

        // 2. Interact with Engine
        const payload = {
            userId: 'test-user-mcp',
            caseId: caseId,
            message: 'I am the doctor. Do you have any pain?'
        };

        console.log('Sending message to MCP:', payload.message);
        const engineRes = await axios.post(`${API_URL}/engine/interact`, payload);

        console.log('--- MCP RESPONSE ---');
        console.log(JSON.stringify(engineRes.data, null, 2));

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testMcp();
