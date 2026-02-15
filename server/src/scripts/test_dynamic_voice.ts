
import { dynamicVoiceEngine, voiceTagsEngine } from '../voice';
import { ttsService } from '../services/ttsService';
import { VoiceTag } from '../voice/tags/voiceTagsEngine';

async function testDynamicVoiceFeatures() {
    console.log("=" .repeat(60));
    console.log("DYNAMIC VOICE ENGINE - COMPREHENSIVE TEST");
    console.log("=" .repeat(60));

    console.log("\n📋 AVAILABLE VOICES:");
    const voices = ttsService.getAvailableVoices();
    console.log(`  Male: ${voices.male.join(', ')}`);
    console.log(`  Female: ${voices.female.join(', ')}`);

    console.log("\n🎨 AVAILABLE STYLES:");
    const styles = ttsService.getAvailableStyles();
    console.log(`  ${styles.join(', ')}`);

    const testCases = [
        {
            name: "Elderly Male with Chest Pain",
            demographics: { age: 72, sex: 'male', name: 'Mr. Thompson' },
            conditions: ['chest pain', 'pressure', 'shortness of breath'],
            emotionalState: 'anxious'
        },
        {
            name: "Young Female with Anxiety",
            demographics: { age: 24, sex: 'female', name: 'Sarah' },
            conditions: ['palpitations', 'nervous', 'worried'],
            emotionalState: 'anxious'
        },
        {
            name: "Pediatric Male with Asthma",
            demographics: { age: 10, sex: 'male', name: 'Tommy' },
            conditions: ['wheezing', 'shortness of breath', 'cough'],
            emotionalState: 'upset'
        },
        {
            name: "Elderly Female with Chronic Pain",
            demographics: { age: 78, sex: 'female', name: 'Mrs. Davis' },
            conditions: ['back pain', 'aching', 'stiffness'],
            emotionalState: 'tired'
        },
        {
            name: "Adult Male with Respiratory Distress",
            demographics: { age: 45, sex: 'male', name: 'John' },
            conditions: ['asthma', 'breathing difficulty', 'wheezing'],
            emotionalState: 'distressed'
        }
    ];

    for (const testCase of testCases) {
        console.log("\n" + "-".repeat(60));
        console.log(`🧪 Test: ${testCase.name}`);
        console.log("-".repeat(60));

        console.log(ttsService.previewVoiceForPatient(
            testCase.demographics,
            testCase.conditions,
            testCase.emotionalState
        ));

        const sampleText = "I've been having this pain in my chest for about an hour now. It feels like pressure and it's spreading to my arm.";

        console.log("\n📝 Original Text:");
        console.log(`  "${sampleText}"`);

        console.log("\n🏷️ With Auto Voice Tags:");
        const result = await ttsService.synthesizeForPatient(
            sampleText,
            testCase.demographics,
            testCase.conditions,
            testCase.emotionalState,
            { insertVoiceTags: true }
        );
        console.log(`  Processed: "${result.configuration.voiceId}"`);
        console.log(`  Voice Tags Used: ${result.voiceTagsUsed.length > 0 ? result.voiceTagsUsed.join(', ') : 'None'}`);

        console.log("\n🎭 Manual Voice Tags Test:");
        const manualTags: VoiceTag[] = ['[cough]', '[groan]', '[sigh]'];
        const manualResult = await ttsService.synthesizeForPatient(
            sampleText,
            testCase.demographics,
            testCase.conditions,
            testCase.emotionalState,
            { voiceTags: manualTags }
        );
        console.log(`  Tags Added: ${manualTags.join(', ')}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("VOICE TAGS ENGINE TEST");
    console.log("=".repeat(60));

    const voiceTagTests: { name: string; conditions: string[]; text: string }[] = [
        {
            name: "Respiratory Patient",
            conditions: ['cough', 'wheeze', 'breath'],
            text: "I can't catch my breath. Every time I try to inhale, it feels like my chest is tight."
        },
        {
            name: "Anxious Patient",
            conditions: ['nervous', 'worry', 'anxious'],
            text: "I'm really worried about what these test results might show. What if it's something serious?"
        },
        {
            name: "Pain Patient",
            conditions: ['pain', 'hurt', 'aching'],
            text: "When I try to move, the pain shoots through my lower back. I can barely stand up."
        }
    ];

    for (const test of voiceTagTests) {
        console.log("\n" + "-".repeat(60));
        console.log(`🏷️ Test: ${test.name}`);
        console.log("-".repeat(60));

        console.log(`Original: "${test.text}"`);

        const autoTagged = voiceTagsEngine.autoGenerateFromConditions(test.conditions, test.text);
        console.log(`Auto-Tagged: "${autoTagged}"`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("ALL TESTS COMPLETED");
    console.log("=".repeat(60));
}

testDynamicVoiceFeatures().catch(console.error);
