
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { ConversationalHandler } from '../services/conversationalHandler';
import { OsceCaseV2 } from '../schemas/caseSchema';

async function main() {
    console.log("=== Verifying Conversational Handler ===");
    console.log("Checking Vertex AI -> Gemini API Fallback");

    const handler = new ConversationalHandler();

    // Mock minimal case data
    const mockCase: Partial<OsceCaseV2> = {
        truth: {
            demographics: { age: 45, sex: 'female', occupation: 'Teacher' },
            history: {
                chief_complaint: "Severe chest pain radiating to left arm",
                onset: "1 hour ago",
                duration: "Ongoing",
                associated_symptoms: ["Sweating", "Nausea"],
                risk_factors: []
            },
            investigations: { bedside: {}, confirmatory: {} }
        } as any
    };

    const inputs = [
        "Hello, I am Dr. Smith.",
        "How are you feeling right now?",
        "Do you have any kids?"
    ];

    for (const input of inputs) {
        console.log(`\n[INPUT]: "${input}"`);
        const response = await handler.generateResponse(input, mockCase as OsceCaseV2);
        console.log(`[RESPONSE]: "${response}"`);

        if (response.includes("As I mentioned")) {
            console.error("❌ FAILED: Found robotic 'As I mentioned' phrase.");
        }
    }
}

main();
