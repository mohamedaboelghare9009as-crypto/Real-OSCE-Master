
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';
import { useGeminiLivePlayer } from './useGeminiLivePlayer';

export interface SocketSessionOptions {
    caseId: string;
    sessionId: string;
    onAiMessage?: (text: string, meta?: any) => void;
    onStateUpdate?: (state: any) => void;
    onEvaluationComplete?: (evaluation: any) => void;
}

export const useSocketSession = (options: SocketSessionOptions) => {
    const [isThinking, setIsThinking] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    // Stable ref for the callback to prevent reconnection loops
    const onAiMessageRef = useRef(options.onAiMessage);
    onAiMessageRef.current = options.onAiMessage;

    const onPlaybackEnded = useMemo(() => () => {
        setIsAiSpeaking(false);
    }, []);

    const { addAudioChunk, interruptPlayback } = useGeminiLivePlayer(onPlaybackEnded);

    useEffect(() => {
        if (!options.caseId || !options.sessionId) return;

        console.log(`[SocketSession] Connecting for Case: ${options.caseId}, Session: ${options.sessionId}`);
        connectSocket();
        socket.emit('join-session', options.sessionId);

        // Listen for AI Text Response
        socket.on('ai-response-text', (data: { text: string, meta?: any }) => {
            setIsThinking(false);
            onAiMessageRef.current?.(data.text, data.meta);
        });

        // Listen for Global State Updates (Guardian Agent)
        socket.on('state-update', (state: any) => {
            console.log("[SocketSession] State Sync Received:", state);
            options.onStateUpdate?.(state);
        });

        // Listen for AI Audio (supports both progressive and legacy formats)
        socket.on('ai-audio-chunk', (data: string | { audio: string, sentenceIndex: number }) => {
            setIsAiSpeaking(true);

            if (typeof data === 'string') {
                // Legacy format: no ordering
                addAudioChunk(data);
            } else {
                // New progressive format: with sentence ordering
                console.log(`[Session] Received audio chunk for sentence ${data.sentenceIndex}`);
                addAudioChunk(data.audio, data.sentenceIndex);
            }
        });

        // Listen for AI Thinking (instant feedback)
        socket.on('ai-thinking', (data: { isThinking: boolean }) => {
            setIsThinking(data.isThinking);
            if (data.isThinking) {
                // Reset audio player state for a new turn
                interruptPlayback();
            }
        });

        // Error handling
        socket.on('error', (msg: string) => {
            console.error("[SocketSession] Error:", msg);
            setIsThinking(false);
        });

        // Evaluation complete
        socket.on('evaluation-complete', (evaluation: any) => {
            console.log("[SocketSession] Evaluation Complete:", evaluation);
            options.onEvaluationComplete?.(evaluation);
        });

        // Evaluation error
        socket.on('evaluation-error', (error: any) => {
            console.error("[SocketSession] Evaluation Error:", error);
            // Still call the completion callback with error info
            options.onEvaluationComplete?.({
                error: error.error || 'Unknown evaluation error',
                clinicalScore: { total: 0, maxTotal: 100 },
                communicationScore: { total: 0, maxTotal: 20 },
                reasoningScore: { total: 0, maxTotal: 40 },
                overallScore: 0,
                overallMaxScore: 160,
                overallFeedback: "Evaluation failed: " + (error.error || 'Unknown error'),
                strengths: [],
                areasForImprovement: ["Please try again"],
                criticalErrors: [error.error || 'Evaluation failed']
            });
        });

        return () => {
            console.log("[SocketSession] Cleaning up...");
            socket.off('ai-response-text');
            socket.off('ai-audio-chunk');
            socket.off('ai-thinking');
            socket.off('error');
            socket.off('evaluation-complete');
            socket.off('evaluation-error');
            disconnectSocket();
        };
    }, [options.caseId, options.sessionId, addAudioChunk, interruptPlayback]);

    const sendMessage = useCallback((text: string, target?: 'Nurse' | 'Patient', customEvent?: { event: string; data: any }) => {
        if (customEvent) {
            // Send custom event (for DDx submission, evaluation request, etc.)
            socket.emit(customEvent.event, customEvent.data);
        } else {
            // Send regular message
            setIsThinking(true);
            // Reset audio for a new turn locally
            interruptPlayback();
            socket.emit('message', {
                text,
                caseId: options.caseId,
                sessionId: options.sessionId,
                target
            });
        }
    }, [options.caseId, options.sessionId, interruptPlayback]);

    const startMic = useCallback(() => {
        socket.emit('start-stream');
    }, []);

    const stopMic = useCallback(() => {
        socket.emit('stop-stream');
    }, []);

    const sendAudioChunk = useCallback((base64: string) => {
        socket.emit('audio-chunk', base64);
    }, []);

    const resetSession = useCallback(() => {
        console.log("[SocketSession] Requesting Reset...");
        interruptPlayback();
        socket.emit('reset-session', {
            caseId: options.caseId,
            sessionId: options.sessionId
        });
    }, [options.caseId, options.sessionId, interruptPlayback]);

    return {
        isThinking,
        isAiSpeaking,
        sendMessage,
        startMic,
        stopMic,
        sendAudioChunk,
        interruptPlayback,
        resetSession
    };
};
