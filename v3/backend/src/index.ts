import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { MultimodalWebSocketHandler } from './handlers/MultimodalWebSocketHandler.js';
import { evaluationService } from './services/EvaluationService.js';
import { caseDataService } from './services/CaseDataService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Guardian Agent: Zero-leakage database connection.
 */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/osce_master_v3';

// Global Mock Mode Flag
let MOCK_MODE = false;

mongoose.connect(MONGO_URI)
    .then(() => console.log('[Guardian] MongoDB Connected Safely.'))
    .catch(err => {
        console.error('[Guardian] MongoDB Connection Failed. Switching to IN-MEMORY MOCK MODE.');
        MOCK_MODE = true;
    });

// Initialize Multimodal Handlers
const socketHandler = new MultimodalWebSocketHandler(httpServer);

app.get('/health', (req, res) => {
    res.json({
        status: 'Clinical Vibe: Active',
        version: '3.0.0-alpha',
        mode: MOCK_MODE ? 'Mock (In-Memory)' : 'Connected (MongoDB)'
    });
});

// Test evaluation endpoint
app.post('/api/test-evaluation', async (req, res) => {
    try {
        console.log('[Test] Received evaluation test request');
        
        const testEvaluationInput = {
            caseId: req.body.caseId || 'test-case',
            transcript: req.body.transcript || [
                { role: 'user', text: 'Hello, I am Dr. Smith. What brings you in today?', timestamp: new Date() },
                { role: 'model', text: 'I have been having chest pain for the past 2 hours.', timestamp: new Date() },
                { role: 'user', text: 'Can you describe the pain? Is it sharp or pressure-like?', timestamp: new Date() },
                { role: 'model', text: 'It feels like pressure, like someone is sitting on my chest.', timestamp: new Date() }
            ],
            ddxByStage: req.body.ddxByStage || {
                History: [{ diagnosis: 'Acute Coronary Syndrome', status: 'suspected' }],
                Examination: [{ diagnosis: 'Myocardial Infarction', status: 'likely' }]
            },
            examinationsPerformed: req.body.examinationsPerformed || ['Cardiovascular', 'Respiratory'],
            investigationsOrdered: req.body.investigationsOrdered || ['ECG', 'Troponin'],
            managementPlan: req.body.managementPlan || 'Patient needs immediate cardiology consult and monitoring'
        };

        console.log('[Test] Running evaluation with input:', {
            caseId: testEvaluationInput.caseId,
            transcriptLength: testEvaluationInput.transcript.length,
            examinations: testEvaluationInput.examinationsPerformed,
            investigations: testEvaluationInput.investigationsOrdered
        });

        const evaluation = await evaluationService.evaluateSession(testEvaluationInput);
        
        console.log('[Test] Evaluation completed successfully:', {
            overallScore: evaluation.overallScore,
            overallMaxScore: evaluation.overallMaxScore
        });

        res.json({
            success: true,
            mode: MOCK_MODE ? 'mock' : 'connected',
            evaluation
        });
    } catch (error: any) {
        console.error('[Test] Evaluation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Test case data endpoint
app.get('/api/test-case/:caseId', async (req, res) => {
    try {
        const caseData = await caseDataService.getCase(req.params.caseId);
        res.json({
            success: true,
            caseId: req.params.caseId,
            hasMarkingScheme: caseData?.markingScheme ? true : false,
            markingSchemeDetails: caseData?.markingScheme ? {
                historyQuestions: caseData.markingScheme.historyQuestions?.length || 0,
                examinationFindings: caseData.markingScheme.examinationFindings?.length || 0,
                appropriateInvestigations: caseData.markingScheme.appropriateInvestigations?.length || 0,
                expectedDDx: caseData.markingScheme.expectedDDx?.length || 0,
                managementSteps: caseData.markingScheme.managementSteps?.length || 0,
                totalPoints: caseData.markingScheme.totalPoints
            } : null
        });
    } catch (error: any) {
        console.error('[Test] Case fetch failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { MOCK_MODE }; // Export for handlers to use


httpServer.listen(port, () => {
    console.log(`[OSCE Master] Lead Architect Orchestrator running on port ${port}`);
});
