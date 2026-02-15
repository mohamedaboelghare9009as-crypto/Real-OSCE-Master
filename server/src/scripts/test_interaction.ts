import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { caseService } from '../services/caseService';
import { patientService } from '../services/patientService';
import { Case } from '../models/Case';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        // 1. Find a case (The PE Case we likely seeded or any random one)
        const cases = await Case.find({});
        if (cases.length === 0) {
            console.error("No cases found in DB! Please run seedPECase.ts first.");
            process.exit(1);
        }

        const testCase = cases[0];
        console.log(`Testing with Case: ${testCase.metadata?.title} (ID: ${testCase._id})`);

        // 2. Test Interaction
        console.log("\n--- Test 1: Greeting ---");
        const res1 = await patientService.interactV2("Hello", testCase._id.toString(), "test-session-dev");
        console.log(`User: Hello`);
        console.log(`Patient: ${res1.text}`);

        console.log("\n--- Test 2: Chief Complaint ---");
        const res2 = await patientService.interactV2("What brings you here today?", testCase._id.toString(), "test-session-dev");
        console.log(`User: What brings you here today?`);
        console.log(`Patient: ${res2.text}`);

        console.log("\n--- Test 3: Specific Question (Pain Character) ---");
        const res3 = await patientService.interactV2("Can you describe the pain?", testCase._id.toString(), "test-session-dev");
        console.log(`User: Can you describe the pain?`);
        console.log(`Patient: ${res3.text}`);

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
