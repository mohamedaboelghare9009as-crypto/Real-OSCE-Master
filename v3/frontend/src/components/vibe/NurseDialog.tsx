import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Vibe: "Recursive Architect" / "T-EEN" - Clean, functional, slightly futuristic yet clinical.
// Purpose: Dialog box for the Virtual Nurse in the OSCE simulation.

interface NurseDialogProps {
    message: string;
    isThinking?: boolean;
    isVisible?: boolean;
}

export const NurseDialog: React.FC<NurseDialogProps> = ({ message, isThinking = false, isVisible = true }) => {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50 pointer-events-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 
                        shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Header Strip - Clinical Accent */}
                        <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-blue-500" />

                        <div className="p-6 flex items-start gap-4">
                            {/* Avatar / Icon Placeholder */}
                            <div className="shrink-0 w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <span className="text-xl">👩‍⚕️</span>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                        Triage Nurse
                                    </h3>
                                    {isThinking && (
                                        <span className="flex items-center gap-1" title="Thinking...">
                                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse delay-75" />
                                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse delay-150" />
                                        </span>
                                    )}
                                </div>

                                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                                    {message || "Processing patient data..."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
