import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, HistoryItem } from '../../types';
import { CheckCircle2, User, Activity } from 'lucide-react';
import GlassContainer from './GlassContainer';

interface HistoryPanelProps {
    transcript: Message[];
    historyPoints: HistoryItem[];
    isTyping?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ transcript, historyPoints, isTyping }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript, isTyping]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Transcript Section */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth h-[200px] md:h-auto">
                <AnimatePresence mode="popLayout">
                    {transcript.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed border
                ${msg.role === 'user'
                                    ? 'bg-blue-500/10 border-blue-400/30 text-white rounded-tr-none ml-12'
                                    : 'bg-white/5 border-emerald-400/30 text-white/90 rounded-tl-none mr-12'}
              `}>
                                <div className="flex items-center gap-2 mb-1 opacity-40">
                                    {msg.role === 'user' ? <Activity size={10} /> : <User size={10} />}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {msg.role === 'user' ? 'Doctor' : 'Patient'}
                                    </span>
                                </div>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1.5 h-2 items-center">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 bg-white/30 rounded-full"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Extracted Points Checklist */}
            <div className="p-6 bg-slate-900/20 border-t border-white/5 backdrop-blur-md">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={12} />
                    Auto-Extracted Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <AnimatePresence mode="popLayout">
                        {historyPoints.map((point) => (
                            <motion.div
                                key={point.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium border
                  ${point.isExtracted
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-white/5 border-white/5 text-white/30'}
                `}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${point.isExtracted ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                <span className="font-bold">{point.label}:</span>
                                <span className="opacity-80 truncate">{point.value || 'Pending...'}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Progress Bar for Stage Auto-advance */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold text-white/40 uppercase">
                        <span>History Completion</span>
                        <span>{Math.round((historyPoints.filter(p => p.isExtracted).length / 8) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            animate={{ width: `${(historyPoints.filter(p => p.isExtracted).length / 8) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;
