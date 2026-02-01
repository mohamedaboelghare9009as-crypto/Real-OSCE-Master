import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Beaker, ClipboardList, ArrowUp, ArrowDown } from 'lucide-react';
import GlassContainer from './GlassContainer';
import MicButton from './MicButton';
import { LabPanel } from '../../types';

interface NursePanelProps {
    labResults: LabPanel[];
    nurseStatus: 'idle' | 'active' | 'recording' | 'processing';
    onNurseClick: () => void;
}

const NursePanel: React.FC<NursePanelProps> = ({ labResults, nurseStatus, onNurseClick }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-900/5 h-[600px] md:h-auto">
            {/* Nurse Interaction Section */}
            <div className="p-8 border-b border-white/5 flex flex-col items-center gap-6">
                <div className="flex items-center gap-6 w-full">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
                        <div className={`absolute inset-0 rounded-full border-2 ${nurseStatus !== 'idle' ? 'border-amber-400 animate-pulse' : 'border-white/10'}`} />
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=NurseSarah&backgroundColor=b6e3f4"
                            alt="Nurse"
                            className="w-full h-full rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900" />
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                Nurse Sarah
                                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/50 uppercase tracking-widest">Active</span>
                            </h2>
                            <p className="text-white/40 text-[11px] md:text-xs">Give voice commands to order labs or imaging</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <MicButton status={nurseStatus} onClick={onNurseClick} size={56} />
                            <div className={`text-xs italic ${nurseStatus === 'idle' ? 'text-white/20' : 'text-amber-400'}`}>
                                {nurseStatus === 'idle' ? '"Nurse, order blood tests..."' : 'Listening for orders...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Results Display */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <AnimatePresence mode="popLayout">
                    {labResults.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4 py-20"
                        >
                            <ClipboardList size={48} />
                            <p className="text-sm uppercase tracking-widest font-bold">No labs ordered yet</p>
                        </motion.div>
                    ) : (
                        labResults.map((panel) => (
                            <motion.div
                                key={panel.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                layout
                            >
                                <GlassContainer className="bg-white/5 border-white/5 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FlaskConical size={14} className="text-blue-400" />
                                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">{panel.title}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {panel.results.map((res, i) => (
                                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1 hover:border-white/20 transition-all">
                                                <span className="text-[10px] font-bold text-white/40 uppercase truncate">{res.label}</span>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-bold ${res.status === 'high' ? 'text-orange-400' : res.status === 'low' ? 'text-blue-400' : 'text-white'}`}>
                                                        {res.value}
                                                    </span>
                                                    <span className="text-[10px] text-white/20">{res.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassContainer>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NursePanel;
