
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { simulationEngine } from '../engine/SimulationEngine';
import { Session } from '../models/Session';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        const userId = "dev-user-" + Date.now();
        const caseId = "69680b570400b00bf299fd63"; // The ID from your seed
        let sessionId = "";

        console.log("\n--- Test 1: Greeting (Deterministic) ---");
        const res1 = await simulationEngine.process("Hello doctor", userId, caseId);
        console.log(`Response: ${res1.text}`);
        if (res1.finalIntent !== 'GREETING') throw new Error("Greeting failed");

        console.log("\n--- Test 2: Chief Complaint (First Ask) ---");
        const res2 = await simulationEngine.process("Why are you here?", userId, caseId);
        console.log(`Response: ${res2.text}`);
        if (res2.finalIntent !== 'ASK_CHIEF_COMPLAINT') throw new Error("Intent classification failed");

        console.log("\n--- Test 3: Chief Complaint (Repeat - Once Only Rule) ---");
        const res3 = await simulationEngine.process("Why are you here?", userId, caseId, res1.meta?.sessionId); // Assuming session persists
        console.log(`Response: ${res3.text}`);
        if (res3.text !== "I believe I already mentioned that.") throw new Error("Once Only rule failed");

        console.log("\n--- Test 4: Exam Request (Gate - Stage Enforcement) ---");
        const res4 = await simulationEngine.process("I want to listen to your heart", userId, caseId);
        console.log(`Response: ${res4.text}`);
        if (!res4.text.includes("not ready")) throw new Error("Stage gating failed");

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
