import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

interface TopBarProps {
    title: string;
    stage: 'History' | 'Examination' | 'Investigations' | 'Management';
    difficulty: number;
    timeLeft: number; // in seconds
    onExit: () => void;
    onStageChange: (stage: 'History' | 'Examination' | 'Investigations' | 'Management') => void;
}

const STAGES = ['History', 'Examination', 'Investigations', 'Management'];

// Medical Theme Colors (Nightingale Blue based)
const MEDICAL_COLORS = {
    primary: '#0474b8',      // Nightingale Blue
    primaryLight: '#e6f4fa', // Light blue background
    success: '#28a745',      // Green
    warning: '#ffc107',      // Amber/Yellow
    error: '#dc3545',        // Red
    info: '#0556AD',         // Darker blue
    text: '#333333',         // Dark text
    textLight: '#666666',    // Secondary text
    border: '#e5e7eb',       // Light border
};

const TopBar: React.FC<TopBarProps> = ({ title, stage, difficulty, timeLeft, onExit, onStageChange }) => {

    // Format time MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Timer Color States based on medical theme
    const getTimerStyles = () => {
        if (timeLeft < 30) {
            return {
                textColor: `text-[${MEDICAL_COLORS.error}]`,
                bgColor: `bg-red-50`,
                borderColor: `border-red-200`,
                animate: true
            };
        }
        if (timeLeft < 120) {
            return {
                textColor: `text-[${MEDICAL_COLORS.warning}]`,
                bgColor: `bg-amber-50`,
                borderColor: `border-amber-200`,
                animate: false
            };
        }
        return {
            textColor: `text-[${MEDICAL_COLORS.success}]`,
            bgColor: `bg-green-50`,
            borderColor: `border-green-200`,
            animate: false
        };
    };

    const timerStyles = getTimerStyles();

    return (
        <div className="h-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 md:px-8 select-none sticky top-0 shadow-sm">
            {/* Left: Exit & Case Info */}
            <div className="flex items-center gap-3 md:gap-4">
                <button 
                    onClick={onExit} 
                    className="p-2.5 hover:bg-[#e6f4fa] rounded-full text-[#666666] hover:text-[#0474b8] transition-all active:scale-95"
                    aria-label="Exit session"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-[#333333] font-bold text-base md:text-lg leading-tight tracking-tight">{title}</h1>
                    <div className="flex gap-1 mt-1">
                        {[...Array(3)].map((_, i) => (
                            <span 
                                key={i} 
                                className={`text-xs transition-all ${i < difficulty ? 'text-[#ffc107]' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center: Stage Progress (Medical Pill Navigation) */}
            <div className="flex items-center gap-1 md:gap-2 bg-[#f8f8f8] p-1 md:p-1.5 rounded-full border border-[#e5e7eb]">
                {STAGES.map((s) => {
                    const isActive = s === stage;
                    const isPast = STAGES.indexOf(stage) > STAGES.indexOf(s);
                    const isFuture = STAGES.indexOf(stage) < STAGES.indexOf(s);

                    return (
                        <div key={s} className="flex items-center">
                            <button
                                onClick={() => onStageChange(s as any)}
                                disabled={isFuture}
                                className={`
                                    px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all duration-300
                                    ${isActive 
                                        ? 'bg-[#0474b8] text-white shadow-md' 
                                        : isPast 
                                            ? 'text-[#0474b8] hover:bg-white' 
                                            : 'text-gray-400 cursor-not-allowed'}
                                `}
                                aria-label={`Go to ${s} stage`}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                {s}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Right: Timer (Medical Theme) */}
            <div 
                className={`
                    flex items-center gap-2 md:gap-3 font-mono text-xl md:text-2xl font-bold 
                    ${timerStyles.textColor} 
                    ${timerStyles.bgColor} 
                    px-3 md:px-5 py-2 
                    rounded-xl border ${timerStyles.borderColor}
                    transition-all duration-300
                    ${timeLeft < 30 ? 'animate-pulse border-2' : ''}
                `}
                role="timer"
                aria-label={`Time remaining: ${timeDisplay}`}
            >
                <Clock 
                    size={22} 
                    className={timeLeft < 30 ? 'animate-spin' : ''}
                    aria-hidden="true"
                />
                <span className="tabular-nums tracking-tighter">{timeDisplay}</span>
            </div>
        </div>
    );
};

export default TopBar;
