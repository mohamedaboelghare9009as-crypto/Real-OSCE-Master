import './config/env'; // Load env before anything else!

// ============================================================
// CRITICAL: Prevent Event Emitter Memory Leak Warnings
// ============================================================
// Increase the default max listeners for stdout/stderr and other event emitters
// This prevents "MaxListenersExceededWarning" during concurrent operations
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 50; // Increase from default 10 to 50

// Specifically set limits for process streams
if (process.stdout.setMaxListeners) {
    process.stdout.setMaxListeners(50);
}
if (process.stderr.setMaxListeners) {
    process.stderr.setMaxListeners(50);
}
if (process.stdin.setMaxListeners) {
    process.stdin.setMaxListeners(50);
}

console.log("[OSCE Server] Event emitter limits configured (max: 50)");
// ============================================================

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { caseService } from './services/caseService';
import { patientService } from './services/patientService';
import { evaluationService } from './services/evaluationService';
import { sessionService } from './services/sessionService';
import * as caseController from './controllers/caseController';
import adminRoutes from './routes/admin';
import { connectDB } from './config/db';
import passport, { initializePassport } from './config/googleAuth';
import { simulationEngine } from './engine/SimulationEngine';
import axios from 'axios';

console.log("[OSCE Server] Bootstrapping...");

// Connect to MongoDB (Non-blocking for server start)
console.log("[DB] Connecting...");
connectDB().then(() => console.log("[DB] Connected Successfully")).catch(err => console.error("Database connection failed during boot:", err));

// Initialize Passport for Google OAuth
console.log("[Auth] Initializing Passport...");
initializePassport();

const app = express();
const port = process.env.PORT || 3001;

console.log("[Server] Configuring middleware...");
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
        if (origin === process.env.FRONTEND_URL) return callback(null, true);
        return callback(new Error('CORS policy exclusion'), false);
    },
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

console.log("[Server] Registering routes...");
console.log("[Server] Registering routes: Internal...");
import internalRoutes from './routes/internal';
app.use('/api/internal', internalRoutes);

console.log("[Server] Registering routes: Cases...");
import casesRoutes from './routes/cases';
app.use('/api/cases', casesRoutes);

console.log("[Server] Registering routes: Sessions...");
import sessionsRoutes from './routes/sessions';
app.use('/api/sessions', sessionsRoutes);

console.log("[Server] Registering routes: Auth...");
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

console.log("[Server] Registering routes: DevAuth...");
import devAuthRoutes from './routes/devAuth';
app.use('/api/dev-auth', devAuthRoutes);

console.log("[Server] Registering routes: Payment...");
import paymentRoutes from './routes/payment';
app.use('/api/payment', paymentRoutes);

console.log("[Server] Registering routes: Calendar...");
import calendarRoutes from './routes/calendar';
app.use('/api/calendar', calendarRoutes);

console.log("[Server] Registering routes: Engine...");
import engineRoutes from './routes/engine';
app.use('/api/engine', engineRoutes);

console.log("[Server] Registering routes: Voice...");
import voiceRoutes from './routes/voice';
app.use('/api/voice', voiceRoutes);

console.log("[Server] Registering routes: Doctors...");
import doctorsRoutes from './routes/doctors';
app.use('/api/doctors', doctorsRoutes);

console.log("[Server] Initializing TTS and Voice...");
import { ttsService } from './services/ttsService';
import { smartSynthesize } from './voice/smartTTSDispatcher';

// API Routes
app.post('/api/tts', async (req, res) => {
    try {
        const { text, gender, voiceId: requestedVoiceId } = req.body;

        // Use requested voice ID or map gender to appropriate DeepInfra voice
        let voiceId: string;
        if (requestedVoiceId && ttsService.isValidVoice(requestedVoiceId)) {
            voiceId = requestedVoiceId;
        } else {
            // Map Gender to Voice ID (Custom Voices)
            voiceId = gender === 'Male' ? 'steve' : 'Britney';
        }

        console.log(`[API/TTS] Synthesizing with voice: ${voiceId}`);

        // Generate Data URL using DeepInfra API
        const dataUrl = await ttsService.synthesize(text, voiceId, 0.5, 0.8, 0.5, 'mp3');

        // Strip Prefix "data:audio/mp3;base64," to get raw base64
        const base64 = dataUrl.split(',')[1];

        res.json({
            audioContent: base64,
            voiceId: voiceId
        });
    } catch (error: any) {
        console.error("TTS Endpoint Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-case', caseController.getRandomCase);

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const sessionId = req.headers['x-session-id'] as string;
        const caseId = req.headers['x-case-id'] as string || 'default-case';
        const userId = (req.user as any)?.id || 'anonymous';

        if (!message) {
            return res.status(400).json({ error: "Message required" });
        }

        console.log(`[API] Chat Request: "${message}" (Session: ${sessionId})`);

        // Process via New Deterministic Engine
        const engineResponse = await simulationEngine.process(message, userId, caseId, sessionId);

        // Load case data for TTS voice selection
        const caseData = await caseService.getCaseById(caseId, sessionId);

        // TTS (Output Audio) with Smart Voice Selection
        let audioContent = "";
        try {
            console.log(`[API] Smart TTS: Processing patient response`);

            const ttsResult = await smartSynthesize(
                engineResponse.text,
                caseData,
                { isNurse: engineResponse.meta.isNurse || false }
            );

            audioContent = ttsResult.audioDataUrl.split(',')[1];

            console.log(`[API] Smart TTS: Voice=${ttsResult.voiceInfo.voiceId}, Tags=${ttsResult.voiceInfo.tags.join(', ') || 'None'}`);
        } catch (ttsError: any) {
            console.error("[API] Smart TTS Failed:", ttsError.message);

            // Fallback to basic synthesize
            try {
                const voiceId = engineResponse.meta.isNurse ? 'Britney' :
                    ((caseData as any)?.truth?.demographics?.sex === 'Male' ? 'Tarkos' : 'Britney');
                const audioDataUrl = await ttsService.synthesize(
                    engineResponse.text,
                    voiceId,
                    0.5,
                    0.8,
                    0.5, // cfg parameter
                    'mp3'
                );
                audioContent = audioDataUrl.split(',')[1];
                console.log(`[API] Fallback TTS successful with voice: ${voiceId}`);
            } catch (fallbackError) {
                console.error("[API] Fallback TTS also failed:", fallbackError);
            }
        }

        // Strip tags for the UI response
        const uiText = engineResponse.text.replace(/<[^>]*>/g, '').trim();

        res.json({
            text: uiText,
            audio: audioContent,
            finalIntent: engineResponse.finalIntent,
            entry: {
                id: Date.now().toString(),
                role: 'model',
                content: uiText,
                timestamp: new Date()
            },
            ...engineResponse.meta
        });

    } catch (error) {
        console.error("[API] Chat Error:", error);
        res.status(500).json({
            text: "I'm having a bit of a dizzy spell. Can you repeat that?", // In-world error
            error: "Internal Server Error"
        });
    }
});

app.post('/api/assess-ddx', async (req, res) => {
    try {
        const { sessionId, submittedDDx, stage } = req.body;

        const session = await sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const caseContent = await caseService.getCaseById(session.caseId);
        if (!caseContent) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const result = await evaluationService.assessDifferential(caseContent, submittedDDx, stage);
        res.json(result);
    } catch (error: any) {
        console.error('[Evaluate] DDx assessment error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/evaluate', async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const caseContent = await caseService.getCaseById(session.caseId);
        if (!caseContent) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const result = await evaluationService.evaluateSession(session, caseContent);
        res.json(result);
    } catch (error: any) {
        console.error('[Evaluate] Session evaluation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

import { createServer } from 'http';
import { SocketService } from './services/socketService';

const httpServer = createServer(app);
const socketService = new SocketService(httpServer);

const server = httpServer.listen(port, () => {
    console.log(`[OSCE Server] Server (HTTP+WS) running on port ${port}`);
});

// Robust Error Handling for Startup
server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`[FATAL] Port ${port} is already in use.`);
        console.error(`[FATAL] Please kill the process using this port or choose a different one.`);
        process.exit(1);
    } else {
        console.error('[FATAL] An error occurred starting the server:', error);
        process.exit(1);
    }
});

// Graceful Shutdown for Hot Reload
const gracefulShutdown = () => {
    console.log('[OSCE Server] Received kill signal, shutting down gracefully...');

    server.close(() => {
        console.log('[OSCE Server] Closed out remaining connections.');
        process.exit(0);
    });

    // Force close if it takes too long
    setTimeout(() => {
        console.error('[OSCE Server] Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000); // Reduced to 5s for faster restart
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
