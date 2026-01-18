
import { useRef, useCallback, useEffect, useState } from 'react';
import { decode, decodeAudioData, createBlob } from '../utils/audioTransport';

// Voice Transport Hook
// PURE INFRASTRUCTURE. No business logic.
// Handles:
// 1. PCM Audio Stream Playback (Base64 -> AudioContext)
// 2. Microphone Capture (Float32 -> Base64)

export const useVoiceTransport = (onAudioData?: (base64Data: string) => void) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const isPlayingRef = useRef(false);
    const [isCapturing, setIsCapturing] = useState(false);

    // Initialize AudioContext lazily (must be after user interaction)
    const initContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000, // Common for STT
            });
        }
        return audioContextRef.current;
    };

    const playAudio = useCallback(async (base64Data: string) => {
        try {
            const ctx = initContext();
            if (ctx.state === 'suspended') await ctx.resume();

            const bytes = decode(base64Data);
            // Assuming mono 16kHz for now as per utility implication, but decodeAudioData handles channels
            const buffer = await decodeAudioData(bytes, ctx, 16000, 1);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            isPlayingRef.current = true;
            source.onended = () => {
                isPlayingRef.current = false;
            };
            source.start(0);

        } catch (error) {
            console.error("[VoiceTransport] Playback Error:", error);
        }
    }, []);

    const startCapture = useCallback(async () => {
        try {
            const ctx = initContext();
            if (ctx.state === 'suspended') await ctx.resume();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            // Buffer size 4096 is a balance between latency and performance
            const processor = ctx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!onAudioData) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Create encoded blob payload directly from the infrastructure utility
                const { data } = createBlob(inputData);
                onAudioData(data);
            };

            source.connect(processor);
            processor.connect(ctx.destination); // Needed for chrome to fire events, usually muted implies disconnected but we need the loop

            scriptProcessorRef.current = processor;
            setIsCapturing(true);

        } catch (error) {
            console.error("[VoiceTransport] Capture Error:", error);
        }
    }, [onAudioData]);

    const stopCapture = useCallback(() => {
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            stopCapture();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stopCapture]);

    return {
        playAudio,
        startCapture,
        stopCapture,
        isCapturing
    };
};
