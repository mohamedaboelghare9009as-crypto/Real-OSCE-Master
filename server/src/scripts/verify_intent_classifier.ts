
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { intentClassifier } from '../services/intentClassifier';
import { IntentCode } from '../types/intents';

async function main() {
    console.log("=== Verifying Intent Classifier (New Schema) ===");

    const testCases = [
        { query: "How old are you?", expected: IntentCode.SOFT_CLINICAL_INTENT },
        { query: "Where do you live?", expected: IntentCode.SOFT_CLINICAL_INTENT },
        { query: "Does the pain radiate anywhere?", expected: IntentCode.CLINICAL_INTENT },
        { query: "I'd like to listen to your heart.", expected: IntentCode.CLINICAL_INTENT },
        { query: "Hello, nice to meet you.", expected: IntentCode.CONVERSATIONAL_INTENT },
        { query: "Thank you.", expected: IntentCode.CONVERSATIONAL_INTENT },
        { query: "The weather is nice.", expected: IntentCode.CONVERSATIONAL_INTENT }, // Ambiguous, but likely conversational or unclear
        { query: "Blah blah random noise", expected: IntentCode.UNCLEAR_INTENT }
    ];

    for (const test of testCases) {
        console.log(`\nTesting: "${test.query}"`);
        const result = await intentClassifier.classify(test.query);
        console.log(`Result: ${result.intent}`);

        if (result.intent === test.expected) {
            console.log("✅ PASS");
        } else {
            console.warn(`❌ FAIL (Expected ${test.expected})`);
        }
    }
}

main();
