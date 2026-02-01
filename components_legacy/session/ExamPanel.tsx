import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Info, ChevronRight } from 'lucide-react';
import GlassContainer from './GlassContainer';

interface ExamPanelProps {
    results: Record<string, string>;
    onExamine: (system: string) => void;
}

const SYSTEMS = [
    { id: 'general', label: 'General', icon: '👤' },
    { id: 'heent', label: 'HEENT', icon: '👁️' },
    { id: 'neck', label: 'Neck', icon: '🦒' },
    { id: 'cardio', label: 'Cardio', icon: '❤️' },
    { id: 'resp', label: 'Resp', icon: '🫁' },
    { id: 'abdomen', label: 'Abdomen', icon: '肚' },
    { id: 'neuro', label: 'Neuro', icon: '🧠' },
    { id: 'musculo', label: 'Musculo', icon: '🦴' },
    { id: 'skin', label: 'Skin', icon: '🩹' },
    { id: 'psych', label: 'Psych', icon: '💭' },
    { id: 'gu', label: 'GU', icon: '🚽' },
    { id: 'ext', label: 'Extremities', icon: '🦵' }
];

const ExamPanel: React.FC<ExamPanelProps> = ({ results, onExamine }) => {
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-full bg-slate-900/10 h-[600px] md:h-auto overflow-hidden">
            <div className="p-8 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Stethoscope className="text-emerald-400" />
                    Physical Examination
                </h2>
                <p className="text-white/40 text-sm mt-1 italic">Click a system to carry out examination</p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {SYSTEMS.map((system) => {
                        const hasResult = !!results[system.id];
                        return (
                            <motion.button
                                key={system.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onExamine(system.id);
                                    setSelectedSystem(system.id);
                                }}
                                className={`
                  relative h-28 md:h-32 p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2
                  ${hasResult
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'}
                `}
                            >
                                <span className="text-2xl md:text-3xl">{system.icon}</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{system.label}</span>
                                {hasResult && (
                                    <div className="absolute top-2 right-2 bg-emerald-400 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {selectedSystem && results[selectedSystem] && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-x-0 bottom-0 p-6 z-10"
                    >
                        <GlassContainer className="bg-slate-900/90 border-emerald-500/30 p-6 flex flex-col gap-4 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{SYSTEMS.find(s => s.id === selectedSystem)?.icon}</span>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                                        {SYSTEMS.find(s => s.id === selectedSystem)?.label} Findings
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedSystem(null)}
                                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40"
                                >
                                    <ChevronRight className="rotate-90 md:rotate-0" />
                                </button>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-white/90 text-sm italic leading-relaxed">
                                    "{results[selectedSystem]}"
                                </p>
                            </div>
                        </GlassContainer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamPanel;
