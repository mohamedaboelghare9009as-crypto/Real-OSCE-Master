import React, { useRef, useEffect } from 'react';
import { Avatar } from '../v2/Avatar';
import { PatientEmotion } from '../../../types';
import { Send, Mic, Keyboard } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'model' | 'nurse';
    text: string;
    timestamp: Date;
}

interface CenterPanelProps {
    transcript: Message[];
    isListing: boolean;
    isThinking: boolean;
    isSpeaking: boolean;
    inputMode: 'voice' | 'chat';
    onSendMessage: (text: string) => void;
    currentQuery: string;
}

const CenterPanel: React.FC<CenterPanelProps> = ({
    transcript,
    isListing,
    isThinking,
    isSpeaking,
    inputMode,
    onSendMessage,
    currentQuery
}) => {
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const [chatInput, setChatInput] = React.useState('');

    // Auto-scroll to bottom only
    useEffect(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, currentQuery]);

    const handleSend = () => {
        if (chatInput.trim()) {
            onSendMessage(chatInput);
            setChatInput('');
        }
    };

    let emotion = PatientEmotion.NEUTRAL;
    if (isSpeaking) emotion = PatientEmotion.SPEAKING;
    if (isListing) emotion = PatientEmotion.LISTENING;

    return (
        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-sm relative overflow-hidden">

            {/* 1. Patient Area (Flexible Height) */}
            <div className={`
                flex-1 flex flex-col items-center justify-center relative transition-all duration-500 ease-in-out
                ${transcript.length > 0 ? 'min-h-[250px] max-h-[40vh]' : 'min-h-[400px]'}
                border-b border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-transparent
            `}>
                <Avatar type="patient" emotion={emotion} className="scale-110 md:scale-125 transition-transform duration-700" />

                {/* Status Indicator */}
                <div className={`
                    absolute top-6 px-4 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg
                    ${isThinking ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' :
                        isSpeaking ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            isListing ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-800/40 border-slate-700/50 text-slate-400'}
                `}>
                    {isThinking ? 'Processing...' : isSpeaking ? 'Speaking' : isListing ? 'Listening' : 'Ready'}
                </div>

                {/* Subtitles Overlay */}
                {(currentQuery || isThinking) && (
                    <div className="absolute bottom-4 w-full px-6 flex justify-center">
                        <span className="inline-block px-6 py-2 bg-black/40 backdrop-blur-[2px] rounded-xl text-white/90 text-sm font-medium leading-relaxed border border-white/5 mx-auto max-w-md text-center shadow-xl">
                            {currentQuery || (isThinking ? "..." : "")}
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Transcript & Chat Area (Fills remaining) */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/30 relative">

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {transcript.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3 opacity-50">
                            <div className="p-4 bg-slate-900 rounded-full">
                                {inputMode === 'voice' ? <Mic size={24} /> : <Keyboard size={24} />}
                            </div>
                            <p className="text-sm font-medium">Start the session by saying "Hello"</p>
                        </div>
                    )}

                    {transcript.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`
                                max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm backdrop-blur-sm
                                ${msg.role === 'user'
                                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-tr-sm mr-2'
                                    : (msg.role === 'nurse'
                                        ? 'bg-purple-600/10 border border-purple-500/20 text-purple-50 rounded-tl-sm ml-2'
                                        : 'bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-tl-sm ml-2')}
                            `}>
                                <div className="flex items-center gap-2 mb-1.5 opacity-70">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-blue-400' : msg.role === 'nurse' ? 'text-purple-400' : 'text-emerald-400'
                                        }`}>
                                        {msg.role === 'user' ? 'Student' : msg.role === 'nurse' ? 'Nurse' : 'Patient'}
                                    </span>
                                </div>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {/* Invisible div to scroll to */}
                    <div ref={scrollEndRef} />
                </div>

                {/* Input Area (Fixed at bottom of this section) */}
                {inputMode === 'chat' && (
                    <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your response..."
                                    className="flex-1 bg-slate-900/90 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-xl"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!chatInput.trim()}
                                    className="p-3.5 bg-slate-800 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all border border-slate-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CenterPanel;
