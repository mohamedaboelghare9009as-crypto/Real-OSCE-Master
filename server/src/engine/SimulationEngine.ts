
import { intentRouter, IntentCategory } from '../services/intentRouter';
import { intentClassifier } from '../services/intentClassifier';
import { conversationalHandler } from '../services/conversationalHandler';
import { nurseHandler } from '../services/nurseHandler';
import { guidelineVerificationAgent } from '../services/GuidelineVerificationAgent';
import { ContextValidator } from './core/ContextValidator';
import { FactRetriever } from './core/FactRetriever';
import { StateManager } from './core/StateManager';
import { ResponseFormatter } from './core/ResponseFormatter';
import { caseService } from '../services/caseService';
import { OsceCaseV2 } from '../schemas/caseSchema';
import { SimulationResponse } from './types';
import { IntentCode } from '../types/intents';
import { ttsService } from '../services/ttsService';
import { mcpLayer } from '../mcp';

export class SimulationEngine {
    private contextValidator: ContextValidator;
    private factRetriever: FactRetriever;
    private stateManager: StateManager;
    private responseFormatter: ResponseFormatter;

    constructor() {
        this.contextValidator = new ContextValidator();
        this.factRetriever = new FactRetriever();
        this.stateManager = new StateManager();
        this.responseFormatter = new ResponseFormatter();
    }

    async process(message: string, userId: string, caseId: string, sessionId?: string): Promise<SimulationResponse> {
        return this.internalProcess(message, userId, caseId, sessionId, false) as Promise<SimulationResponse>;
    }

    async *processStream(message: string, userId: string, caseId: string, sessionId?: string): AsyncIterable<{ textChunk?: string, fullSentence?: string, meta?: any }> {
        const stream = await this.internalProcess(message, userId, caseId, sessionId, true) as AsyncIterable<{ textChunk?: string, fullSentence?: string, meta?: any }>;
        yield* stream;
    }

    private async internalProcess(message: string, userId: string, caseId: string, sessionId: string | undefined, isStreaming: boolean): Promise<SimulationResponse | AsyncIterable<any>> {
        console.log(`\n=== [SIMULATION ENGINE START] ===`);
        console.log(`[INPUT] "${message}" (Streaming: ${isStreaming})`);

        // 1. Session & State Management
        let context = await this.stateManager.loadSession(userId, caseId, sessionId);
        if (!context) {
            context = await this.stateManager.createSession(userId, caseId, sessionId);
        }

        const actualSessionId = context.sessionId;
        const caseData = await caseService.getCaseById(caseId, actualSessionId) as unknown as OsceCaseV2;

        if (!caseData || !caseData.truth) {
            const fallback = { text: "I'm sorry, I'm feeling a bit lost. Can we start over?", finalIntent: 'UNKNOWN' as any };
            return isStreaming ? (async function* () { yield { fullSentence: fallback.text, meta: { finalIntent: fallback.finalIntent } }; }()) : fallback;
        }

        // 2. INTENT ROUTING
        const routeResult = await intentRouter.route(message);
        const transcript = context.transcript || [];
        const geminiHistory = transcript.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let responseMeta: any = { category: routeResult.category.toLowerCase() };

        if (isStreaming) {
            return this.handleStepStreaming(message, routeResult, caseData, actualSessionId, context, geminiHistory, responseMeta);
        } else {
            return this.handleStepSync(message, routeResult, caseData, actualSessionId, context, geminiHistory, responseMeta);
        }
    }

    private async *handleStepStreaming(message: string, routeResult: any, caseData: any, sessionId: string, context: any, history: any[], meta: any): AsyncIterable<any> {
        let finalIntent: IntentCode = IntentCode.UNKNOWN;
        let responseText = "";

        // Unified logic for different intent categories
        if (routeResult.category === IntentCategory.CONVERSATIONAL) {
            const stream = conversationalHandler.groundedReasoningStream(message, IntentCode.CONVERSATIONAL_INTENT, caseData, sessionId, context.stage, context.revealedFacts, history);
            for await (const chunk of stream) {
                responseText += chunk;
                yield { textChunk: chunk, meta: { ...meta, finalIntent: IntentCode.GREETING } };
            }
            finalIntent = IntentCode.GREETING;
        }
        else if (routeResult.category === IntentCategory.NURSE) {
            const text = await nurseHandler.generateResponse(message, caseData, sessionId, context.stage, history);
            responseText = text;
            yield { fullSentence: text, meta: { ...meta, isNurse: true, finalIntent: IntentCode.NURSE_COMMAND } };
            finalIntent = IntentCode.NURSE_COMMAND;
        }
        else if (routeResult.category === IntentCategory.UNCLEAR) {
            const text = "I'm sorry, I didn't quite catch that. Could you rephrase it?";
            responseText = text;
            yield { fullSentence: text, meta: { ...meta, finalIntent: IntentCode.UNCLEAR_INTENT } };
            finalIntent = IntentCode.UNCLEAR_INTENT;
        }
        else {
            // CLINICAL Path
            const intentResult = await intentClassifier.classify(message);
            finalIntent = intentResult.intent;

            if (finalIntent === IntentCode.CONVERSATIONAL_INTENT || finalIntent === IntentCode.GREETING) {
                const stream = conversationalHandler.groundedReasoningStream(message, IntentCode.CONVERSATIONAL_INTENT, caseData, sessionId, context.stage, context.revealedFacts, history);
                for await (const chunk of stream) {
                    responseText += chunk;
                    yield { textChunk: chunk, meta: { ...meta, finalIntent: IntentCode.GREETING } };
                }
            } else {
                const stream = conversationalHandler.groundedReasoningStream(message, finalIntent, caseData, sessionId, context.stage, context.revealedFacts, history);
                for await (const chunk of stream) {
                    responseText += chunk;
                    yield { textChunk: chunk, meta: { ...meta, finalIntent, groundedReasoning: true } };
                }
                if (finalIntent !== IntentCode.UNKNOWN) {
                    await this.stateManager.updateState(sessionId, finalIntent);
                }
            }
        }

        // Post-process (Transcript)
        await this.stateManager.addMessageToTranscript(sessionId, 'user', message);
        await this.stateManager.addMessageToTranscript(sessionId, 'patient', responseText);
    }

    private async handleStepSync(message: string, routeResult: any, caseData: any, sessionId: string, context: any, history: any[], meta: any): Promise<SimulationResponse> {
        let responseText = "";
        let finalIntent: IntentCode = IntentCode.UNKNOWN;

        // Re-implement the original process logic here (restoring from previous view)
        if (routeResult.category === IntentCategory.CONVERSATIONAL) {
            responseText = await conversationalHandler.generateResponse(message, caseData, sessionId, context.stage, context.revealedFacts, history);
            finalIntent = IntentCode.GREETING;
        } else if (routeResult.category === IntentCategory.NURSE) {
            responseText = await nurseHandler.generateResponse(message, caseData, sessionId, context.stage, history);
            finalIntent = IntentCode.NURSE_COMMAND;
            meta.isNurse = true;
        } else if (routeResult.category === IntentCategory.UNCLEAR) {
            responseText = "I'm sorry, I didn't quite catch that. Could you rephrase it?";
            finalIntent = IntentCode.UNCLEAR_INTENT;
        } else {
            const intentResult = await intentClassifier.classify(message);
            finalIntent = intentResult.intent;
            if (finalIntent === IntentCode.CONVERSATIONAL_INTENT || finalIntent === IntentCode.GREETING) {
                responseText = await conversationalHandler.generateResponse(message, caseData, sessionId, context.stage, context.revealedFacts, history);
                finalIntent = IntentCode.GREETING;
            } else {
                responseText = await conversationalHandler.groundedReasoning(message, finalIntent, caseData, sessionId, context.stage, context.revealedFacts, history);
                meta.groundedReasoning = true;
                if (finalIntent !== IntentCode.UNKNOWN) {
                    await this.stateManager.updateState(sessionId, finalIntent);
                }
            }
        }

        await this.stateManager.addMessageToTranscript(sessionId, 'user', message);
        await this.stateManager.addMessageToTranscript(sessionId, 'patient', responseText);

        console.log(`[OUTPUT] "${responseText}" (Intent: ${finalIntent})`);
        console.log(`=== [SIMULATION ENGINE END] ===\n`);

        return { text: responseText, finalIntent, meta };
    }

    async reset(sessionId: string): Promise<void> {
        console.log(`[SimulationEngine] Global Reset for Session: ${sessionId}`);

        // 1. Clear In-Memory Cache (History, State)
        const { sessionCacheService } = await import('../services/sessionCacheService');
        sessionCacheService.invalidate(sessionId);

        // 2. Clear Conversational Handler (ChatSession)
        const { conversationalHandler } = await import('../services/conversationalHandler');
        conversationalHandler.clearSession(sessionId);

        console.log(`[SimulationEngine] Session ${sessionId} is now clean.`);
    }
}

export const simulationEngine = new SimulationEngine();
