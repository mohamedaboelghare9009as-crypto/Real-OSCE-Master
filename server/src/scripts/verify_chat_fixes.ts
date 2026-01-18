// @ts-nocheck
import '../config/env';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { simulationEngine } from '../engine/SimulationEngine';
import { Case } from '../models/Case';

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        const cases = await Case.find({});
        if (cases.length === 0) {
            console.error("No cases found in DB!");
            process.exit(1);
        }

        const testCase = cases.find(c => c.metadata?.title?.includes("Persistent Low Mood")) || cases[0];
        const caseId = testCase._id.toString();
        const userId = 'test-user';
        const sessionId = 'test-session-' + Date.now();

        console.log(`\n=== TESTING CHAT FIXES (VERTEX AI 2.0 FLASH) ===`);
        console.log(`Case: ${testCase.metadata?.title} (ID: ${caseId})`);

        const tests = [
            { query: "How are you?", expected: "CONVERSATIONAL" },
            { query: "Good morning.", expected: "CONVERSATIONAL" },
            { query: "Hello doctor", expected: "CONVERSATIONAL" },
            { query: "What brings you here today?", expected: "CLINICAL" },
            { query: "Can you describe the pain?", expected: "CLINICAL" },
            { query: "How are you feeling today?", expected: "CLINICAL (Specific symptoms)" },
            { query: "I want to do a physical exam", expected: "CLINICAL (Blocked by MCP)" }
        ];

        for (const t of tests) {
            console.log(`\n[TEST] Query: "${t.query}"`);
            const response = await simulationEngine.process(t.query, userId, caseId, sessionId);
            console.log(`[RESULT] Text: "${response.text}"`);
            console.log(`[RESULT] Intent: ${response.finalIntent}`);
            console.log(`[RESULT] Category: ${response.meta?.category}`);
            if (response.meta?.blocked) console.log(`[RESULT] Blocked: YES`);
        }

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
