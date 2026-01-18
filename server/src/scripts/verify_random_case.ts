import { caseService } from '../services/caseService';
import { connectDB } from '../config/db';
import '../config/env'; // Load env

async function verifyRandomCase() {
    console.log("--- Verifying Random Case Retrieval ---");

    try {
        await connectDB();

        // 1. Fetch Random - No Filters
        console.log("1. Fetching truly random case...");
        const case1 = await caseService.getRandomCase({});
        console.log(`SUCCESS: Got case "${case1.title}" (ID: ${case1._id || case1.id})`);

        // 2. Fetch Random - With Specialty (if any exists)
        // We'll try 'Cardiology' or 'Respiratory' as common ones
        console.log("2. Fetching 'Respiratory' case...");
        try {
            const case2 = await caseService.getRandomCase({ specialty: 'Respiratory' });
            console.log(`SUCCESS: Got case "${case2.title}"`);
        } catch (e: any) {
            console.warn("WARN: Could not find Respiratory case (might be empty DB).");
        }

        console.log("--- Verification Complete ---");
        process.exit(0);

    } catch (e: any) {
        console.error("FAILURE:", e);
        process.exit(1);
    }
}

verifyRandomCase();
