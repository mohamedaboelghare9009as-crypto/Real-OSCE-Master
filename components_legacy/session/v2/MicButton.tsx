import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface MicButtonProps {
    isActive: boolean;
    isDisabled?: boolean;
    isError?: boolean;
    onClick: () => void;
    size?: 'normal' | 'small';
}

export const MicButton: React.FC<MicButtonProps> = ({
    isActive,
    isDisabled = false,
    isError = false,
    onClick,
    size = 'normal'
}) => {
    const baseSize = size === 'normal' ? 'w-20 h-20' : 'w-14 h-14';
    const iconSize = size === 'normal' ? 32 : 20;

    return (
        <div className="relative flex items-center justify-center">
            {isActive && (
                <div className={`absolute rounded-full border border-red-500/30 bg-red-500/10 animate-ping ${size === 'normal' ? 'w-28 h-28' : 'w-20 h-20'}`} />
            )}

            <button
                onClick={isDisabled ? undefined : onClick}
                disabled={isDisabled}
                className={`
          relative z-10 flex items-center justify-center rounded-full 
          backdrop-blur-md transition-all duration-300 ease-in-out
          border
          ${baseSize}
          ${isDisabled
                        ? 'bg-slate-100/20 border-slate-200/50 cursor-not-allowed opacity-50'
                        : isActive
                            ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                            : 'bg-white/40 border-slate-300/60 hover:bg-white/60 hover:border-slate-400 hover:scale-105 shadow-sm'
                    }
          ${isError ? 'border-amber-500/50 bg-amber-500/10' : ''}
        `}
                aria-label={isActive ? "Stop recording" : "Start recording"}
            >
                {isError ? (
                    <AlertCircle size={iconSize} className="text-amber-500" />
                ) : isActive ? (
                    <Mic size={iconSize} className="text-red-500" />
                ) : (
                    <MicOff size={iconSize} className="text-slate-600" />
                )}
            </button>

            {!isActive && !isDisabled && size === 'normal' && (
                <span className="absolute -bottom-8 text-xs font-medium text-slate-400 tracking-wide uppercase">
                    Push to Speak
                </span>
            )}
        </div>
    );
};
