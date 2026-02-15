import { Session } from '../models/Session';
import { SessionState } from '../schemas/sessionSchema';
import { MOCK_CASE_ID } from '../data/mockCase';
import { caseCacheService } from './caseCacheService';
import { sessionCacheService } from './sessionCacheService';

const MOCK_SESSION: SessionState = {
    userId: 'mock-user',
    caseId: MOCK_CASE_ID,
    currentStage: 'History',
    isCompleted: false,
    startTime: new Date(),
    lastInteraction: new Date(),
    completedStages: [],
    actionsTaken: [],
    scoreTotal: 0,
    criticalFlags: [],
    failedStage: false,
    revealedFacts: []
};

export class SessionService {
    private creationLocks: Map<string, Promise<SessionState>> = new Map();

    async getSession(sessionId: string): Promise<SessionState | null> {
        // 1. Level 1 Cache (Memory)
        const cached = sessionCacheService.get(sessionId);
        if (cached) {
            return cached;
        }

        // 2. Level 2 (DB - Source of Truth)
        try {
            const session = await Session.findById(sessionId);
            if (session) {
                const state = session.toObject() as SessionState;
                // Hydrate Cache
                sessionCacheService.set(sessionId, state);
                return state;
            }
        } catch (error) {
            console.warn(`[SessionService] DB Error looking up session ${sessionId}.`);
        }

        return null; // No fallback to "mockSessions" global map, we use cache now.
    }

    async findActiveSession(userId: string, caseId: string): Promise<SessionState | null> {
        // 1. Scan Cache (simulating index)
        // Note: For high concurrency, we'd need a secondary index in cache service.
        // But for this project, iteration is fine.
        /* Helper to access private cache? No, let's just rely on DB for "Finding" if not known ID, 
           OR assume if it's active it was just used. 
           Actually, if we don't check cache, we might miss the latest in-memory state if we haven't written to DB yet.
           So we MUST check cache.
        */

        // Optimization: In a real app with Redis, we'd query Redis. 
        // Here we can't easily query the Map without exposing it. 
        // Let's rely on DB for *discovery* of interrupted sessions (restart), 
        // but for *continuation*, the client usually sends `sessionId`.
        // If the client sends `userId/caseId` only (start new?), we check DB.

        try {
            const session = await Session.findOne({ userId, caseId, isCompleted: false }).sort({ startTime: -1 });
            if (session) {
                const state = session.toObject() as SessionState;
                const id = (session as any)._id.toString();

                // If already in cache (and newer?), use cache. 
                const cached = sessionCacheService.get(id);
                if (cached) return cached;

                // Else hydrate
                sessionCacheService.set(id, state);
                return state;
            }
        } catch (error) {
            console.warn(`[SessionService] DB Error looking up active session.`);
        }

        if (caseId === MOCK_CASE_ID) return { ...MOCK_SESSION, userId, caseId };

        return null;
    }

    /**
     * Get existing session or create new one (with race condition protection)
     */
    async getOrCreateSession(userId: string, caseId: string): Promise<SessionState> {
        const lockKey = `${userId}:${caseId}`;

        // Check for existing session
        const existing = await this.findActiveSession(userId, caseId);
        if (existing) {
            console.log(`[SessionService] Found existing session for ${lockKey}`);
            return existing;
        }

        // Check if creation is in progress
        if (this.creationLocks.has(lockKey)) {
            console.log(`[SessionService] Waiting for in-progress creation: ${lockKey}`);
            return this.creationLocks.get(lockKey)!;
        }

        // Create with lock
        const creationPromise = this.createSession(userId, caseId);
        this.creationLocks.set(lockKey, creationPromise);

        try {
            const session = await creationPromise;
            return session;
        } finally {
            this.creationLocks.delete(lockKey);
        }
    }

    public async createSession(userId: string, caseId: string): Promise<SessionState> {
        // Always create in DB to get an ID and "Start" persistence?
        // User says: "Session start (once): Fetch from MongoDB... Persist results back...".
        // It implies we read the CASE from MongoDB.
        // Does it imply we write the SESSION to MongoDB at start?
        // "Session start (once) -> Case metadata...". 
        // "Database collections... sessions (Active / completed)".
        // So yes, we should create the session record in DB.

        try {
            const session = await Session.create({
                userId,
                caseId,
                currentStage: 'History',
                completedStages: [],
                actionsTaken: [],
                scoreTotal: 0,
                criticalFlags: [],
                isCompleted: false,
                startTime: new Date(),
                lastInteraction: new Date(),
                revealedFacts: []
            });
            const state = session.toObject() as SessionState;
            const id = (session as any)._id.toString();

            // Hydrate Cache
            sessionCacheService.set(id, state);
            return state;
        } catch (error) {
            console.warn(`[SessionService] DB Error creating session. Creating mock/offline session.`);

            const newMock: SessionState = {
                ...MOCK_SESSION,
                userId,
                caseId,
                startTime: new Date(),
                lastInteraction: new Date()
            };

            const fakeId = `mock-session-${Date.now()}`;
            // We need to carry the ID purely in memory
            // SessionState types doesn't strictly enforce _id, but we need it for cache key.
            // We'll treat fakeId as the key.
            sessionCacheService.set(fakeId, newMock);

            // Return state with a "fake" ID property if needed by controller
            return { ...newMock, _id: fakeId } as any;
        }
    }

    async updateSession(sessionId: string, updates: Partial<SessionState>): Promise<void> {
        // 1. Update Session Cache (Memory - Source of "Current" Truth)
        sessionCacheService.update(sessionId, updates);

        // 2. Persist ONLY if critical (Session End)
        // User Rule: "Each student message: No" -> No DB write.
        // User Rule: "Session end: Yes" -> DB write.

        if (updates.isCompleted) {
            await this.persistSession(sessionId);

            // Invalidate Caches if needed?
            // "Level 1 Cache ... Lifetime: Session duration".
            // If completed, we might keep it for a bit for "Score View", then cleanup.
            // sessionCacheService handles TTL.
        }
    }

    // Explicitly flush to DB
    async persistSession(sessionId: string): Promise<void> {
        const cached = sessionCacheService.get(sessionId);
        if (!cached) return; // Can't persist what we don't have

        try {
            // We save the WHOLE state from memory to DB
            // Excluding transcript if it's huge? "Transcript" in "Session end (write)".
            // So we save everything.
            await Session.findByIdAndUpdate(sessionId, cached);
            console.log(`[SessionService] Persisted session ${sessionId} to DB.`);
        } catch (e) {
            console.error(`[SessionService] Failed to persist session ${sessionId}:`, e);
        }
    }
}

export const sessionService = new SessionService();
