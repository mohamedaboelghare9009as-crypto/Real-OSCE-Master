import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopBarProps {
    title: string;
    stage: 'History' | 'Examination' | 'Investigations' | 'Management';
    difficulty: number;
    timeLeft: number; // in seconds
    onExit: () => void;
}

const STAGES = ['History', 'Examination', 'Investigations', 'Management'];

const TopBar: React.FC<TopBarProps> = ({ title, stage, difficulty, timeLeft, onExit }) => {
    const router = useRouter();

    // Format time MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Timer Color
    let timerColor = 'text-emerald-400';
    if (timeLeft < 120) timerColor = 'text-orange-400';
    if (timeLeft < 30) timerColor = 'text-red-500 animate-pulse';

    return (
        <div className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 select-none shadow-2xl z-50">
            {/* Left: Exit & Case Info */}
            <div className="flex items-center gap-4">
                <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-white font-bold text-lg leading-none">{title}</h1>
                    <div className="flex gap-1 mt-1">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < difficulty ? 'text-amber-400' : 'text-slate-600'}`}>★</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center: Stage Progress */}
            <div className="flex items-center gap-2">
                {STAGES.map((s, i) => {
                    const isActive = s === stage;
                    const isPast = STAGES.indexOf(stage) > i;

                    return (
                        <div key={s} className="flex items-center">
                            <div className={`
                                px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' :
                                    isPast ? 'bg-slate-800 text-slate-400' : 'text-slate-600'}
                            `}>
                                {s}
                            </div>
                            {i < STAGES.length - 1 && (
                                <div className="w-4 h-[1px] bg-slate-800 mx-1" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right: Timer */}
            <div className={`flex items-center gap-3 font-mono text-2xl font-bold ${timerColor} bg-slate-950/50 px-4 py-1 rounded-lg border border-white/5`}>
                <Clock size={20} className={timeLeft < 30 ? 'animate-spin' : ''} />
                {timeDisplay}
            </div>
        </div>
    );
};

export default TopBar;
