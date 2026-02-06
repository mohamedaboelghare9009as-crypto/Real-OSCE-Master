import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Wind, Droplets, Thermometer, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import GlassContainer from './GlassContainer';
import { VitalsData } from '../../types';

interface VitalItemProps {
    icon: any;
    label: string;
    value: string | number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
    severity: 0 | 1 | 2 | 3 | 4;
    color: string;
}

const VitalItem: React.FC<VitalItemProps> = ({ icon: Icon, label, value, unit, trend, severity, color }) => (
    <div className="flex items-center justify-between group py-1">
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={14} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none mb-1">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-white leading-none">{value}</span>
                    <span className="text-[10px] text-white/30 font-medium">{unit}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Severity Dots */}
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${i < severity ? color.replace('text-', 'bg-') : 'bg-white/10'}`}
                    />
                ))}
            </div>

            {/* Trend Arrow */}
            <div className="text-white/20">
                {trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-400" /> :
                    trend === 'down' ? <ArrowDownRight size={14} className="text-red-400" /> :
                        <Minus size={14} />}
            </div>
        </div>
    </div>
);

interface VitalsMonitorProps {
    vitals: VitalsData;
}

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitals }) => {
    return (
        <GlassContainer className="w-full md:w-[240px] p-4 flex flex-col gap-2">
            <VitalItem
                icon={Heart}
                label="HR"
                value={vitals.hr}
                unit="bpm"
                severity={vitals.hr > 100 || vitals.hr < 60 ? 3 : 1}
                trend="up"
                color="text-red-400"
            />
            <VitalItem
                icon={Activity}
                label="BP"
                value={`${vitals.sbp}/${vitals.dbp}`}
                unit="mmHg"
                severity={vitals.sbp > 140 ? 4 : 1}
                trend="stable"
                color="text-amber-400"
            />
            <VitalItem
                icon={Wind}
                label="RR"
                value={vitals.rr}
                unit="/min"
                severity={vitals.rr > 20 ? 3 : 1}
                trend="up"
                color="text-blue-400"
            />
            <VitalItem
                icon={Droplets}
                label="SpO2"
                value={`${vitals.spo2}%`}
                unit=""
                severity={vitals.spo2 < 95 ? 4 : 1}
                trend="down"
                color="text-cyan-400"
            />
            <VitalItem
                icon={Thermometer}
                label="Temp"
                value={vitals.temp}
                unit="°C"
                severity={vitals.temp > 37.5 ? 2 : 1}
                trend="stable"
                color="text-orange-400"
            />
        </GlassContainer>
    );
};

export default VitalsMonitor;
