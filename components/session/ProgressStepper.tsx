import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
    currentPhase: 'history' | 'exam' | 'labs' | 'confirm';
    completedPhases: string[];
    patientName: string;
    timeRemaining: string;
}

const PHASES = [
    { id: 'history', label: 'History' },
    { id: 'exam', label: 'Exam' },
    { id: 'labs', label: 'Labs' },
    { id: 'confirm', label: 'Confirm' }
];

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentPhase, completedPhases, patientName, timeRemaining }) => {
    return (
        <div className="sticky top-0 z-20 w-full h-18 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                {PHASES.map((phase, index) => {
                    const isActive = currentPhase === phase.id;
                    const isComplete = completedPhases.includes(phase.id);
                    const isLocked = !isActive && !isComplete && index > PHASES.findIndex(p => p.id === currentPhase);

                    return (
                        <div key={phase.id} className="flex items-center">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.05 : 1,
                                    opacity: isLocked ? 0.4 : 1
                                }}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold
                  ${isActive ? 'bg-white/10 border-white/30 text-white' :
                                        isComplete ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                                            'bg-transparent border-white/5 text-white/40'}
                `}
                            >
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : isComplete ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                {phase.label}
                                {isComplete && <Check size={12} />}
                            </motion.div>

                            {index < PHASES.length - 1 && (
                                <div className="w-4 h-[1px] bg-white/5 mx-1" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col items-end shrink-0 ml-4">
                <span className="text-white font-bold text-sm leading-none">{patientName}</span>
                <span className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-wider">{timeRemaining}</span>
            </div>
        </div>
    );
};

export default ProgressStepper;
