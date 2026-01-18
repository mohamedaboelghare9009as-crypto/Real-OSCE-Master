
import { intentClassifier } from '../services/intentClassifier';

async function testSINL() {
    const queries = [
        "Hello there",
        "Hi",
        "When did the pain start?",
        "How long has it been going on?",
        "Do you have any allergies?",
        "Is there anything that makes it worse?",
        "I want to check your blood pressure",
        "Please look at the ceiling (General exam)", // imply exam
        "random gibberish 12345",
        "What medicines do you take?"
    ];

    console.log("=== Testing SINL (Semantic Intent Normalization Layer) ===");

    for (const query of queries) {
        try {
            const result = await intentClassifier.classify(query);
            console.log(`Input: "${query}"\nSaved Intent: ${result.intent}\nConfidence: ${result.confidence}\n----------------`);
        } catch (error) {
            console.error(`Error processing "${query}":`, error);
        }
    }
}

testSINL();
