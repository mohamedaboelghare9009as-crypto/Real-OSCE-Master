
import { useRef, useCallback, useEffect } from 'react';
import { decode } from '../utils/audioTransport';

// Gemini Live Player Hook
// Handles low-latency playback of native audio chunks
// Support for interruption (barge-in) and gapless queueing.

export const useGeminiLivePlayer = (onPlaybackEnded?: () => void) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const queueRef = useRef<AudioBuffer[]>([]);
    const isPlayingRef = useRef(false);
    const stopPlaybackRef = useRef(false);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Initialize AudioContext on first use
    const initContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
            });
        }
        return audioContextRef.current;
    };

    /**
     * Decode PCM Int16 or standard formats
     */
    const decodeChunk = async (bytes: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
        try {
            // Attempt standard decoding (MP3/WAV/AAC)
            return await ctx.decodeAudioData(bytes.buffer.slice(0) as ArrayBuffer);
        } catch (e) {
            // Fallback: Assume PCM Int16 Mono (Common in Bidi Streams)
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = ctx.createBuffer(1, dataInt16.length, ctx.sampleRate);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }
            return buffer;
        }
    };

    const processQueue = useCallback(async () => {
        if (isPlayingRef.current || queueRef.current.length === 0 || stopPlaybackRef.current) {
            if (queueRef.current.length === 0 && !isPlayingRef.current) {
                onPlaybackEnded?.();
            }
            return;
        }

        isPlayingRef.current = true;
        const ctx = initContext();
        if (ctx.state === 'suspended') await ctx.resume();

        const buffer = queueRef.current.shift();
        if (!buffer) {
            isPlayingRef.current = false;
            onPlaybackEnded?.();
            return;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        activeSourceRef.current = source;

        source.onended = () => {
            activeSourceRef.current = null;
            isPlayingRef.current = false;
            processQueue(); // Play next or trigger end
        };

        source.start(0);
    }, [onPlaybackEnded]);

    const decodingQueueRef = useRef<Promise<void>>(Promise.resolve());

    // Ordering: Buffer for out-of-order chunks
    const nextExpectedIndexRef = useRef(1);
    const pendingChunksRef = useRef<Map<number, string>>(new Map());

    /**
     * Add a chunk to the playback queue IMMEDIATELY (NO ORDERING)
     * SPEED OPTIMIZED: Plays chunks as they arrive for minimum latency
     */
    const addAudioChunk = useCallback((base64Data: string, sentenceIndex?: number) => {
        stopPlaybackRef.current = false;

        // OPTIMIZATION: Always play immediately - no buffering/ordering
        // This eliminates the delay from waiting for sequential chunks
        console.log(`[AudioPlayer] Playing chunk ${sentenceIndex || 'legacy'} immediately`);
        processChunkImmediately(base64Data);
    }, []);

    /**
     * Process chunks in order from the pending buffer
     */
    const processOrderedChunks = useCallback(() => {
        while (pendingChunksRef.current.has(nextExpectedIndexRef.current)) {
            const index = nextExpectedIndexRef.current;
            const data = pendingChunksRef.current.get(index)!;

            processChunkImmediately(data);

            pendingChunksRef.current.delete(index);
            nextExpectedIndexRef.current++;
        }
    }, []);

    /**
     * Process a single chunk immediately (in decode queue)
     */
    const processChunkImmediately = useCallback((base64Data: string) => {
        // Chain this decode operation to the end of the current decoding queue
        decodingQueueRef.current = decodingQueueRef.current.then(async () => {
            // Strip data URL prefix if present
            const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

            try {
                const ctx = initContext();
                const bytes = decode(base64);

                // Decode asynchronously but strictly ordered via the promise chain
                const buffer = await decodeChunk(bytes, ctx);

                if (!stopPlaybackRef.current) {
                    queueRef.current.push(buffer);
                    processQueue();
                }
            } catch (error) {
                console.error("[useGeminiLivePlayer] Decode failed:", error);
            }
        });
    }, [processQueue]);

    /**
     * Kill all audio immediately and reset sentence ordering
     */
    const interruptPlayback = useCallback(() => {
        console.log("[useGeminiLivePlayer] INTERRUPTED - Killing Audio & Resetting Queue");
        stopPlaybackRef.current = true;
        queueRef.current = [];

        // Reset ordering buffer
        pendingChunksRef.current.clear();
        nextExpectedIndexRef.current = 1;

        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop();
            } catch (e) { /* already stopped */ }
            activeSourceRef.current = null;
        }
        isPlayingRef.current = false;
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            interruptPlayback();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [interruptPlayback]);

    return {
        addAudioChunk,
        interruptPlayback
    };
};
