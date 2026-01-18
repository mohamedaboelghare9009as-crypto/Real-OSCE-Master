
import express from 'express';
import { voiceMcp } from '../voice/mcp/voiceEngine';

const router = express.Router();

// Main Voice Interaction Endpoint
router.post('/interact', async (req, res) => {
    try {
        const { sessionId, audioBase64, text, speaker } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        const result = await voiceMcp.processVoiceInteraction({
            sessionId,
            audioBase64,
            text, // Optional fallback
            speaker: speaker || 'student'
        });

        // Result contains: { audioUrl, transcript, data: { speaker, text, action, allowed } }
        res.json(result);

    } catch (error: any) {
        console.error("[Voice API Error]", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
