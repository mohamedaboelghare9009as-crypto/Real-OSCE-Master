import React from 'react';

interface CoherenceMeterProps {
    value: number; // 0-100
}

const CoherenceMeter: React.FC<CoherenceMeterProps> = ({ value }) => {
    // Color logic
    let color = 'bg-slate-500';
    if (value > 40) color = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (value > 70) color = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reasoning Coherence</span>
                <span className="text-sm font-bold text-slate-200">{value}%</span>
            </div>

            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

export default CoherenceMeter;
