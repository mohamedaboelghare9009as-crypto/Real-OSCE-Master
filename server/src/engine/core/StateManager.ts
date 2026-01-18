
import { Session } from '../../models/Session';
import { SessionState } from '../../schemas/sessionSchema';
import { IntentCode } from '../../types/intents';
import { EngineContext } from '../types';

export class StateManager {

    async loadSession(userId: string, caseId: string): Promise<EngineContext | null> {
        try {
            // Find incomplete session
            const session = await Session.findOne({ userId, caseId, isCompleted: false });
            if (!session) return null;

            return {
                sessionId: (session as any)._id.toString(),
                caseId: session.caseId,
                stage: session.currentStage,
                userId: session.userId,
                revealedFacts: session.revealedFacts || [],
                history: (session as any).history || []
            };
        } catch (error) {
            console.error("[StateManager] Failed to load session", error);
            return null;
        }
    }

    async createSession(userId: string, caseId: string): Promise<EngineContext> {
        const session = await Session.create({
            userId,
            caseId,
            currentStage: 'History',
            revealedFacts: [],
            history: [],
            startTime: new Date()
        });

        return {
            sessionId: (session as any)._id.toString(),
            caseId,
            stage: 'History',
            userId,
            revealedFacts: [],
            history: []
        };
    }

    async addMessage(sessionId: string, role: 'user' | 'model', content: string): Promise<void> {
        await Session.findByIdAndUpdate(sessionId, {
            $push: {
                history: {
                    role,
                    content,
                    timestamp: new Date()
                }
            },
            lastInteraction: new Date()
        });
    }

    async updateState(sessionId: string, intent: IntentCode): Promise<void> {
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) return;

        await Session.findByIdAndUpdate(sessionId, {
            $addToSet: { revealedFacts: intent },
            lastInteraction: new Date()
        });
    }

    isFactRevealed(intent: IntentCode, context: EngineContext): boolean {
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) return false;
        return context.revealedFacts.includes(intent);
    }
}
