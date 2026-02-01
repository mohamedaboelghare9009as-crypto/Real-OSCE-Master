import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Layers } from 'lucide-react';
import GlassContainer from './GlassContainer';
import { LabPanel } from '../../types';

interface ConfirmPanelProps {
    isLocked: boolean;
    confirmResults: LabPanel[];
}

const ConfirmPanel: React.FC<ConfirmPanelProps> = ({ isLocked, confirmResults }) => {
    if (isLocked) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center gap-6 bg-slate-900/20 backdrop-blur-sm h-[600px] md:h-auto">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                    <ShieldAlert size={40} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Tier 2 Confirmatory Tests</h2>
                    <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                        This module is currently <span className="text-orange-400">Locked</span>. Complete initial labs and physical examination to unlock advanced imaging and management protocols.
                    </p>
                </div>
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-1.5 rounded-full bg-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900/5 h-[600px] md:h-auto overflow-hidden">
            <div className="p-8 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Zap className="text-orange-400" />
                    Confirmatory Phase
                </h2>
                <p className="text-white/40 text-sm mt-1">Final diagnostic and management steps</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {confirmResults.map((test) => (
                        <GlassContainer key={test.id} className="bg-orange-500/5 border-orange-500/20 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Layers className="text-orange-400" size={18} />
                                <h3 className="font-bold text-white uppercase tracking-widest">{test.title}</h3>
                            </div>
                            <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 min-h-24">
                                <p className="text-sm italic text-white/70 leading-relaxed">
                                    {test.results[0]?.value || "Processing imaging results..."}
                                </p>
                            </div>
                        </GlassContainer>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConfirmPanel;
