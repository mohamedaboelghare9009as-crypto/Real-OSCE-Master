'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';

interface VitalProps {
    label: string;
    value: string | number;
    unit: string;
    icon: React.ElementType;
    color: string;
    pulse?: boolean;
}

const VitalCard: React.FC<VitalProps> = ({ label, value, unit, icon: Icon, color, pulse }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="clay-card group relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 bg-${color}-500`} />

            <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Icon size={14} className={pulse ? `animate-pulse text-${color}-400` : ''} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-100">{value}</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase">{unit}</span>
            </div>

            {/* Micro-Interaction Bar */}
            <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r from-${color}-600 to-${color}-400`}
                />
            </div>
        </motion.div>
    );
};

export const VitalsMonitor: React.FC<{ vitals?: any }> = ({ vitals }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <VitalCard
                label="Heart Rate"
                value={vitals?.heartRate || '--'}
                unit="bpm"
                icon={Heart}
                color="rose"
                pulse={!!vitals?.heartRate}
            />
            <VitalCard
                label="Blood Pressure"
                value={vitals?.bloodPressure || "--/--"}
                unit="mmHg"
                icon={Activity}
                color="blue"
            />
            <VitalCard
                label="Oxygen"
                value={vitals?.oxygenSaturation || '--'}
                unit="%"
                icon={Wind}
                color="emerald"
            />
            <VitalCard
                label="Temp"
                value={vitals?.temperature || '--'}
                unit="°C"
                icon={Thermometer}
                color="amber"
            />
        </div>
    );
};
