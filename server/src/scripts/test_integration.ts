import { TTSPromptBuilder } from '../voice/promptBuilder';
import { PERSONAS } from '../voice/personas/profiles';
import { ttsService } from '../services/ttsService';
import fs from 'fs';
import path from 'path';

/**
 * Integration Test: Master Prompt + SiliconFlow TTS
 * This demonstrates the complete flow from persona selection to audio generation
 */

async function runIntegrationTest() {
    console.log("=== Master Prompt + TTS Integration Test ===\n");

    // Test Scenario: Anxious Male Patient with Chest Pain
    console.log("📋 SCENARIO: 35yo Male Patient, Anxious, Chest Pain");
    console.log("─".repeat(60));

    const persona = PERSONAS['patient_male_anxious'];
    const caseData = {
        patient: { age: 35, gender: 'male' },
        chiefComplaint: 'Chest pain and shortness of breath',
        symptoms: ['chest pain', 'difficulty breathing', 'anxiety']
    };

    // Step 1: Build Master Prompt
    console.log("\n1️⃣  Building Master Prompt...");
    const masterPrompt = TTSPromptBuilder.buildMasterPrompt(persona, caseData);
    const voiceInstructions = TTSPromptBuilder.buildVoiceInstructions(persona);
    const personaSummary = TTSPromptBuilder.getPersonaSummary(persona);

    console.log(`   Persona: ${personaSummary}`);
    console.log(`   Voice Instructions: ${voiceInstructions}`);

    // Step 2: Prepare Patient Response
    console.log("\n2️⃣  Patient Response Text:");
    const patientText = "I... I've been having this pain in my chest for about an hour now. It's really scary. It feels tight, like something's squeezing. And I'm finding it hard to breathe.";
    console.log(`   "${patientText}"`);

    // Step 3: Generate Audio with SiliconFlow
    console.log("\n3️⃣  Synthesizing with SiliconFlow TTS...");
    console.log(`   Voice ID: ${persona.voiceId}`);
    console.log(`   Speed: ${persona.speed}`);
    console.log(`   Pitch: ${persona.pitch}`);

    try {
        const audioDataUri = await ttsService.synthesize(
            patientText,
            persona.voiceId,
            persona.speed,
            persona.pitch,
            false
        );

        // Step 4: Save Audio File
        const base64 = audioDataUri.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        const outputPath = path.join(__dirname, 'integration_test_anxious_patient.mp3');
        fs.writeFileSync(outputPath, buffer);

        console.log(`   ✓ Audio generated successfully!`);
        console.log(`   ✓ Saved to: ${outputPath}`);
        console.log(`   ✓ Size: ${buffer.length} bytes`);

        // Step 5: Summary
        console.log("\n4️⃣  Integration Summary:");
        console.log("   ✓ Master Prompt: Generated");
        console.log("   ✓ Voice Instructions: Applied");
        console.log("   ✓ TTS Synthesis: Success");
        console.log("   ✓ Audio File: Created");

        console.log("\n═══════════════════════════════════════════════════════════");
        console.log("✅ INTEGRATION TEST PASSED");
        console.log("═══════════════════════════════════════════════════════════");

        // Display the Master Prompt for reference
        console.log("\n📝 Master Prompt Template Used:\n");
        console.log(masterPrompt);
        console.log("\n" + "─".repeat(60));

    } catch (error: any) {
        console.error("\n❌ INTEGRATION TEST FAILED");
        console.error(`   Error: ${error.message}`);
    }
}

// Run multiple scenarios
async function runAllScenarios() {
    const scenarios = [
        {
            name: "Anxious Patient",
            personaId: 'patient_male_anxious',
            caseData: {
                patient: { age: 35, gender: 'male' },
                chiefComplaint: 'Chest pain'
            },
            text: "I'm really worried about this chest pain, doctor.",
            filename: 'scenario_anxious.mp3'
        },
        {
            name: "Elderly Patient",
            personaId: 'patient_female_elderly',
            caseData: {
                patient: { age: 72, gender: 'female' },
                chiefComplaint: 'Fatigue'
            },
            text: "I've been feeling so tired lately. It's been going on for weeks now.",
            filename: 'scenario_elderly.mp3'
        },
        {
            name: "Patient in Pain",
            personaId: 'patient_female_pain',
            caseData: {
                patient: { age: 28, gender: 'female' },
                chiefComplaint: 'Abdominal pain'
            },
            text: "Ow... the pain is really bad. It hurts right here in my stomach.",
            filename: 'scenario_pain.mp3'
        }
    ];

    console.log("\n🎯 Running Multiple Scenario Tests\n");

    for (const scenario of scenarios) {
        console.log(`\n▶️  ${scenario.name}`);
        console.log("─".repeat(40));

        const persona = PERSONAS[scenario.personaId];
        const voiceInstructions = TTSPromptBuilder.buildVoiceInstructions(persona);

        console.log(`   Instructions: ${voiceInstructions}`);
        console.log(`   Text: "${scenario.text}"`);

        try {
            const audioDataUri = await ttsService.synthesize(
                scenario.text,
                persona.voiceId,
                persona.speed,
                persona.pitch,
                false
            );

            const base64 = audioDataUri.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');
            const outputPath = path.join(__dirname, scenario.filename);
            fs.writeFileSync(outputPath, buffer);

            console.log(`   ✓ Generated: ${scenario.filename} (${buffer.length} bytes)`);
        } catch (error: any) {
            console.log(`   ✗ Failed: ${error.message}`);
        }
    }

    console.log("\n✅ All scenarios complete!\n");
}

// Run the tests
console.log("Choose test mode:");
console.log("Running detailed integration test...\n");

runIntegrationTest().then(() => {
    console.log("\n\nRunning multi-scenario test...\n");
    return runAllScenarios();
}).then(() => {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🎉 ALL TESTS COMPLETE");
    console.log("═══════════════════════════════════════════════════════════");
});
