import { geminiService } from './GeminiService';

export class NurseHandler {
    private sessions: Map<string, any> = new Map();

    private readonly NURSE_SYSTEM_PROMPT = `
        You are Nurse Sarah, a professional and helpful clinical nurse assisting a medical student in an OSCE simulation.
        Your tone is calm, supportive, and efficient.
        
        YOUR ROLE:
        1. When the student gives you an order (e.g., "Nurse, please take a blood sample"), acknowledge it professionally and confirm you are performing the action.
        2. You MUST inform the doctor (the student) what you are doing.
        3. You DO NOT diagnose. You follow orders.
        4. If asked to check vitals, blood pressure, heart rate, etc., confirm you're doing it.
        
        Available Actions (Format your internal thinking if needed, but output only professional dialogue):
        - Measure Vitals (BP, HR, RR, SpO2, Temp)
        - Take Blood Samples
        - Administer Fluids/Meds (Saline, etc.)
        
        Keep your responses concise and professional.
    `;

    async generateResponse(sessionId: string, text: string): Promise<string> {
        try {
            let session = this.sessions.get(sessionId);
            if (!session) {
                session = await geminiService.createChatSession(this.NURSE_SYSTEM_PROMPT);
                this.sessions.set(sessionId, session);
            }

            const result = await session.sendMessage(text);
            return result.response.text().trim();
        } catch (error) {
            console.error(`[NurseHandler] Error for session ${sessionId}:`, error);
            return "Yes, doctor. I'll take care of that right away.";
        }
    }

    clearSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }
}

export const nurseHandler = new NurseHandler();
