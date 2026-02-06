import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface DomainAccordionProps {
    title: string;
    icon: LucideIcon;
    score: {
        obtained: number;
        total: number;
        percentage: number;
    };
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const DomainAccordion: React.FC<DomainAccordionProps> = ({
    title,
    icon: Icon,
    score,
    children,
    defaultOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const isPass = score.percentage >= 60; // Simple threshold, could be props

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isPass ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        <Icon size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{title}</h3>
                        {!isOpen && (
                            <p className="text-xs text-gray-500 font-medium">Click to view details</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                            <span className={isPass ? 'text-emerald-600' : 'text-red-600'}>{score.obtained}</span>
                            <span className="text-gray-400 text-sm font-normal"> / {score.total}</span>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-6 border-t border-gray-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
