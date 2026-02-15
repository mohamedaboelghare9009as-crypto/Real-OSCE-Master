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
        <div className="h-20 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 flex items-center justify-between px-8 z-50 shadow-md">

            {/* Mode Switch (Clayomorphic Soft) */}
            <button
                onClick={onToggleMode}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
                title="Toggle Input Mode (Spacebar)"
            >
                <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">
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
                            ? 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:bg-rose-600'
                            : 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:bg-emerald-400')
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-red-200 text-red-600 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                    <Square size={14} fill="currentColor" />
                    Exit
                </button>

                <button
                    onClick={onNextStage}
                    disabled={!canAdvance}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all
                        ${canAdvance
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/10'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'}
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
