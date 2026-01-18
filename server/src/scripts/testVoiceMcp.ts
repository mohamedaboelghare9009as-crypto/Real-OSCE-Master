
import '../config/env';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Session } from '../models/Session';
import { Case } from '../models/Case';
import { voiceMcp } from '../voice/mcp/voiceEngine';

async function testVoice() {
    await connectDB();

    console.log("1. Finding Case...");
    const osceCase = await Case.findOne({ "metadata.title": "Acute Chest Pain" });
    if (!osceCase) {
        console.error("Case not found. Run seedPECase.ts first.");
        return;
    }
    console.log(`Found Case: ${osceCase.metadata.id}`);

    console.log("2. Creating Session...");
    const session = await Session.create({
        userId: "voice-test-user",
        caseId: osceCase._id,
        currentStage: "History",
        scoreTotal: 0
    });
    console.log(`Session Created: ${session._id}`);

    console.log("3. Testing Voice Interaction (Input: 'I have chest pain')...");
    try {
        const result = await voiceMcp.processVoiceInteraction({
            sessionId: session._id.toString(),
            text: "I have sharp chest pain on the right side",
            speaker: 'student'
        });

        console.log("\n=== RESULT ===");
        console.log("Transcript:", result.transcript);
        console.log("Speaker:", result.data.speaker);
        console.log("Text:", result.data.text);
        console.log("Action:", result.data.action);
        console.log("Audio URL:", result.audioUrl?.substring(0, 50) + "...");
        console.log("Allowed:", result.data.allowed);

        console.log("\n4. Verifying Session State...");
        const updatedSession = await Session.findById(session._id);
        console.log("Actions Taken:", updatedSession?.actionsTaken.length);
        console.log("Latest Action:", updatedSession?.actionsTaken[0]);
        console.log("Score Total:", updatedSession?.scoreTotal);

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        // Cleanup
        await Session.deleteMany({ userId: "voice-test-user" });
        await mongoose.disconnect();
    }
}

testVoice();
