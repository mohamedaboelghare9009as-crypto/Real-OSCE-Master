import React from 'react';
import { useSimulationStore, Phase } from '../../stores/useSimulationStore';
import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const PHASES: Phase[] = ['History', 'Examination', 'Investigation', 'Management', 'Feedback'];

export const ProgressBar: React.FC = () => {
    const { currentPhase, unlockedPhases, setPhase, completeSimulation } = useSimulationStore();

    return (
        <div className="w-full flex justify-center py-4 bg-transparent absolute top-0 z-30 pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-2xl border border-white/50 pointer-events-auto">
                {PHASES.map((phase, index) => {
                    const isUnlocked = unlockedPhases.includes(phase);
                    const isActive = currentPhase === phase;
                    const isCompleted = unlockedPhases.indexOf(phase) < unlockedPhases.length - 1;

                    return (
                        <div key={phase} className="flex items-center">
                            <button
                                disabled={!isUnlocked && phase !== 'Feedback'} // Special case: Allow clicking feedback to end early? Or just keep it.
                                onClick={() => {
                                    if (phase === 'Feedback') {
                                        completeSimulation();
                                    } else {
                                        setPhase(phase);
                                    }
                                }}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all outline-none md:min-w-[140px]
                      ${!isUnlocked && 'opacity-50 cursor-not-allowed grayscale'}
                    `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePhase"
                                        className="absolute inset-0 bg-osce-navy rounded-full shadow-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <span className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] border-2 transition-colors
                     ${isActive ? 'border-white text-osce-navy bg-white' :
                                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                            'border-slate-300 text-slate-400'}
                  `}>
                                    {isCompleted ? <Check className="w-3 h-3" /> :
                                        !isUnlocked ? <Lock className="w-3 h-3" /> :
                                            (index + 1)
                                    }
                                </span>

                                <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                    {phase}
                                </span>
                            </button>

                            {index < PHASES.length - 1 && (
                                <div className="w-4 h-[2px] bg-slate-200 mx-1" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
