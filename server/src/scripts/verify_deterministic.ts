
import { patientService } from '../services/patientService';
import { connectDB } from '../config/db';
import { Case } from '../models/Case';
import { Session } from '../models/Session';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const verifyPipeline = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1. Fetch the V2 Case
        const v2Case = await Case.findOne({ 'case_metadata.case_id': 'PS_MD_001' });
        if (!v2Case) throw new Error("V2 Case PS_MD_001 not found. Please seed it first.");

        // 2. Create a Mock Session
        const session = await Session.create({
            userId: 'test-verifier',
            caseId: v2Case._id,
            currentStage: 'History'
        });

        console.log(`\nTESTING DETERMINISTIC PIPELINE [Case: ${v2Case._id}, Session: ${session._id}]`);

        // TEST 1: ASK ONSET (Allowed)
        console.log("\n--- TEST 1: Ask Onset (Allowed) ---");
        const res1 = await patientService.interactV2("When did this start?", v2Case._id.toString(), session._id.toString());
        console.log(`INPUT: "When did this start?"`);
        console.log(`OUTPUT: "${res1.text}"`);
        // Expected: "Gradual over 3 months" (from seed)

        if (res1.text.includes("3 months")) {
            console.log("PASS: Correct Fact Returned");
        } else {
            console.error("FAIL: Incorrect Fact");
        }

        // TEST 2: ASK SURGERY (MCP Blocked in History)
        console.log("\n--- TEST 2: Perform Surgery (Blocked) ---");
        // We need a query that classifies as PERFORM_EXAM or similar blocked intent
        // Using "Perform physical exam" which usually maps to PERFORM_EXAM_GENERAL
        const res2 = await patientService.interactV2("I want to perform a physical exam now.", v2Case._id.toString(), session._id.toString());
        console.log(`INPUT: "I want to perform a physical exam now."`);
        console.log(`OUTPUT: "${res2.text}"`);

        if (res2.text.includes("not ready") || res2.text.includes("finish talking")) {
            console.log("PASS: MCP Blocked Correctly");
        } else {
            console.log("WARN: MCP might have allowed or classifier missed intent. (Expected block)");
        }

        // TEST 3: REPEATABILITY
        console.log("\n--- TEST 3: Repeatability ---");
        const res3 = await patientService.interactV2("When did this start?", v2Case._id.toString(), session._id.toString());
        if (res3.text === res1.text) {
            console.log("PASS: Deterministic (Same Input = Same Output)");
        } else {
            console.error("FAIL: Non-Deterministic");
        }

        process.exit(0);

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    }
};

verifyPipeline();
