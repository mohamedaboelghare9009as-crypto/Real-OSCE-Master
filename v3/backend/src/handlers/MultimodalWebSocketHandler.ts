import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import { SimulationState } from '../models/SimulationState';
import { nurseHandler } from '../services/NurseHandler';
import { caseDataService } from '../services/CaseDataService';
import { evaluationService, EvaluationInput } from '../services/EvaluationService';

// In-memory session state for mock mode
const mockSessionStates: Map<string, any> = new Map();

/**
 * MultimodalWebSocketHandler
 * Orchestrates dual-streams: Patient (Gemini Live) and Nurse (Avatar UI).
 * Follows the 'Vibe Coding' philosophy: Intent-Based Reactions.
 */
export class MultimodalWebSocketHandler {
    private io: SocketIOServer;

    constructor(server: HttpServer) {
        this.io = new SocketIOServer(server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });

        this.initialize();
    }

    private getSessionState(sessionId: string): any {
        return mockSessionStates.get(sessionId);
    }

    private setSessionState(sessionId: string, state: any): void {
        mockSessionStates.set(sessionId, state);
    }

    private initialize() {
        this.io.on('connection', (socket) => {
            console.log(`[V3] Client Connected: ${socket.id}`);

            // 1. Join Session Room
            socket.on('join-session', (sessionId: string) => {
                socket.join(sessionId);
                console.log(`[V3] Client ${socket.id} joined session: ${sessionId}`);
                
                // Initialize session state in mock mode if not exists
                if (!this.getSessionState(sessionId)) {
                    this.setSessionState(sessionId, {
                        sessionId,
                        patientId: 'patient-001',
                        nurseId: 'nurse-001',
                        vitals: null,
                        currentMeds: [],
                        revealedFacts: [],
                        physicalExamFindings: [],
                        investigationResults: [],
                        managementPlan: '',
                        ddxByStage: {},
                        transcript: [],
                        emotionalState: 'Neutral',
                        stage: 'History',
                        lastInteraction: new Date()
                    });
                    console.log(`[V3] Initialized mock session state for: ${sessionId}`);
                }
            });

            // Handle DDx Submission
            socket.on('submit-ddx', async (data: { sessionId: string; stage: string; ddxList: Array<{ diagnosis: string; status: string }> }) => {
                console.log(`[V3] DDx Submitted for ${data.stage}:`, data.ddxList);
                const { MOCK_MODE } = await import('../index.js');

                const updateField = `ddxByStage.${data.stage}`;
                
                if (MOCK_MODE) {
                    // Update mock session state
                    const sessionState = this.getSessionState(data.sessionId);
                    if (sessionState) {
                        sessionState.ddxByStage = sessionState.ddxByStage || {};
                        sessionState.ddxByStage[data.stage] = data.ddxList;
                        sessionState.lastInteraction = new Date();
                        this.setSessionState(data.sessionId, sessionState);
                    }
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { $set: { [updateField]: data.ddxList, lastInteraction: new Date() } }
                    );
                }
                socket.emit('ddx-saved', { stage: data.stage, success: true });
            });

            // Handle Transcript Message Addition
            socket.on('add-transcript-message', async (data: { sessionId: string; role: string; text: string }) => {
                const { MOCK_MODE } = await import('../index.js');
                
                if (MOCK_MODE) {
                    // Update mock session state
                    const sessionState = this.getSessionState(data.sessionId);
                    if (sessionState) {
                        sessionState.transcript = sessionState.transcript || [];
                        sessionState.transcript.push({
                            role: data.role,
                            text: data.text,
                            timestamp: new Date()
                        });
                        sessionState.lastInteraction = new Date();
                        this.setSessionState(data.sessionId, sessionState);
                    }
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { $push: { transcript: { role: data.role, text: data.text, timestamp: new Date() } } }
                    );
                }
            });

            // Handle Physical Exam Finding
            socket.on('physical-exam-finding', async (data: { sessionId: string; system: string; finding: string }) => {
                const { MOCK_MODE } = await import('../index.js');
                
                if (MOCK_MODE) {
                    const sessionState = this.getSessionState(data.sessionId);
                    if (sessionState) {
                        sessionState.physicalExamFindings = sessionState.physicalExamFindings || [];
                        sessionState.physicalExamFindings.push({
                            system: data.system,
                            finding: data.finding
                        });
                        this.setSessionState(data.sessionId, sessionState);
                    }
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { $push: { physicalExamFindings: { system: data.system, finding: data.finding } } }
                    );
                }
            });

            // Handle Investigation Result
            socket.on('investigation-result', async (data: { sessionId: string; test: string; result: string; category: string }) => {
                const { MOCK_MODE } = await import('../index.js');
                
                if (MOCK_MODE) {
                    const sessionState = this.getSessionState(data.sessionId);
                    if (sessionState) {
                        sessionState.investigationResults = sessionState.investigationResults || [];
                        sessionState.investigationResults.push({
                            test: data.test,
                            result: data.result,
                            category: data.category
                        });
                        this.setSessionState(data.sessionId, sessionState);
                    }
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { $push: { investigationResults: { test: data.test, result: data.result, category: data.category } } }
                    );
                }
            });

            // Handle Management Plan
            socket.on('management-plan', async (data: { sessionId: string; plan: string }) => {
                const { MOCK_MODE } = await import('../index.js');
                
                if (MOCK_MODE) {
                    const sessionState = this.getSessionState(data.sessionId);
                    if (sessionState) {
                        sessionState.managementPlan = data.plan;
                        this.setSessionState(data.sessionId, sessionState);
                    }
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { $set: { managementPlan: data.plan } }
                    );
                }
            });

            // Handle Evaluation Request
            socket.on('request-evaluation', async (data: { sessionId: string; caseId: string }) => {
                console.log(`[V3] Evaluation Requested for session: ${data.sessionId}, case: ${data.caseId}`);
                try {
                    const { MOCK_MODE } = await import('../index.js');
                    let sessionState;

                    if (MOCK_MODE) {
                        // Get session state from in-memory storage
                        sessionState = this.getSessionState(data.sessionId);
                        if (!sessionState) {
                            // Create default session state if none exists
                            sessionState = {
                                sessionId: data.sessionId,
                                transcript: [],
                                ddxByStage: {},
                                physicalExamFindings: [],
                                investigationResults: [],
                                managementPlan: ''
                            };
                        }
                        console.log(`[V3] Using mock session state with ${sessionState.transcript?.length || 0} transcript entries`);
                    } else {
                        sessionState = await SimulationState.findOne({ sessionId: data.sessionId });
                    }

                    if (!sessionState) {
                        socket.emit('evaluation-error', { error: 'Session not found' });
                        return;
                    }

                    // Extract unique examinations performed (deduplicate)
                    const examinationsPerformed = [...new Set(
                        (sessionState.physicalExamFindings || [])
                            .map((e: any) => String(e.system))
                            .filter((s: string) => s && s.length > 0)
                    )] as string[];

                    // Extract unique investigations ordered (deduplicate)
                    const investigationsOrdered = [...new Set(
                        (sessionState.investigationResults || [])
                            .map((i: any) => String(i.test))
                            .filter((t: string) => t && t.length > 0)
                    )] as string[];

                    // Build evaluation input with explicit types
                    const evaluationInput: EvaluationInput = {
                        caseId: data.caseId,
                        transcript: sessionState.transcript || [],
                        ddxByStage: sessionState.ddxByStage || {},
                        examinationsPerformed,
                        investigationsOrdered,
                        managementPlan: sessionState.managementPlan || ''
                    };

                    console.log('[V3] Evaluation Input:', {
                        transcriptLength: evaluationInput.transcript.length,
                        examinationsPerformed: evaluationInput.examinationsPerformed.length,
                        investigationsOrdered: evaluationInput.investigationsOrdered.length,
                        ddxStages: Object.keys(evaluationInput.ddxByStage),
                        hasManagementPlan: !!evaluationInput.managementPlan,
                        mode: MOCK_MODE ? 'mock' : 'connected'
                    });

                    const evaluation = await evaluationService.evaluateSession(evaluationInput);

                    // Store evaluation
                    if (MOCK_MODE) {
                        const currentState = this.getSessionState(data.sessionId);
                        if (currentState) {
                            currentState.evaluationScore = evaluation;
                            this.setSessionState(data.sessionId, currentState);
                        }
                    } else {
                        await SimulationState.findOneAndUpdate(
                            { sessionId: data.sessionId },
                            { $set: { evaluationScore: evaluation, lastInteraction: new Date() } }
                        );
                    }

                    socket.emit('evaluation-complete', evaluation);
                } catch (error: any) {
                    console.error('[V3] Evaluation Error:', error);
                    socket.emit('evaluation-error', { error: error.message });
                }
            });

            // 6. Handle User Input (Nurse or Patient Intent)
            socket.on('message', async (data: { text: string; caseId: string; sessionId: string; target?: 'Nurse' | 'Patient' }) => {
                console.log(`[V3] Message Received: "${data.text}" targeting ${data.target || 'Auto'} for case ${data.caseId}`);

                const text = data.text.toLowerCase();
                const isNurseTargeted = data.target === 'Nurse' || text.includes('nurse') || text.includes('sister');

                if (isNurseTargeted) {
                    await this.handleNurseIntent(socket, data.sessionId, data.caseId, data.text);
                } else {
                    await this.handlePatientIntent(socket, data.sessionId, data.caseId, data.text);
                }
            });
        });
    }

    private async handleNurseIntent(socket: any, sessionId: string, caseId: string, text: string) {
        console.log(`[V3] [Nurse] Resolving intent for: "${text}" with caseId: ${caseId}`);

        // 1. Generate AI Response from Nurse Persona
        const responseText = await nurseHandler.generateResponse(sessionId, text);

        // 2. Emit the text response immediately
        socket.emit('ai-response-text', {
            text: responseText,
            meta: { role: 'nurse', isNurse: true }
        });

        // 3. Handle Clinical Logic (Mock state updates for vitals/meds)
        const { MOCK_MODE } = await import('../index.js');
        const lowerText = text.toLowerCase();

        if (lowerText.includes('vitals') || lowerText.includes('pressure') || lowerText.includes('heart')) {
            // Trigger a vitals update simulation using actual case data
            const caseData = await caseDataService.getCase(caseId);
            const update = {
                vitals: caseData?.vitals || {
                    heartRate: 85 + Math.floor(Math.random() * 10),
                    bloodPressure: "125/82",
                    oxygenSaturation: 97,
                    temperature: 37.2
                }
            };

            // Immediate emission for Vibe response
            this.io.to(sessionId).emit('state-update', { sessionId, ...update, lastInteraction: new Date() });

            if (!MOCK_MODE) {
                await SimulationState.findOneAndUpdate({ sessionId }, { $set: { ...update, lastInteraction: new Date() } });
            }
        }

        if (lowerText.includes('saline') || lowerText.includes('give') || lowerText.includes('medication')) {
            const update = { currentMeds: [text] };
            this.io.to(sessionId).emit('state-update', { sessionId, ...update, lastInteraction: new Date() });

            if (!MOCK_MODE) {
                await SimulationState.findOneAndUpdate(
                    { sessionId },
                    { $push: { currentMeds: text }, $set: { lastInteraction: new Date() } }
                );
            }
        }

        // 4. Handle Case-Specific Investigation Orders
        const foundInv = await caseDataService.findInvestigation(caseId, text);
        if (foundInv) {
            console.log(`[V3] [Nurse] Revealing Investigation: ${foundInv.test}`);
            const update = {
                investigationResults: [{ test: foundInv.test, result: foundInv.result, category: foundInv.category }]
            };
            this.io.to(sessionId).emit('state-update', { sessionId, ...update, lastInteraction: new Date() });

            if (!MOCK_MODE) {
                await SimulationState.findOneAndUpdate(
                    { sessionId },
                    {
                        $push: { investigationResults: { test: foundInv.test, result: foundInv.result, category: foundInv.category } },
                        $set: { lastInteraction: new Date() }
                    }
                );
            }
        }

        // 4b. Handle Case-Specific Physical Exam Findings via Nurse (e.g. "Nurse, I'm examining...")
        const foundExam = await caseDataService.findExamFinding(caseId, text);
        if (foundExam) {
            console.log(`[V3] [Nurse] Revealing Physical Exam: ${foundExam.system}`);
            const update = {
                physicalExamFindings: [{ system: foundExam.system, finding: foundExam.finding }]
            };
            this.io.to(sessionId).emit('state-update', { sessionId, ...update, lastInteraction: new Date() });

            if (!MOCK_MODE) {
                await SimulationState.findOneAndUpdate(
                    { sessionId },
                    {
                        $push: { physicalExamFindings: { system: foundExam.system, finding: foundExam.finding } },
                        $set: { lastInteraction: new Date() }
                    }
                );
            }
        }

        // 5. Handle Management Plan Reveal (V3 specifically)
        if (lowerText.includes('management') || lowerText.includes('plan')) {
            const caseData = await caseDataService.getCase(caseId);
            if (caseData) {
                console.log(`[V3] [Nurse] Revealing Management Plan`);
                const update = { managementPlan: caseData.management || "Follow clinical guidelines for the diagnosed condition." };
                if (MOCK_MODE) {
                    this.io.to(sessionId).emit('state-update', {
                        sessionId,
                        ...update,
                        lastInteraction: new Date()
                    });
                } else {
                    await SimulationState.findOneAndUpdate(
                        { sessionId },
                        { $set: { ...update, lastInteraction: new Date() } }
                    );
                }
            }
        }
    }

    private async handlePatientIntent(socket: any, sessionId: string, caseId: string, text: string) {
        console.log(`[V3] [Patient] Processing: "${text}" with caseId: ${caseId}`);
        const { MOCK_MODE } = await import('../index.js');

        // 1. Handle Case-Specific Physical Exam Findings
        const foundExam = await caseDataService.findExamFinding(caseId, text);
        if (foundExam) {
            console.log(`[V3] [Patient] Revealing Physical Exam: ${foundExam.system}`);
            const update = {
                physicalExamFindings: [{ system: foundExam.system, finding: foundExam.finding }]
            };

            // Immediate emission
            this.io.to(sessionId).emit('state-update', { sessionId, ...update, lastInteraction: new Date() });

            if (!MOCK_MODE) {
                await SimulationState.findOneAndUpdate(
                    { sessionId },
                    {
                        $push: { physicalExamFindings: { system: foundExam.system, finding: foundExam.finding } },
                        $set: { lastInteraction: new Date() }
                    }
                );
            }
        }

        // 2. Acknowledge Response
        socket.emit('ai-response-text', {
            text: foundExam ? `The examination of the ${foundExam.system} is complete.` : "I can help you with that. What specifically would you like to check?",
            meta: { role: 'patient' }
        });
    }

    /**
     * Janitor Agent: High-performance state sync via Change Streams.
     * Links simulation state directly to the UI without polling.
     */
    private setupChangeStreams() {
        SimulationState.watch().on('change', (change) => {
            if (change.operationType === 'update' || change.operationType === 'replace') {
                const doc = change.fullDocument;
                if (doc && doc.sessionId) {
                    this.io.to(doc.sessionId).emit('state-update', doc);
                }
            }
        });
    }
}
