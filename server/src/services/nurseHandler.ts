import { ChatSession } from '@google-cloud/vertexai';
import { OsceCaseV2 } from '../schemas/caseSchema';
import { vertexService } from './vertexService';
import { IntentCode } from '../types/intents';

interface SessionEntry {
    session: ChatSession;
    lastUsed: Date;
}

export class NurseHandler {
    private sessions: Map<string, SessionEntry> = new Map();
    private readonly MAX_SESSIONS = 100;
    private readonly SESSION_TTL_MS = 3600000;

    /**
     * Constant Nurse Persona
     */
    private readonly NURSE_SYSTEM_PROMPT = `
        You are Nurse Sarah, a professional and helpful clinical nurse assisting a medical student in an OSCE simulation.
        Your tone is calm, supportive, and efficient.
        
        YOUR ROLE:
        1. When the student gives you an order (e.g., "Nurse, please take a blood sample"), acknowledge it professionally and confirm you are performing the action.
        2. You MUST use the provided MCP tools if you are performing a clinical action:
           - Use "nurse_measure_vitals" if asked to check vitals.
           - Use "nurse_perform_action" with action="take_blood" if asked for bloods.
           - Use other "nurse_perform_action" names as appropriate.
        3. You do NOT diagnose the patient. You follow the "doctor's" (student's) orders.
        4. If the student asks for your opinion, you can point out clinical observations (e.g., "The patient looks quite pale, doctor") but let them make the decisions.
        
        VOICE: You have a constant, professional nursing voice.
    `;

    async generateResponse(
        input: string,
        caseData: OsceCaseV2,
        sessionId: string,
        stage: string,
        history: any[] = []
    ): Promise<string> {
        try {
            const chatSession = await this.getOrCreateSession(sessionId, caseData, stage, history);
            const result = await chatSession.sendMessage(input);
            return result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Yes, doctor. I'm on it.";
        } catch (error: any) {
            console.error(`[NurseHandler] Error:`, error.message);
            return "Yes, doctor. I'll take care of that right away.";
        }
    }

    private async getOrCreateSession(sessionId: string, caseData: OsceCaseV2, stage: string, history: any[] = []): Promise<ChatSession> {
        const existing = this.sessions.get(sessionId);
        if (existing) {
            existing.lastUsed = new Date();
            return existing.session;
        }

        // Create new session with Nurse Persona
        const newSession = await vertexService.createChatSession(caseData, stage, history, this.NURSE_SYSTEM_PROMPT);

        this.sessions.set(sessionId, {
            session: newSession,
            lastUsed: new Date()
        });

        return newSession;
    }

    clearSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }
}

export const nurseHandler = new NurseHandler();
