import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { RESPONSE_STRINGS } from '../../../services/simulationData';
import { intentService } from '../../../services/intentService'; // Added import
import { Send, Mic, User, Bot, Volume2, MicOff, StopCircle, MessageSquare, Phone, MoreVertical, Keyboard } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

// Web Speech API Types
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export const CommunicationZone: React.FC = () => {
    const { transcript, addTranscriptMessage } = useSimulationStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Default to Voice Mode being primary
    const [isVoiceMode, setIsVoiceMode] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showTextHistory, setShowTextHistory] = useState(false);

    const endRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (showTextHistory) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcript, isTyping, showTextHistory]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (window.webkitSpeechRecognition || window.SpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // We restart manually for control
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const transcriptText = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');

                setInput(transcriptText);

                if (event.results[0].isFinal && isVoiceMode) {
                    handleSend(undefined, transcriptText);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [isVoiceMode]);

    const speakText = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 0.9;
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Mic error", e);
            }
        }
    };

    const handleSend = (e?: React.FormEvent, overrideText?: string) => {
        e?.preventDefault();
        const textToSend = overrideText || input;

        if (!textToSend.trim()) return;

        // 1. Check for Voice Commands (Intents)
        const intent = intentService.analyze(textToSend);

        if (intent.type !== 'UNKNOWN') {
            // It's a command!
            addTranscriptMessage('doctor', textToSend); // Log the command
            setInput('');

            // Execute
            intentService.execute(intent);

            // Feedback
            const feedbackText = `Command recognized: ${intent.feedback}`;
            addTranscriptMessage('system', feedbackText);

            if (isVoiceMode) {
                speakText(intent.feedback.replace('Command recognized:', '')); // Speak the action confirmation
            }
            return; // STOP! Don't send to patient.
        }

        // 2. Normal Conversation (No intent found)
        addTranscriptMessage('doctor', textToSend);
        setInput('');

        if (!isVoiceMode) setIsTyping(true);

        // Simulate network/thinking delay
        setTimeout(() => {
            const lowerQuery = textToSend.toLowerCase();
            const match = RESPONSE_STRINGS.find(r => lowerQuery.includes(r.trigger));
            const response = match ? match.response : "I'm not sure I understand what you mean, doctor.";

            addTranscriptMessage('patient', response);
            if (!isVoiceMode) setIsTyping(false);

            if (isVoiceMode) {
                speakText(response);
            }

        }, 1200);
    };

    // Derived state for the last message to show as caption
    const lastMessage = transcript[transcript.length - 1];

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* View Mode Toggle Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-slate-500 border border-white/50 shadow-sm pointer-events-auto">
                    {isVoiceMode ? '● Voice Session' : 'Chat Session'}
                </div>
                <button
                    onClick={() => { setIsVoiceMode(!isVoiceMode); if (isVoiceMode) window.speechSynthesis.cancel(); }}
                    className="pointer-events-auto p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:bg-white shadow-sm transition-all"
                >
                    {isVoiceMode ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </button>
            </div>

            {/* IMMERSIVE VOICE MODE UI */}
            <AnimatePresence mode="wait">
                {isVoiceMode ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6"
                    >
                        {/* Avatar Container */}
                        <div className="relative mb-8">
                            {/* Ripple Effects */}
                            {isSpeaking && (
                                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20 scale-150" />
                            )}
                            {isListening && (
                                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20 scale-150 delay-75" />
                            )}

                            <motion.div
                                animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className={`w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl relative z-10
                                    ${isSpeaking ? 'border-emerald-500' : isListening ? 'border-red-400' : 'border-white'}
                                `}
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4`}
                                    alt="Patient"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold text-slate-800">James Anderson</h2>
                                <p className="text-sm text-slate-500 font-medium">Acute Chest Pain</p>
                            </div>
                        </div>

                        {/* Live Captions / Status */}
                        <div className="h-24 w-full max-w-sm flex items-center justify-center text-center">
                            {isListening ? (
                                <div className="space-y-2">
                                    <p className="text-red-500 font-bold tracking-widest text-xs uppercase animate-pulse">Listening...</p>
                                    <p className="text-lg font-medium text-slate-700">"{input}"</p>
                                </div>
                            ) : isSpeaking ? (
                                <div className="space-y-2">
                                    <div className="flex justify-center gap-1 h-4 items-end">
                                        {[1, 2, 3, 4].map(i => <motion.div key={i} animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-emerald-500 rounded-full" />)}
                                    </div>
                                    <motion.p
                                        key={lastMessage?.text}
                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-lg font-medium text-slate-700"
                                    >
                                        "{lastMessage?.sender === 'patient' ? lastMessage.text : '...'}"
                                    </motion.p>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm">Tap the microphone to speak</p>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-10 flex items-center gap-6">
                            <button
                                onClick={() => setShowTextHistory(!showTextHistory)}
                                className="p-4 rounded-full bg-white text-slate-400 hover:text-slate-600 shadow-lg hover:bg-slate-50 transition-all"
                            >
                                <MessageSquare className="w-6 h-6" />
                            </button>

                            <button
                                onClick={toggleListening}
                                className={`p-6 rounded-full transition-all shadow-xl scale-100 hover:scale-105 active:scale-95
                                    ${isListening ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-osce-navy text-white shadow-osce-navy/30'}
                                `}
                            >
                                {isListening ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                            </button>

                            <button
                                onClick={() => setIsVoiceMode(false)}
                                className="p-4 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-lg hover:bg-red-50 transition-all"
                            >
                                <MicOff className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Overlay Text History for Reference */}
                        <AnimatePresence>
                            {showTextHistory && (
                                <motion.div
                                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                    className="absolute inset-0 bg-white z-20 flex flex-col"
                                >
                                    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
                                        <h3 className="font-bold">Transcript</h3>
                                        <button onClick={() => setShowTextHistory(false)} className="p-2 bg-slate-100 rounded-full"><StopCircle className="w-4 h-4 rotate-45" /></button>
                                    </div>
                                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                        {transcript.map((msg, i) => (
                                            <div key={i} className={`p-3 rounded-lg text-sm ${msg.sender === 'doctor' ? 'bg-slate-100 ml-auto max-w-[80%]' : msg.sender === 'system' ? 'text-center text-xs text-slate-400' : 'bg-indigo-50 mr-auto max-w-[80%]'}`}>
                                                <span className="font-bold block text-[10px] opacity-50 mb-1 uppercase">{msg.sender}</span>
                                                {msg.text}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    // CHAT MODE (Classic text)
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col h-full bg-white"
                    >
                        {/* Existing Chat UI Logic Recycled here or simplified */}
                        {/* Patient Header */}
                        <div className="p-4 border-b flex items-center gap-3 bg-white">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=James`} alt="Patient" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">James Anderson</h3>
                                <p className="text-[10px] text-slate-500">MRN-998210</p>
                            </div>
                        </div>

                        {/* Transcript */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {transcript.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.sender === 'doctor' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'}`}>
                                    {msg.sender === 'system' ? (
                                        <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-1 rounded-full">{msg.text}</span>
                                    ) : (
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                                            ${msg.sender === 'doctor' ? 'bg-osce-navy text-white rounded-tr-sm' : 'bg-white border text-slate-700 rounded-tl-sm'}
                                        `}>
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <div className="text-xs text-slate-400 ml-4 animate-pulse">Patient is typing...</div>}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t bg-white flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2"
                                onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
                            />
                            <button onClick={handleSend} disabled={!input.trim()} className="p-2 bg-osce-navy text-white rounded-full">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
