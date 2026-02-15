import { SessionState } from '../schemas/sessionSchema';

interface SessionCacheEntry {
    state: SessionState;
    cachedAt: Date;
    lastAccessed: Date;
    version: number;              // Optimistic locking version
    isDirty: boolean;             // Needs DB sync
    lastSyncTime: Date;           // Last DB write timestamp
}

export class SessionCacheService {
    private cache: Map<string, SessionCacheEntry>;
    private readonly DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour
    private readonly CLEANUP_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes
    private readonly AUTO_SAVE_INTERVAL_MS = 1000 * 60; // 1 minute
    private cleanupTimer?: NodeJS.Timeout;
    private autoSaveTimer?: NodeJS.Timeout;

    constructor() {
        this.cache = new Map();
        this.startCleanupTimer();
        this.startAutoSaveTimer();
        console.log('[SessionCacheService] Initialized with auto-save every 60s');
    }

    get(sessionId: string): SessionState | null {
        const entry = this.cache.get(sessionId);
        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.cache.delete(sessionId);
            return null;
        }

        entry.lastAccessed = new Date();
        return entry.state;
    }

    set(sessionId: string, state: SessionState): void {
        this.cache.set(sessionId, {
            state,
            cachedAt: new Date(),
            lastAccessed: new Date(),
            version: 1,
            isDirty: false,
            lastSyncTime: new Date()
        });
        console.log(`[SessionCache] SET: ${sessionId} (Total: ${this.cache.size})`);
    }

    invalidate(sessionId: string): void {
        this.cache.delete(sessionId);
        console.log(`[SessionCache] INVALIDATED: ${sessionId}`);
    }

    // Update specific fields in the cached state
    update(sessionId: string, updates: Partial<SessionState>): void {
        const entry = this.cache.get(sessionId);
        if (entry) {
            entry.state = { ...entry.state, ...updates };
            entry.lastAccessed = new Date();
            entry.isDirty = true;          // Mark for background sync
            entry.version++;                // Increment version
            console.log(`[SessionCache] UPDATE: ${sessionId} (v${entry.version}, dirty=${entry.isDirty})`);
        }
    }

    markClean(sessionId: string): void {
        const entry = this.cache.get(sessionId);
        if (entry) {
            entry.isDirty = false;
            entry.lastSyncTime = new Date();
        }
    }

    private isExpired(entry: SessionCacheEntry): boolean {
        const age = Date.now() - entry.cachedAt.getTime();
        return age > this.DEFAULT_TTL_MS;
    }

    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            const now = Date.now();
            let evicted = 0;
            for (const [key, entry] of this.cache.entries()) {
                if (now - entry.cachedAt.getTime() > this.DEFAULT_TTL_MS) {
                    this.cache.delete(key);
                    evicted++;
                }
            }
            if (evicted > 0) {
                console.log(`[SessionCache] Evicted ${evicted} expired sessions`);
            }
        }, this.CLEANUP_INTERVAL_MS);
    }

    private startAutoSaveTimer(): void {
        this.autoSaveTimer = setInterval(async () => {
            await this.backgroundSync();
        }, this.AUTO_SAVE_INTERVAL_MS);
    }

    private async backgroundSync(): Promise<void> {
        const { Session } = await import('../models/Session');
        let syncCount = 0;

        for (const [sessionId, entry] of this.cache.entries()) {
            // Only sync dirty sessions with valid ObjectIDs that aren't completed
            if (entry.isDirty && !entry.state.isCompleted && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
                try {
                    await Session.findByIdAndUpdate(sessionId, {
                        ...entry.state,
                        __version: entry.version
                    });
                    this.markClean(sessionId);
                    syncCount++;
                } catch (e: any) {
                    console.error(`[SessionCache] Auto-save failed for ${sessionId}:`, e.message);
                }
            } else if (entry.isDirty && !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
                // If it's a mock session, we just mark it clean as it only lives in memory
                this.markClean(sessionId);
            }
        }

        if (syncCount > 0) {
            console.log(`[SessionCache] ✓ Auto-saved ${syncCount} dirty sessions`);
        }
    }

    destroy(): void {
        if (this.cleanupTimer) clearInterval(this.cleanupTimer);
        if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
        this.cache.clear();
        console.log('[SessionCache] Destroyed');
    }
}

export const sessionCacheService = new SessionCacheService();
