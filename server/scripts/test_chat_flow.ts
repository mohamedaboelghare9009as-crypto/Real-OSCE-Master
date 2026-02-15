
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const SESSION_ID = '696fdf158cfd60da595f7f2b'; // A dummy but valid 24-hex ObjectId
const CASE_ID = 'mock-case-001';

async function sendChat(message: string, label: string) {
    console.log(`\n\n--- [TEST] ${label} ---`);
    console.log(`Input: "${message}"`);
    try {
        const res = await axios.post(`${API_URL}/chat`, {
            message,
            history: []
        }, {
            headers: {
                'x-session-id': SESSION_ID,
                'x-case-id': CASE_ID
            }
        });

        const data = res.data;
        console.log(`Response Code: ${res.status}`);
        console.log(`Response Text: "${data.text}"`);
        console.log(`Meta:`, data.meta || 'No Meta');
        console.log(`Final Intent: ${data.finalIntent}`);
    } catch (err: any) {
        if (err.response) {
            console.error(`ERROR: Status ${err.response.status}`);
            console.error(`Data:`, JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(`ERROR:`, err.message);
        }
    }
}

async function runTests() {
    console.log(`Starting Chat Flow Tests... Session: ${SESSION_ID}`);

    // 1. Greeting (Conversational)
    await sendChat("Good morning, how are you?", "GREETING");

    // 2. Specific Clinical (Fact Retrieval)
    await sendChat("When did the pain start?", "ONSET (Specific)");

    // 3. Vague Clinical (Fact Retrieval or Summary)
    await sendChat("Tell me about the chest pain.", "HPI (General)");

    // 4. Unknown / Gibberish
    await sendChat("sdfsdf asdf foo bar", "GIBBERISH");

    // 5. Clinical but maybe missing in case
    await sendChat("Do you have any allergies?", "ALLERGIES");

    // 6. Mixed (Should be Clinical)
    await sendChat("Hi there, do you smoke cigarettes?", "MIXED (Smoking)");
}

runTests();
