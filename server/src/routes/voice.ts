
import express from 'express';
import { voiceMcp } from '../voice/mcp/voiceEngine';
import { extractPatientProfile } from '../voice/patientProfileExtractor';
import { selectVoiceForPatient, getAdjustedParameters, isValidVoiceId, getAllVoiceIds } from '../voice/deepinfraChatterboxConfig';
import { smartSynthesize } from '../voice/smartTTSDispatcher';
import { ttsService } from '../services/ttsService';

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

// Debug endpoint to test voice selection
router.post('/debug/test-voice', async (req, res) => {
    try {
        const { age, sex, condition, emotionalState, text } = req.body;

        console.log('[Voice Debug] Test voice request:', { age, sex, condition, emotionalState });

        // Create mock case data
        const mockCaseData = {
            truth: {
                demographics: {
                    age: age || 35,
                    sex: sex || 'Female',
                    name: 'Test Patient'
                },
                chief_complaint: condition || 'General',
                emotional_state: emotionalState || 'neutral'
            }
        };

        // Extract profile
        const profile = extractPatientProfile(mockCaseData);

        // Select voice
        const voice = selectVoiceForPatient(
            { age: profile.demographics.age, sex: profile.demographics.sex },
            { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
        );

        const params = getAdjustedParameters(voice, profile.conditions[0] || 'neutral', profile.emotionalState);

        const result = {
            input: { age, sex, condition, emotionalState },
            extracted: {
                age: profile.demographics.age,
                sex: profile.demographics.sex,
                conditions: profile.conditions,
                emotionalState: profile.emotionalState
            },
            selectedVoice: {
                voiceId: voice.voiceId,
                name: voice.name,
                sex: voice.sex,
                ageGroup: voice.ageGroup,
                characteristics: voice.characteristics
            },
            parameters: {
                exaggeration: params.exaggeration,
                temperature: params.temperature
            },
            allAvailableVoices: getAllVoiceIds().length
        };

        res.json(result);

    } catch (error: any) {
        console.error('[Voice Debug Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to list all voices
router.get('/debug/voices', async (req, res) => {
    try {
        const voices = ttsService.getAvailableVoices();
        res.json({
            total: voices.total,
            male: voices.male.map(v => ({ id: v.voiceId, name: v.name, ageGroup: v.ageGroup })),
            female: voices.female.map(v => ({ id: v.voiceId, name: v.name, ageGroup: v.ageGroup }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create Custom Voice Endpoint
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router.post('/add', upload.single('audio'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const file = req.file;

        if (!name || !file) {
            return res.status(400).json({ error: "Name and audio file are required" });
        }

        console.log(`[Voice API] Request to create voice: "${name}"`);

        const result = await ttsService.createVoice(
            name,
            description || `Custom voice: ${name}`,
            file.buffer,
            file.originalname
        );

        res.json(result);
    } catch (error: any) {
        console.error("[Voice API Add Error]", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
