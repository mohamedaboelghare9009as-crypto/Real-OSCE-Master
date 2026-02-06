import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { ArrowRight, GripVertical, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const DDxSidebar: React.FC = () => {
    const {
        currentDDx,
        currentPhase,
        addDDxItem,
        saveDDxVersion,
        unlockPhase,
        setPhase,
        completeSimulation
    } = useSimulationStore();

    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        if (currentDDx.find(item => item.text.toLowerCase() === inputValue.toLowerCase())) {
            setError('Already in list');
            return;
        }
        addDDxItem(inputValue);
        setInputValue('');
        setError(null);
    };

    const handleProceed = () => {
        // For Management phase, we don't need to check for differentials
        if (currentPhase !== 'Management' && currentDDx.length < 3) {
            setError('Minimum 3 Differentials required');
            return;
        }
        if (currentPhase === 'History') {
            saveDDxVersion('Post-History');
            unlockPhase('Examination');
            setPhase('Examination');
        } else if (currentPhase === 'Examination') {
            saveDDxVersion('Post-Examination');
            unlockPhase('Investigation');
            setPhase('Investigation');
        } else if (currentPhase === 'Investigation') {
            saveDDxVersion('Post-Investigation');
            unlockPhase('Management');
            setPhase('Management');
        } else if (currentPhase === 'Management') {
            completeSimulation();
            // Navigate to feedback page - the SimulationPage useEffect will handle navigation
            // if this navigate doesn't work, but we try first
            navigate('/feedback-demo');
        }
        setError(null);
    };

    // Management phase can always proceed (complete), other phases need 3 differentials
    const canProceed = currentPhase === 'Management' || currentDDx.length >= 3;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">Hypothesis Tracker</h3>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">
                        {currentDDx.length}
                    </span>
                </div>
                <p className="text-xs text-slate-500">Rank your differentials by likelihood.</p>
            </div>

            {/* List */}
            <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-slate-50/50">
                <AnimatePresence initial={false}>
                    {currentDDx.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-move"
                        >
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 flex-grow leading-tight">{item.text}</span>
                            <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentDDx.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <Plus className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No hypotheses added</p>
                        <p className="text-xs text-slate-400 mt-1 text-center">Add diagnoses as you gather information.</p>
                    </div>
                )}
            </div>

            {/* Input & Footer */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        className="flex-grow px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-osce-navy/20 focus:border-osce-navy/30 outline-none transition-all"
                        placeholder="Add differential..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-3 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-xl text-slate-400 transition-all font-bold disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <button
                    onClick={handleProceed}
                    className={`nav-button w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
                        ${canProceed
                            ? 'bg-osce-navy text-white shadow-osce-navy/25 hover:shadow-osce-navy/40 hover:-translate-y-0.5'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
                    `}
                >
                    {currentPhase === 'Management' ? 'Complete Simulation' : 'Save & Proceed'}
                    <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                        {currentPhase} Checkpoint Active
                    </span>
                </div>
            </div>
        </div>
    );
};
