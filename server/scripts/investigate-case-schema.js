require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function investigateCase() {
    try {
        console.log("🔍 Connecting to MongoDB...\n");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!\n");

        const Case = mongoose.model('Case', new mongoose.Schema({}, { strict: false }), 'cases');

        // Get one case to see full schema
        const sampleCase = await Case.findOne().lean();

        if (sampleCase) {
            console.log("📋 SAMPLE CASE STRUCTURE:\n");
            console.log("=".repeat(60));
            console.log(JSON.stringify(sampleCase, null, 2));
            console.log("=".repeat(60));

            console.log("\n📊 AVAILABLE FIELDS:");
            console.log(Object.keys(sampleCase));

            // Check for persona/evaluation fields
            console.log("\n🎭 PERSONA FIELDS:");
            if (sampleCase.truth) {
                console.log("  - emotional_state:", sampleCase.truth.emotional_state);
                console.log("  - patient_info:", sampleCase.truth.patient_info);
            }

            console.log("\n📝 EVALUATION FIELDS:");
            console.log("  - marking_scheme:", !!sampleCase.marking_scheme);
            console.log("  - ddx_map:", !!sampleCase.ddx_map);

            console.log("\n📍 SCENARIO FIELDS:");
            if (sampleCase.scenario) {
                console.log("  - candidate_instructions:", sampleCase.scenario.candidate_instructions);
                console.log("  - station_type:", sampleCase.scenario.station_type);
            }

        } else {
            console.log("⚠️ No cases found in database!");
        }

        // Count total cases
        const count = await Case.countDocuments();
        console.log(`\n📊 Total cases in database: ${count}`);

        await mongoose.disconnect();
        console.log("\n✅ Done!");

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

investigateCase();
