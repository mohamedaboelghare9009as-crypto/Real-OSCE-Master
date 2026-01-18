import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface MicButtonProps {
    status: 'idle' | 'active' | 'recording' | 'processing';
    onClick: () => void;
    size?: number;
}

const MicButton: React.FC<MicButtonProps> = ({ status, onClick, size = 72 }) => {
    const getColors = () => {
        switch (status) {
            case 'active': return 'border-blue-400 bg-blue-500/20 text-blue-400';
            case 'recording': return 'border-red-400 bg-red-500/20 text-red-400';
            case 'processing': return 'border-amber-400 bg-amber-500/20 text-amber-400';
            default: return 'border-white/20 bg-white/5 text-white/40';
        }
    };

    return (
        <div className="relative flex flex-col items-center gap-3">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                disabled={status === 'processing'}
                className={`
          flex items-center justify-center rounded-full border-2 transition-colors
          ${getColors()}
        `}
                style={{ width: size, height: size }}
                animate={status === 'active' ? {
                    boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0)", "0 0 0 15px rgba(59, 130, 246, 0.2)", "0 0 0 0px rgba(59, 130, 246, 0)"]
                } : status === 'recording' ? {
                    x: [-1, 1, -1, 1, 0],
                    boxShadow: ["0 0 0 0px rgba(239, 68, 68, 0)", "0 0 0 15px rgba(239, 68, 68, 0.2)", "0 0 0 0px rgba(239, 68, 68, 0)"]
                } : {}}
                transition={status === 'active' || status === 'recording' ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
            >
                <AnimatePresence mode="wait">
                    {status === 'processing' ? (
                        <motion.div
                            key="loader"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 size={size * 0.4} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            {status === 'idle' ? <MicOff size={size * 0.4} /> : <Mic size={size * 0.4} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {status !== 'idle' && (
                <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] uppercase tracking-widest font-bold text-white/40"
                >
                    {status === 'processing' ? 'Processing...' : status === 'recording' ? 'Live' : 'Listening'}
                </motion.span>
            )}
        </div>
    );
};

export default MicButton;
