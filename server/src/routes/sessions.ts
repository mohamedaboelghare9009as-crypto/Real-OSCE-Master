
import express from 'express';
import { Session } from '../models/Session';
import { Case } from '../models/Case';
import { ScoringEngine } from '../mcp/scoring/engine';
import { SessionState } from '../schemas/sessionSchema';
import { OsceCase } from '../schemas/caseSchema';

const router = express.Router();

import { sessionService } from '../services/sessionService';

// Create new session
router.post('/', async (req, res) => {
    try {
        const { userId, caseId } = req.body;
        // Use service to handle DB or Mock creation
        const session = await sessionService.createSession(userId || 'anonymous', caseId);
        res.status(201).json(session);
    } catch (error: any) {
        console.error("Create Session Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get sessions by user
router.get('/user/:userId', async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.params.userId }).sort({ startTime: -1 });
        res.json(sessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: Action Submission Endpoint
 * Triggers Scoring Engine
 */
router.post('/:sessionId/action', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { action, stage, details } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.isCompleted) {
            return res.status(400).json({ error: 'Session is already completed' });
        }

        // Load Case
        const caseContent = await Case.findOne({
            $or: [
                { _id: session.caseId },
                { "metadata.id": session.caseId }
            ]
        });

        if (!caseContent) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Run Scoring Engine
        // We need to cast Mongoose docs to the Interface types
        const scoringResult = await ScoringEngine.evaluateAction(
            caseContent.toObject() as OsceCase,
            session.toObject() as SessionState,
            action,
            stage
        );

        // Update Session
        session.scoreTotal = scoringResult.pointsTotal;

        // Merge critical flags
        scoringResult.criticalFlags.forEach(flag => {
            if (!session.criticalFlags.includes(flag)) {
                session.criticalFlags.push(flag);
            }
        });

        // Add to actionsTaken
        session.actionsTaken.push({
            action: action,
            stage: stage,
            pointsAwarded: scoringResult.pointsAwarded,
            timestamp: new Date(),
            details: details
        });

        session.lastInteraction = new Date();

        await session.save();

        res.json({
            pointsAwarded: scoringResult.pointsAwarded,
            totalScore: scoringResult.pointsTotal,
            criticalFlags: scoringResult.criticalFlags,
            feedback: scoringResult.feedback,
            updatedStage: session.currentStage
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: Get Score Breakdown
 */
router.get('/:sessionId/score', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        res.json({
            scoreTotal: session.scoreTotal,
            criticalFlags: session.criticalFlags,
            failedStage: session.failedStage,
            actions: session.actionsTaken
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: Complete Session
 */
router.post('/:sessionId/complete', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        session.isCompleted = true;
        session.lastInteraction = new Date();
        await session.save();

        res.json({ status: 'completed', finalScore: session.scoreTotal });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
