import React from 'react';
import { LabResult } from '../../../types';
import { AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
    result: LabResult;
    index: number;
}

export const LabResultCard: React.FC<Props> = ({ result, index }) => {
    const isCritical = result.flag === 'critical';
    const isHigh = result.flag === 'high';
    const isLow = result.flag === 'low';

    return (
        <div
            className={`
            flex items-center justify-between p-4 mb-2 rounded-2xl border shadow-sm animate-fade-in-up transition-all hover:shadow-md
            ${isCritical ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}
        `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-center gap-4">
                <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isCritical ? 'bg-red-100 text-red-500' : isHigh || isLow ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400'}
        `}>
                    {isCritical ? <AlertTriangle size={20} /> :
                        isHigh ? <ArrowUpRight size={20} /> :
                            isLow ? <ArrowDownRight size={20} /> :
                                <CheckCircle2 size={20} />}
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{result.testName}</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-lg font-bold tracking-tight ${isCritical ? 'text-red-700' : 'text-slate-800'}`}>
                            {result.value}
                        </span>
                        {result.unit && <span className="text-xs text-slate-500 font-medium">{result.unit}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {result.range && (
                    <div className="text-right hidden sm:block bg-slate-50 px-3 py-1.5 rounded-lg">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">Ref Range</span>
                        <span className="text-xs text-slate-600 font-mono">{result.range}</span>
                    </div>
                )}

                {isHigh || isLow ? (
                    <span className="text-[10px] font-bold text-white bg-orange-400 px-2 py-1 rounded-md uppercase tracking-wide">
                        {result.flag}
                    </span>
                ) : isCritical ? (
                    <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-md uppercase tracking-wide">
                        Critical
                    </span>
                ) : null}
            </div>
        </div>
    );
};
