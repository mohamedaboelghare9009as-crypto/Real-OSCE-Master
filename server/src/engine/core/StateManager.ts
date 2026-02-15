import { Session } from '../../models/Session';
import { IntentCode } from '../../types/intents';
import { EngineContext } from '../types';
import { sessionCacheService } from '../../services/sessionCacheService';
import { SessionState } from '../../schemas/sessionSchema';

export class StateManager {

    async loadSession(userId: string, caseId: string, sessionId?: string): Promise<EngineContext | null> {
        // 1. Try Cache First
        if (sessionId) {
            const cached = sessionCacheService.get(sessionId);
            if (cached) {
                console.log(`[StateManager] Cache HIT for session: ${sessionId}`);
                return this.mapToContext(cached, sessionId);
            }
        }

        // 2. Try DB Fallback (Only if not in cache)
        try {
            console.log(`[StateManager] Cache MISS, checking DB for User: ${userId}, Case: ${caseId}`);

            // Validate sessionId if provided
            let query: any;
            if (sessionId) {
                if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
                    query = { _id: sessionId };
                } else {
                    console.log(`[StateManager] Custom sessionId: ${sessionId}, skipping DB _id lookup`);
                    // Skip DB lookup for non-ObjectIDs, will try fallback below
                }
            }

            // Fallback: search for active session for this user/case
            if (!query) {
                query = { userId, caseId, isCompleted: false };
            }

            const session = await Session.findOne(query).sort({ lastInteraction: -1 });

            if (!session) return null;

            const state = session.toObject() as SessionState;
            const id = (session as any)._id.toString();

            // 3. Hydrate Cache using provided sessionId if available, otherwise MongoDB ID
            const cacheKey = sessionId || id;
            sessionCacheService.set(cacheKey, state);
            return this.mapToContext(state, cacheKey);
        } catch (error) {
            console.error("[StateManager] Failed to load session from DB", error);
            return null;
        }
    }

    async createSession(userId: string, caseId: string, clientSessionId?: string): Promise<EngineContext> {
        try {
            const session = await Session.create({
                userId,
                caseId,
                currentStage: 'History',
                revealedFacts: [],
                startTime: new Date(),
                isCompleted: false,
                completedStages: [],
                actionsTaken: [],
                scoreTotal: 0,
                criticalFlags: [],
                failedStage: false,
                lastInteraction: new Date()
            });

            const state = session.toObject() as SessionState;
            const id = (session as any)._id.toString();

            // Register in Cache using clientSessionId if provided
            const cacheKey = clientSessionId || id;
            sessionCacheService.set(cacheKey, state);
            return this.mapToContext(state, cacheKey);
        } catch (error) {
            console.error("[StateManager] DB Error creating session. Using In-Memory Fallback.");

            const fakeId = clientSessionId || `mock-session-${Date.now()}`;
            const state: SessionState = {
                userId,
                caseId,
                currentStage: 'History',
                revealedFacts: [],
                startTime: new Date(),
                isCompleted: false,
                completedStages: [],
                actionsTaken: [],
                scoreTotal: 0,
                criticalFlags: [],
                failedStage: false,
                lastInteraction: new Date(),
                transcript: []
            };

            sessionCacheService.set(fakeId, state);
            return this.mapToContext(state, fakeId);
        }
    }

    async addMessageToTranscript(sessionId: string, role: 'user' | 'patient', text: string): Promise<void> {
        const state = sessionCacheService.get(sessionId);
        if (state) {
            const transcript = state.transcript || [];
            transcript.push({
                role,
                text,
                timestamp: new Date()
            });

            sessionCacheService.update(sessionId, { transcript });
            console.log(`[StateManager] Added to Cache Transcript: [${role}] ${text.substring(0, 20)}...`);
        }
    }

    async updateState(sessionId: string, intent: IntentCode): Promise<void> {
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) return;

        // 1. Update In-Memory Cache (FAST)
        const state = sessionCacheService.get(sessionId);
        if (state) {
            const revealedFacts = state.revealedFacts || [];
            if (!revealedFacts.includes(intent)) {
                revealedFacts.push(intent);
                sessionCacheService.update(sessionId, { revealedFacts });
                console.log(`[StateManager] Updated Cache: Revealed ${intent}`);
            }
        }

        // 2. Logging
        console.log(`[StateManager] Intent ${intent} recorded in-memory for session ${sessionId}`);
    }

    isFactRevealed(intent: IntentCode, context: EngineContext): boolean {
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) return false;
        return context.revealedFacts.includes(intent);
    }

    private mapToContext(state: SessionState, idOverride?: string): EngineContext {
        // SessionState doesn't technically have _id in interface, so we need to know the ID from caller or cache key.
        // But the cache getByKey returns the object. 
        // We usually expect ID to be passed around.
        // For now, let's assume if it came from DB it has it.
        const id = idOverride || (state as any)._id?.toString() || (state as any).id || "unknown-session";

        return {
            sessionId: id,
            caseId: state.caseId,
            stage: state.currentStage,
            userId: state.userId,
            revealedFacts: state.revealedFacts || [],
            transcript: state.transcript || []
        };
    }
}
