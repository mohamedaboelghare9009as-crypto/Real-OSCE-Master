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
        <div className="h-20 bg-slate-900 border-t border-slate-700 flex items-center justify-between px-8 z-50">

            {/* Mode Switch */}
            <button
                onClick={onToggleMode}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                title="Toggle Input Mode (Spacebar)"
            >
                {inputMode === 'voice' ? <Keyboard size={20} /> : <Mic size={20} />}
                <span className="text-xs font-bold uppercase tracking-wider">
                    Switch to {inputMode === 'voice' ? 'Chat' : 'Voice'}
                </span>
            </button>

            {/* Primary Interaction Button */}
            <button
                onClick={inputMode === 'voice' ? onToggleMic : undefined}
                className={`
                    relative group flex items-center gap-3 px-8 h-12 rounded-full font-bold text-sm uppercase tracking-widest transition-all
                    ${inputMode === 'voice'
                        ? (isListening
                            ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-rose-600'
                            : 'bg-emerald-500 text-white hover:bg-emerald-400')
                        : 'bg-slate-700 text-slate-300 cursor-default'
                    }
                `}
            >
                {inputMode === 'voice' ? (
                    <>
                        <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
                        {isListening ? 'Click to Mute' : 'Start Session'}
                    </>
                ) : (
                    <span className="opacity-50">Type in Center Panel</span>
                )}

                {/* Visual Ring for Active State */}
                {isListening && (
                    <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping" />
                )}
            </button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onEndSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                >
                    <Square size={14} fill="currentColor" />
                    End Session
                </button>

                <button
                    onClick={onNextStage}
                    disabled={!canAdvance}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all
                        ${canAdvance
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
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
