import express from 'express';
import { ScoringEngine } from '../mcp/scoring/engine';
import { SessionState } from '../schemas/sessionSchema';
import { OsceCase } from '../schemas/caseSchema';

const router = express.Router();

import { sessionService } from '../services/sessionService';
import { caseService } from '../services/caseService';
import { evaluationService } from '../services/evaluationService';

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

// Get sessions by user (Legacy/Admin - might touch DB directly?)
// Architecture Rule: "Backend only talks to MongoDB".
// It is fine to query DB for list of sessions (e.g. Dashboard).
// The rule "No usage during session" applies to the *Simulation Loop*.
// Listing sessions is outside the simulation loop.
// So we can leave it or add a method to sessionService.
// Let's leave direct DB here for now, or use Session model if we want to query many.
// But wait, I want to remove Session model usage if possible to enforce pattern.
// Let's just import Session for this one read-only operational query.
import { Session } from '../models/Session';
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

        // 1. Get Session (Memory First)
        const session = await sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.isCompleted) {
            return res.status(400).json({ error: 'Session is already completed' });
        }

        // 2. Get Case (Memory First)
        const caseContent = await caseService.getCaseById(session.caseId, sessionId);
        if (!caseContent) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // 3. Run Scoring Engine
        const scoringResult = await ScoringEngine.evaluateAction(
            caseContent,
            session,
            action,
            stage
        );

        // 4. Update Session Local State (POJO)
        const updates: Partial<SessionState> = {};

        updates.scoreTotal = scoringResult.pointsTotal;

        // Merge critical flags
        const newFlags = [...session.criticalFlags];
        scoringResult.criticalFlags.forEach(flag => {
            if (!newFlags.includes(flag)) {
                newFlags.push(flag);
            }
        });
        updates.criticalFlags = newFlags;

        if (scoringResult.isStageFailed) {
            updates.failedStage = true;
        }

        // Add to actionsTaken
        const newActions = [...session.actionsTaken];
        newActions.push({
            action: action,
            stage: stage,
            pointsAwarded: scoringResult.pointsAwarded,
            timestamp: new Date(),
            details: details
        });
        updates.actionsTaken = newActions;
        updates.lastInteraction = new Date();

        // 5. Commit Updates (Memory Only, via Service)
        await sessionService.updateSession(sessionId, updates);

        res.json({
            pointsAwarded: scoringResult.pointsAwarded,
            totalScore: scoringResult.pointsTotal,
            criticalFlags: scoringResult.criticalFlags,
            isStageFailed: scoringResult.isStageFailed,
            failedStage: scoringResult.isStageFailed || session.failedStage,
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
        const session = await sessionService.getSession(sessionId);
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
        const session = await sessionService.getSession(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const caseContent = await caseService.getCaseById(session.caseId, sessionId);
        if (!caseContent) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const evaluation = await evaluationService.evaluateSession(session, caseContent as any);

        // This call will trigger Persistence because isCompleted=true
        await sessionService.updateSession(sessionId, {
            isCompleted: true,
            lastInteraction: new Date()
        });

        res.json({ 
            status: 'completed', 
            finalScore: evaluation.finalScore,
            passed: evaluation.passed,
            evaluation
        });

    } catch (error: any) {
        console.error('[Complete] Session completion error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
