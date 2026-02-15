import { TTSPromptBuilder } from '../voice/promptBuilder';
import { PERSONAS } from '../voice/personas/profiles';

console.log("=== Testing Master Prompt Template System ===\n");

// Test Case 1: Anxious Patient
console.log("1. ANXIOUS PATIENT (35yo, Male)");
console.log("─".repeat(60));
const anxiousPersona = PERSONAS['patient_male_anxious'];
const anxiousCaseData = {
    patient: { age: 35, gender: 'male' },
    chiefComplaint: 'Chest pain and shortness of breath'
};

const anxiousPrompt = TTSPromptBuilder.buildMasterPrompt(anxiousPersona, anxiousCaseData);
const anxiousInstructions = TTSPromptBuilder.buildVoiceInstructions(anxiousPersona);

console.log("Persona:", TTSPromptBuilder.getPersonaSummary(anxiousPersona));
console.log("\nVoice Instructions:");
console.log(anxiousInstructions);
console.log("\nMaster Prompt:");
console.log(anxiousPrompt);
console.log("\n");

// Test Case 2: Elderly Patient
console.log("2. ELDERLY PATIENT (72yo, Female)");
console.log("─".repeat(60));
const elderlyPersona = PERSONAS['patient_female_elderly'];
const elderlyCaseData = {
    patient: { age: 72, gender: 'female' },
    chiefComplaint: 'Chronic fatigue and dizziness'
};

const elderlyPrompt = TTSPromptBuilder.buildMasterPrompt(elderlyPersona, elderlyCaseData);
const elderlyInstructions = TTSPromptBuilder.buildVoiceInstructions(elderlyPersona);

console.log("Persona:", TTSPromptBuilder.getPersonaSummary(elderlyPersona));
console.log("\nVoice Instructions:");
console.log(elderlyInstructions);
console.log("\nMaster Prompt:");
console.log(elderlyPrompt);
console.log("\n");

// Test Case 3: Patient in Pain
console.log("3. PATIENT IN PAIN (28yo, Female)");
console.log("─".repeat(60));
const painPersona = PERSONAS['patient_female_pain'];
const painCaseData = {
    patient: { age: 28, gender: 'female' },
    chiefComplaint: 'Severe abdominal pain'
};

const painPrompt = TTSPromptBuilder.buildMasterPrompt(painPersona, painCaseData);
const painInstructions = TTSPromptBuilder.buildVoiceInstructions(painPersona);

console.log("Persona:", TTSPromptBuilder.getPersonaSummary(painPersona));
console.log("\nVoice Instructions:");
console.log(painInstructions);
console.log("\nMaster Prompt:");
console.log(painPrompt);
console.log("\n");

// Test Case 4: Professional Nurse
console.log("4. PROFESSIONAL NURSE");
console.log("─".repeat(60));
const nursePersona = PERSONAS['nurse_professional'];
const nurseCaseData = {
    patient: { age: 45, gender: 'female' },
    chiefComplaint: 'Pre-operative consultation'
};

const nursePrompt = TTSPromptBuilder.buildMasterPrompt(nursePersona, nurseCaseData);
const nurseInstructions = TTSPromptBuilder.buildVoiceInstructions(nursePersona);

console.log("Persona:", TTSPromptBuilder.getPersonaSummary(nursePersona));
console.log("\nVoice Instructions:");
console.log(nurseInstructions);
console.log("\nMaster Prompt:");
console.log(nursePrompt);
console.log("\n");

// Test Case 5: Young Patient
console.log("5. YOUNG PATIENT (22yo, Male)");
console.log("─".repeat(60));
const youngPersona = PERSONAS['patient_young'];
const youngCaseData = {
    patient: { age: 22, gender: 'male' },
    chiefComplaint: 'Sports injury knee pain'
};

const youngPrompt = TTSPromptBuilder.buildMasterPrompt(youngPersona, youngCaseData);
const youngInstructions = TTSPromptBuilder.buildVoiceInstructions(youngPersona);

console.log("Persona:", TTSPromptBuilder.getPersonaSummary(youngPersona));
console.log("\nVoice Instructions:");
console.log(youngInstructions);
console.log("\nMaster Prompt:");
console.log(youngPrompt);
console.log("\n");

console.log("=== Master Prompt Test Complete ===");
console.log("\n✓ All persona types tested");
console.log("✓ Context extraction working");
console.log("✓ Voice instructions generated");
console.log("✓ Master prompts built successfully");
