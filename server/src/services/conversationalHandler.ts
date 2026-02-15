import { ChatSession } from '@google-cloud/vertexai';
import { OsceCaseV2 } from '../schemas/caseSchema';
import { vertexService } from './vertexService';
import { FactRetriever } from '../engine/core/FactRetriever';
import { IntentResult, IntentCode } from '../types/intents';
import { intentClassifier } from './intentClassifier';
import { intentRouter, IntentCategory } from './intentRouter';

interface SessionEntry {
    session: ChatSession;
    lastUsed: Date;
}

export class ConversationalHandler {
    private sessions: Map<string, SessionEntry> = new Map();
    private factRetriever = new FactRetriever();
    private readonly MAX_SESSIONS = 500;
    private readonly SESSION_TTL_MS = 3600000; // 1 hour
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Start cleanup daemon
        this.cleanupInterval = setInterval(() => {
            this.evictStale();
        }, 300000); // Every 5 minutes

        console.log('[ConversationalHandler] Initialized with TTL=1h, Max Sessions=500');
    }

    /**
     * MAIN ENTRY POINT
     * Handles the "Deterministic Fact -> Probabilistic Phrasing" flow.
     */
    /**
     * MAIN ENTRY POINT
     */
    async generateResponse(
        input: string,
        caseData: OsceCaseV2,
        sessionId: string = 'default',
        stage: string = 'History',
        revealedFacts: string[] = [],
        history: any[] = []
    ): Promise<string> {
        try {
            return await this.processCommunication(input, caseData, sessionId, stage, revealedFacts, history);
        } catch (error) {
            console.error(`[ConversationalHandler] generateResponse Error:`, error);
            return "I'm sorry, I'm feeling a bit overwhelmed. Could you say that again?";
        }
    }

    /**
     * GROUNDED REASONING (Streaming)
     * Returns an AsyncIterable of text chunks for the persona
     */
    async *groundedReasoningStream(
        input: string,
        intent: IntentCode,
        caseData: OsceCaseV2,
        sessionId: string,
        stage: string,
        revealedFacts: string[],
        history: any[] = []
    ): AsyncIterable<string> {
        try {
            const chatSession = await this.getOrCreateSession(sessionId, caseData, stage, revealedFacts, history);
            const result = await chatSession.sendMessageStream(input);

            for await (const chunk of result.stream) {
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
            }
        } catch (error: any) {
            console.error(`[ConversationalHandler] Grounded Reasoning Stream Error:`, error.message);
            // Fallback to stateless streaming
            yield* vertexService.generateGroundedResponseStream(input, history, caseData, stage);
        }
    }

    /**
     * GROUNDED REASONING (Synchronous)
     * Main entry point for the standard simulation flow
     */
    async groundedReasoning(
        input: string,
        intent: IntentCode,
        caseData: OsceCaseV2,
        sessionId: string,
        stage: string,
        revealedFacts: string[],
        history: any[] = []
    ): Promise<string> {
        try {
            const chatSession = await this.getOrCreateSession(sessionId, caseData, stage, revealedFacts, history);
            const result = await chatSession.sendMessage(input);
            const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (response) return response;
            return this.generateFallbackResponse(intent, caseData);
        } catch (error: any) {
            console.error(`[ConversationalHandler] Grounded Reasoning Error:`, error.message);
            try {
                return await vertexService.generateGroundedResponse(input, history, caseData, stage);
            } catch (e) {
                return this.generateFallbackResponse(intent, caseData);
            }
        }
    }

    /**
     * Generate intelligent fallback when AI fails
     */
    private generateFallbackResponse(intent: IntentCode, caseData: OsceCaseV2): string {
        // Use FactRetriever as last resort
        const fact = this.factRetriever.retrieve(intent, caseData);
        if (fact.found) {
            return fact.fact;
        }
        return "I'm feeling a bit overwhelmed. Could you rephrase that?";
    }

    /**
     * LEGACY: phraseFact (deprecated - keeping for backwards compatibility)
     */
    async phraseFact(
        fact: string,
        input: string,
        caseData: OsceCaseV2,
        sessionId: string,
        stage: string,
        revealedFacts: string[]
    ): Promise<string> {
        try {
            const chatSession = await this.getOrCreateSession(sessionId, caseData, stage, revealedFacts);

            const prompt = `
            [USER QUESTION]: "${input}"
            [MEDICAL FACT]: "${fact}"
            
            INSTRUCTION: Respond to the student as the patient. 
            You MUST use the [MEDICAL FACT] provided above. 
            DO NOT invent or guess any other medical information.
            Maintain your persona (tone, emotions, style).
            
            RESPOND:
            `;

            const result = await chatSession.sendMessage(prompt);
            return result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fact;
        } catch (error: any) {
            console.warn(`[ConversationalHandler] phraseFact SDK Error:`, error.message);
            return fact; // FINAL FALLBACK: The raw medical fact
        }
    }

    /**
     * CLINICAL INTENT HANDLER
     */
    async generateClinicalResponse(
        input: string,
        caseData: OsceCaseV2,
        sessionId: string = 'default',
        stage: string = 'History',
        revealedFacts: string[] = []
    ): Promise<string> {
        try {
            const intentResult = await intentClassifier.classify(input);
            const intent = intentResult.intent;

            let factText = "";
            if (intent && intent !== IntentCode.UNKNOWN && intent !== IntentCode.CLINICAL_INTENT && intent !== IntentCode.SOFT_CLINICAL_INTENT && intent !== IntentCode.UNCLEAR_INTENT) {
                const fact = this.factRetriever.retrieve(intent, caseData);
                factText = fact.found ? fact.fact : "I'm not sure about that.";
            } else {
                factText = caseData.truth.history.chief_complaint || "I have some symptoms I'm worried about.";
            }

            return await this.phraseFact(factText, input, caseData, sessionId, stage, revealedFacts);
        } catch (error) {
            console.error(`[ConversationalHandler] generateClinicalResponse Error:`, error);
            return "I'm sorry, I'm finding it hard to focus. What was that?";
        }
    }

    /**
     * COMMUNICATION INTENT HANDLER
     */
    async processCommunication(
        input: string,
        caseData: OsceCaseV2,
        sessionId: string,
        stage: string,
        revealedFacts: string[],
        history: any[] = []
    ): Promise<string> {
        // TRUST THE AI (Grounded Reasoning)
        // We validated that the ContextBuilder works, so let's use it for social interactions too.
        // This avoids the "Robotic Regex" problem (e.g. failing on "good moring" or reading "High premorbid IQ").

        // Use IntentCode.CONVERSATIONAL_INTENT as the driving intent
        return this.groundedReasoning(
            input,
            IntentCode.CONVERSATIONAL_INTENT,
            caseData,
            sessionId,
            stage,
            revealedFacts,
            history
        );
    }

    private async getOrCreateSession(sessionId: string, caseData: OsceCaseV2, stage: string, revealedFacts: string[], history: any[] = []): Promise<ChatSession> {
        // Update access time if exists
        const existing = this.sessions.get(sessionId);
        if (existing) {
            existing.lastUsed = new Date();
            return existing.session;
        }

        // LRU eviction if at capacity
        if (this.sessions.size >= this.MAX_SESSIONS) {
            this.evictOldest();
        }

        // Create new session with history preservation
        console.log(`[ConversationalHandler] Creating new Gemini Chat Session for: ${sessionId} (History size: ${history.length})`);
        const newSession = await vertexService.createChatSession(caseData, stage, history);

        this.sessions.set(sessionId, {
            session: newSession,
            lastUsed: new Date()
        });

        return newSession;
    }

    private evictStale() {
        const now = new Date();
        let evictedCount = 0;

        for (const [id, entry] of this.sessions.entries()) {
            if (now.getTime() - entry.lastUsed.getTime() > this.SESSION_TTL_MS) {
                this.sessions.delete(id);
                evictedCount++;
            }
        }

        if (evictedCount > 0) {
            console.log(`[ConvHandler] Evicted ${evictedCount} stale sessions. Active: ${this.sessions.size}`);
        }
    }

    private evictOldest() {
        let oldestId: string | null = null;
        let oldestTime = new Date();

        for (const [id, entry] of this.sessions.entries()) {
            if (entry.lastUsed < oldestTime) {
                oldestTime = entry.lastUsed;
                oldestId = id;
            }
        }

        if (oldestId) {
            this.sessions.delete(oldestId);
            console.log(`[ConvHandler] LRU evicted session: ${oldestId}`);
        }
    }

    clearSession(sessionId: string) {
        if (this.sessions.has(sessionId)) {
            this.sessions.delete(sessionId);
            console.log(`[ConvHandler] Cleared session: ${sessionId}`);
        }
    }

    // Cleanup on shutdown
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.sessions.clear();
        console.log('[ConvHandler] Destroyed - all sessions cleared');
    }
}

export const conversationalHandler = new ConversationalHandler();
