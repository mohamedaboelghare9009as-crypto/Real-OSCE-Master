import { OsceCase, OsceCaseV2 } from '../schemas/caseSchema';

/**
 * CaseCacheService
 * 
 * Provides in-memory caching for case data during active sessions.
 * This prevents redundant database calls for the same case data during a simulation.
 * 
 * Features:
 * - Session-based caching (cache persists for duration of session)
 * - Automatic cache invalidation
 * - Memory-efficient storage
 * - TTL (Time To Live) support for cache entries
 */

interface CacheEntry {
    case: OsceCase | OsceCaseV2;
    cachedAt: Date;
    sessionId?: string;
    lastAccessed: Date;
}

export class CaseCacheService {
    private cache: Map<string, CacheEntry>;
    private readonly DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour default TTL
    private readonly CLEANUP_INTERVAL_MS = 1000 * 60 * 5; // Cleanup every 5 minutes
    private cleanupTimer?: NodeJS.Timeout;

    constructor() {
        this.cache = new Map();
        this.startCleanupTimer();
    }

    /**
     * Get case from cache
     * @param caseId - The case ID or MongoDB ObjectId
     * @param sessionId - Optional session ID for session-specific caching
     */
    get(caseId: string, sessionId?: string): OsceCase | OsceCaseV2 | null {
        const cacheKey = this.getCacheKey(caseId, sessionId);
        const entry = this.cache.get(cacheKey);

        if (!entry) {
            console.log(`[CaseCache] MISS: ${cacheKey}`);
            return null;
        }

        // Check if entry has expired
        if (this.isExpired(entry)) {
            console.log(`[CaseCache] EXPIRED: ${cacheKey}`);
            this.cache.delete(cacheKey);
            return null;
        }

        // Update last accessed time
        entry.lastAccessed = new Date();
        console.log(`[CaseCache] HIT: ${cacheKey}`);

        return entry.case;
    }

    /**
     * Set case in cache
     * @param caseId - The case ID or MongoDB ObjectId
     * @param caseData - The case data to cache
     * @param sessionId - Optional session ID for session-specific caching
     */
    set(caseId: string, caseData: OsceCase | OsceCaseV2, sessionId?: string): void {
        const cacheKey = this.getCacheKey(caseId, sessionId);

        const entry: CacheEntry = {
            case: caseData,
            cachedAt: new Date(),
            sessionId: sessionId,
            lastAccessed: new Date()
        };

        this.cache.set(cacheKey, entry);
        console.log(`[CaseCache] SET: ${cacheKey} (Total cached: ${this.cache.size})`);
    }

    /**
     * Check if case exists in cache
     */
    has(caseId: string, sessionId?: string): boolean {
        const cacheKey = this.getCacheKey(caseId, sessionId);
        const entry = this.cache.get(cacheKey);

        if (!entry) return false;
        if (this.isExpired(entry)) {
            this.cache.delete(cacheKey);
            return false;
        }

        return true;
    }

    /**
     * Invalidate (remove) a specific case from cache
     */
    invalidate(caseId: string, sessionId?: string): void {
        const cacheKey = this.getCacheKey(caseId, sessionId);
        const deleted = this.cache.delete(cacheKey);

        if (deleted) {
            console.log(`[CaseCache] INVALIDATED: ${cacheKey}`);
        }
    }

    /**
     * Invalidate all cases for a specific session
     */
    invalidateSession(sessionId: string): void {
        let count = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.sessionId === sessionId) {
                this.cache.delete(key);
                count++;
            }
        }
        console.log(`[CaseCache] INVALIDATED ${count} entries for session: ${sessionId}`);
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`[CaseCache] CLEARED: Removed ${size} entries`);
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            totalEntries: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                caseId: this.extractCaseId(entry.case),
                sessionId: entry.sessionId,
                cachedAt: entry.cachedAt,
                lastAccessed: entry.lastAccessed,
                age: Date.now() - entry.cachedAt.getTime()
            }))
        };
    }

    /**
     * Generate cache key
     */
    private getCacheKey(caseId: string, sessionId?: string): string {
        return sessionId ? `${caseId}:${sessionId}` : caseId;
    }

    /**
     * Check if cache entry has expired
     */
    private isExpired(entry: CacheEntry): boolean {
        const age = Date.now() - entry.cachedAt.getTime();
        return age > this.DEFAULT_TTL_MS;
    }

    /**
     * Extract case ID from case data
     */
    private extractCaseId(caseData: OsceCase | OsceCaseV2): string {
        if ('case_metadata' in caseData && caseData.case_metadata) {
            return (caseData.case_metadata as any).case_id || 'unknown';
        }
        if ('metadata' in caseData && caseData.metadata) {
            return caseData.metadata.id || 'unknown';
        }
        return 'unknown';
    }

    /**
     * Start automatic cleanup timer to remove expired entries
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpired();
        }, this.CLEANUP_INTERVAL_MS);
    }

    /**
     * Clean up expired entries
     */
    private cleanupExpired(): void {
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`[CaseCache] CLEANUP: Removed ${removed} expired entries`);
        }
    }

    /**
     * Stop cleanup timer (for graceful shutdown)
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.clear();
    }
}

// Export singleton instance
export const caseCacheService = new CaseCacheService();
