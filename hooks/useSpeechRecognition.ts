import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (onSilence?: (text: string) => void, isSpeaking?: boolean) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Type assertion for window with SpeechRecognition
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timer helper
    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true; // Keep listening
                recognitionRef.current.interimResults = true; // Show words as they are spoken
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcriptPart = event.results[i][0].transcript;
                        currentTranscript += transcriptPart;
                    }
                    if (currentTranscript) {
                        setTranscript(currentTranscript);

                        // Reset silence timer on every new word
                        clearSilenceTimer();

                        // CRITICAL FIX: Only trigger callback if NOT currently speaking
                        if (onSilence && !isSpeaking) {
                            silenceTimerRef.current = setTimeout(() => {
                                console.log("[SPEECH] Silence detected, triggering callback...");
                                onSilence(currentTranscript);
                                setTranscript(''); // Clear after processing
                            }, 2000); // 2 seconds silence
                        } else if (isSpeaking) {
                            console.log("[SPEECH] Blocked callback - audio is playing");
                        }
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech Recognition Error", event.error);
                    setError(event.error);
                    // Don't stop listening on 'no-speech' error if continuous
                    if (event.error !== 'no-speech') {
                        setIsListening(false);
                        clearSilenceTimer();
                    }
                };

                recognitionRef.current.onend = () => {
                    // If we are supposed to be listening (and didn't manually stop), restart?
                    // For now, let the parent control restart via state
                    setIsListening(false);
                    clearSilenceTimer();
                };
            } else {
                setError("Browser does not support Speech Recognition");
            }
        }
        return () => clearSilenceTimer();
    }, [onSilence, isSpeaking]); // Add isSpeaking as dependency

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                // Determine if already started
                recognitionRef.current.start();
                setIsListening(true);
                setTranscript(''); // Clear previous
                setError(null);
                clearSilenceTimer();
                console.log("[SPEECH] Microphone started");
            } catch (e) {
                // Often triggers if already started, safe to ignore
                setIsListening(true); // Assume active
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            clearSilenceTimer();
            console.log("[SPEECH] Microphone stopped");
        }
    }, []);

    const resetTranscript = () => {
        setTranscript('');
        clearSilenceTimer(); // Also clear any pending callbacks
        console.log("[SPEECH] Transcript reset");
    };

    return { isListening, transcript, startListening, stopListening, resetTranscript, error };
};
