import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Wind, Droplets, Thermometer, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import GlassContainer from './GlassContainer';
import { VitalsData } from '../../types';

interface VitalItemProps {
    icon: any;
    label: string;
    value: string | number | null;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
    severity: 0 | 1 | 2 | 3 | 4;
    color: string;
    isMeasured: boolean;
}

const VitalItem: React.FC<VitalItemProps> = ({ icon: Icon, label, value, unit, trend, severity, color, isMeasured }) => (
    <div className="flex items-center justify-between group py-1">
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${isMeasured ? `bg-slate-100 ${color}` : 'bg-slate-200 text-slate-400'} group-hover:scale-110 transition-transform`}>
                <Icon size={14} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none mb-1">{label}</span>
                <div className="flex items-baseline gap-1">
                    {isMeasured ? (
                        <>
                            <span className="text-sm font-bold text-slate-900 leading-none">{value}</span>
                            <span className="text-[10px] text-slate-300 font-medium">{unit}</span>
                        </>
                    ) : (
                        <span className="text-xs text-slate-400 italic leading-none">Not measured</span>
                    )}
                </div>
            </div>
        </div>

        {isMeasured && (
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
                <div className="text-slate-200">
                    {trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> :
                        trend === 'down' ? <ArrowDownRight size={14} className="text-red-500" /> :
                            <Minus size={14} />}
                </div>
            </div>
        )}
    </div>
);

interface VitalsMonitorProps {
    vitals?: VitalsData | null;
}

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitals }) => {
    // No default values - vitals are null until measured
    const isMeasured = vitals !== null && vitals !== undefined;

    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
            <VitalItem
                icon={Heart}
                label="HR"
                value={vitals?.hr ?? null}
                unit="bpm"
                severity={vitals?.hr && (vitals.hr > 100 || vitals.hr < 60) ? 3 : 1}
                trend="up"
                color="text-red-400"
                isMeasured={!!vitals?.hr}
            />
            <VitalItem
                icon={Activity}
                label="BP"
                value={vitals?.sbp && vitals?.dbp ? `${vitals.sbp}/${vitals.dbp}` : null}
                unit="mmHg"
                severity={vitals?.sbp && vitals.sbp > 140 ? 4 : 1}
                trend="stable"
                color="text-amber-400"
                isMeasured={!!(vitals?.sbp && vitals?.dbp)}
            />
            <VitalItem
                icon={Wind}
                label="RR"
                value={vitals?.rr ?? null}
                unit="/min"
                severity={vitals?.rr && vitals.rr > 20 ? 3 : 1}
                trend="up"
                color="text-blue-400"
                isMeasured={!!vitals?.rr}
            />
            <VitalItem
                icon={Droplets}
                label="SpO2"
                value={vitals?.spo2 ? `${vitals.spo2}%` : null}
                unit=""
                severity={vitals?.spo2 && vitals.spo2 < 95 ? 4 : 1}
                trend="down"
                color="text-cyan-400"
                isMeasured={!!vitals?.spo2}
            />
            <VitalItem
                icon={Thermometer}
                label="Temp"
                value={vitals?.temp ?? null}
                unit="°C"
                severity={vitals?.temp && vitals.temp > 37.5 ? 2 : 1}
                trend="stable"
                color="text-orange-400"
                isMeasured={!!vitals?.temp}
            />
        </div>
    );
};

export default VitalsMonitor;
