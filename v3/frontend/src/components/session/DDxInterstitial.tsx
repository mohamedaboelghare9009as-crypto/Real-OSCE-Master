import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import DDxPanel from './DDxPanel';

interface DDxInterstitialProps {
    isOpen: boolean;
    stage: string;
    onContinue: (ddxList: Array<{ diagnosis: string; status: string }>) => void;
    onClose: () => void;
}

const DDxInterstitial: React.FC<DDxInterstitialProps> = ({ isOpen, stage, onContinue, onClose }) => {
    const [ddxList, setDdxList] = React.useState<Array<{ diagnosis: string; status: string }>>([]);

    const handleContinue = () => {
        onContinue(ddxList);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-3xl mx-4 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="text-white" size={28} />
                                <h2 className="text-2xl font-bold text-white">
                                    {stage} Stage Complete
                                </h2>
                            </div>
                            <p className="text-purple-100 text-sm">
                                Please enter your differential diagnoses before proceeding to the next stage.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-200 mb-2">
                                    Your Differential Diagnoses
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Based on the information gathered so far, what are your working diagnoses?
                                </p>
                            </div>

                            {/* DDx Panel Integration */}
                            <div className="mb-6">
                                <DDxPanel
                                    onDDxChange={(diagnoses) => setDdxList(diagnoses.map(d => ({
                                        diagnosis: d.diagnosis,
                                        status: d.status
                                    })))}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-500">
                                    {ddxList.length} diagnos{ddxList.length === 1 ? 'is' : 'es'} entered
                                </p>
                                <button
                                    onClick={handleContinue}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Continue to Next Stage
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DDxInterstitial;
