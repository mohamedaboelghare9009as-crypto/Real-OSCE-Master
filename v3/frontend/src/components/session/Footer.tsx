import React from 'react';
import { Mic, Keyboard, ChevronRight, Square } from 'lucide-react';

interface FooterProps {
    isListening: boolean;
    onToggleMic: () => void;
    inputMode: 'voice' | 'chat';
    onToggleMode: () => void;
    onNextStage: () => void;
    onEndSession: () => void;
    canAdvance: boolean;
}

const Footer: React.FC<FooterProps> = ({
    isListening,
    onToggleMic,
    inputMode,
    onToggleMode,
    onNextStage,
    onEndSession,
    canAdvance
}) => {
    return (
        <div className="h-20 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex items-center justify-between px-8 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

            {/* Mode Switch (Clayomorphic Soft) */}
            <button
                onClick={onToggleMode}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
                title="Toggle Input Mode (Spacebar)"
            >
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
                    {inputMode === 'voice' ? <Keyboard size={20} /> : <Mic size={20} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    {inputMode === 'voice' ? 'Chat' : 'Voice'} Mode
                </span>
            </button>

            {/* Primary Interaction Button (Clayomorphic Pill) */}
            <button
                onClick={inputMode === 'voice' ? onToggleMic : undefined}
                className={`
                    relative group flex items-center gap-3 px-10 h-12 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300
                    ${inputMode === 'voice'
                        ? (isListening
                            ? 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:bg-rose-600'
                            : 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:bg-emerald-400')
                        : 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                    }
                `}
            >
                {inputMode === 'voice' ? (
                    <>
                        <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
                        {isListening ? 'Listening...' : 'Push to Talk'}
                    </>
                ) : (
                    <span className="opacity-50">Keyboard Mode</span>
                )}

                {/* Visual Ring for Active State */}
                {isListening && (
                    <span className="absolute inset-0 rounded-full border-4 border-rose-400/30 animate-ping" />
                )}
            </button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onEndSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                    <Square size={14} fill="currentColor" />
                    Exit
                </button>

                <button
                    onClick={onNextStage}
                    disabled={!canAdvance}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300
                        ${canAdvance
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_8px_16px_rgba(37,99,235,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] active:scale-95'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
                    `}
                >
                    Next Stage
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Footer;
