import { TTSService, ttsService } from '../services/ttsService';

/**
 * TTS Cache for Common Medical Phrases
 * Eliminates latency for frequently-used patient responses
 */
export class TTSCache {
    private cache = new Map<string, string>(); // key: "text:voiceId", value: audioDataUrl
    private maxCacheSize = 100; // Increased from 50 for more cache hits

    // Top 20 common medical phrases that patients frequently say
    private readonly COMMON_PHRASES = [
        "Hello",
        "Hi doctor",
        "Good morning",
        "It hurts",
        "I don't know",
        "Yes",
        "No",
        "Maybe",
        "I'm not sure",
        "Can you repeat that?",
        "Since yesterday",
        "Since this morning",
        "A few days ago",
        "About a week",
        "It comes and goes",
        "It's constant",
        "Right here",
        "In my chest",
        "I feel dizzy",
        "I can't breathe well"
    ];

    constructor() {
        console.log('[TTSCache] Initialized with', this.COMMON_PHRASES.length, 'common phrases');
    }

    /**
     * Pre-warm the cache with common phrases for a specific voice
     */
    async warmCache(voiceId: string): Promise<void> {
        console.log(`[TTSCache] Pre-warming cache for voice: ${voiceId}`);
        const startTime = Date.now();

        const promises = this.COMMON_PHRASES.map(async (phrase) => {
            const cacheKey = this.getCacheKey(phrase, voiceId);

            if (!this.cache.has(cacheKey)) {
                try {
                    const audioDataUrl = await ttsService.synthesize(phrase, voiceId);
                    this.cache.set(cacheKey, audioDataUrl);
                } catch (error: any) {
                    console.error(`[TTSCache] Failed to cache "${phrase}":`, error.message);
                }
            }
        });

        await Promise.all(promises);
        console.log(`[TTSCache] Pre-warming complete in ${Date.now() - startTime}ms. Cache size: ${this.cache.size}`);
    }

    /**
     * Get cached audio or synthesize if not found
     */
    async get(text: string, voiceId: string): Promise<{ audioDataUrl: string; cacheHit: boolean }> {
        const cacheKey = this.getCacheKey(text, voiceId);

        // Check cache
        if (this.cache.has(cacheKey)) {
            console.log(`[TTSCache] CACHE HIT: "${text.substring(0, 30)}..."`);
            return {
                audioDataUrl: this.cache.get(cacheKey)!,
                cacheHit: true
            };
        }

        // Cache miss - synthesize
        console.log(`[TTSCache] Cache miss: "${text.substring(0, 30)}..."`);
        const audioDataUrl = await ttsService.synthesize(text, voiceId);

        // Store in cache if under size limit
        if (this.cache.size < this.maxSize) {
            this.cache.set(cacheKey, audioDataUrl);
        }

        return {
            audioDataUrl,
            cacheHit: false
        };
    }

    /**
     * Manually set a cache entry (for auto-population after synthesis)
     */
    async set(text: string, voiceId: string, audioDataUrl: string): Promise<void> {
        const cacheKey = this.getCacheKey(text, voiceId);

        if (this.cache.size < this.maxCacheSize) {
            this.cache.set(cacheKey, audioDataUrl);
            console.log(`[TTSCache] Populated cache: "${text.substring(0, 30)}..." (${this.cache.size}/${this.maxCacheSize})`);
        } else {
            console.log(`[TTSCache] Cache full, skipping: "${text.substring(0, 30)}..."`);
        }
    }

    /**
     * Clear cache for a specific voice or all
     */
    clear(voiceId?: string): void {
        if (voiceId) {
            // Clear only entries for this voice
            for (const [key] of this.cache) {
                if (key.endsWith(`:${voiceId}`)) {
                    this.cache.delete(key);
                }
            }
            console.log(`[TTSCache] Cleared cache for voice: ${voiceId}`);
        } else {
            this.cache.clear();
            console.log('[TTSCache] Cleared entire cache');
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; maxSize: number; phrases: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            phrases: this.COMMON_PHRASES.length
        };
    }

    private getCacheKey(text: string, voiceId: string): string {
        // Use exact text (only trim whitespace) for precise cache matching
        // Lowercase normalization was causing audio mismatches
        const normalized = text.trim();
        return `${normalized}:${voiceId}`;
    }
}

// Singleton instance
export const ttsCache = new TTSCache();
