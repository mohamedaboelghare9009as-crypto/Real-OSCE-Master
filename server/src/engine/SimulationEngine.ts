
import { patientEngine } from './PatientEngine';
import { StateManager } from './core/StateManager';
import { caseService } from '../services/caseService';
import { OsceCaseV2 } from '../schemas/caseSchema';
import { SimulationResponse } from './types';

export class SimulationEngine {
    private stateManager: StateManager;

    constructor() {
        this.stateManager = new StateManager();
    }

    async process(message: string, userId: string, caseId: string, sessionId?: string): Promise<SimulationResponse> {
        console.log(`\n=== [SIMULATION ENGINE START] ===`);
        console.log(`[INPUT] "${message}"`);

        // 1. Session & History
        let context = await this.stateManager.loadSession(userId, caseId);
        if (!context) {
            context = await this.stateManager.createSession(userId, caseId);
        }

        const history = context.history || [];
        const sid = sessionId || context.sessionId;

        // 2. Load Case Data
        const caseData = await caseService.getCaseById(caseId) as unknown as OsceCaseV2;
        if (!caseData || !caseData.truth) {
            console.error(`[Engine] Invalid case data for ID: ${caseId}`);
            return {
                text: "I'm sorry, I'm feeling a bit lost. Can we start over?",
                finalIntent: 'UNKNOWN' as any
            };
        }

        // 3. Generate Patient Response (Natural & Human-like)
        const responseText = await patientEngine.generateResponse(message, history, caseData);

        // 4. Update Conversation History (Persistence)
        if (sid) {
            await this.stateManager.addMessage(sid, 'user', message);
            await this.stateManager.addMessage(sid, 'model', responseText);
        }

        console.log(`[ORCHESTRATOR] Sending response: "${responseText.substring(0, 50)}..."`);
        console.log(`=== [ENGINE END] ===\n`);

        return {
            text: responseText,
            finalIntent: 'NATURAL_RESPONSE' as any,
            meta: { category: 'natural' }
        };
    }
}

export const simulationEngine = new SimulationEngine();
