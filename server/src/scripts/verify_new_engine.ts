import './config/env';
import { patientEngine } from './engine/PatientEngine';
import { MOCK_CASE_V2 } from './data/mockCase';
import { OsceCaseV2 } from './schemas/caseSchema';

async function test() {
    console.log("Starting verification test...");
    const caseData = MOCK_CASE_V2 as unknown as OsceCaseV2;
    console.log(`Case Loaded: ${caseData.case_metadata.title}`);

    const queries = [
        "Hello, how are you feeling today?",
        "Can you tell me more about the pain?",
        "How old are you?",
        "I'm sorry to hear that. I'm here to help.",
        "What do you think is causing this?"
    ];

    let history: any[] = [];

    for (const query of queries) {
        console.log(`\nSTUDENT: ${query}`);
        const response = await patientEngine.generateResponse(query, history, caseData);
        console.log(`PATIENT: ${response}`);
        history.push({ role: 'user', content: query });
        history.push({ role: 'model', content: response });
    }

    process.exit(0);
}

test();
