import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { DDxItem } from '../../../../services/feedbackMockData';

interface DDxTimelineSectionProps {
    items: DDxItem[];
}

export const DDxTimelineSection: React.FC<DDxTimelineSectionProps> = ({ items }) => {
    // Sort by rank
    const sortedItems = [...items].sort((a, b) => a.rank - b.rank);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium uppercase tracking-wide">Your Differential Rankings</span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> Pre-data = before investigations
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {sortedItems.map((item, index) => (
                    <div
                        key={index}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${item.isCorrect
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                    >
                        {/* Rank Number */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${item.rank === 1
                                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200'
                                : item.rank === 2
                                    ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md'
                                    : item.rank === 3
                                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-600'
                            }`}>
                            #{item.rank}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-semibold ${item.isCorrect ? 'text-emerald-800' : 'text-slate-700'
                                    }`}>
                                    {item.diagnosis}
                                </h4>

                                {item.isLifeThreatening && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded">
                                        <Zap size={10} /> Life-threatening
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5">
                                {item.preData ? (
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        Added pre-investigations
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                        Added post-investigations
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Correct/Incorrect Badge */}
                        <div className="flex-shrink-0">
                            {item.isCorrect ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full font-semibold text-sm">
                                    <CheckCircle size={16} />
                                    Correct
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-200 px-3 py-1.5 rounded-full font-semibold text-sm">
                                    <XCircle size={16} />
                                    Incorrect
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle size={14} />
                        {items.filter(i => i.isCorrect).length} Correct
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <XCircle size={14} />
                        {items.filter(i => !i.isCorrect).length} Incorrect
                    </span>
                </div>
                {items.some(i => i.isLifeThreatening && i.isCorrect && i.rank <= 2) && (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                        ✓ Life-threatening DDx identified early
                    </span>
                )}
            </div>
        </div>
    );
};
