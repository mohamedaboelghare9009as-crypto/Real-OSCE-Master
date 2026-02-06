import React from 'react';
import { CheckCircle, XCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { ChecklistItem } from '../../../../services/feedbackMockData';

interface HistorySectionProps {
    items: ChecklistItem[];
}

export const HistorySection: React.FC<HistorySectionProps> = ({ items }) => {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-100 text-sm font-medium text-gray-400 uppercase tracking-wider">
                <div className="col-span-8">Item</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Score</div>
            </div>

            {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 py-3 items-start border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
                    <div className="col-span-8">
                        <div className="flex items-start gap-2">
                            <span className={`mt-0.5 font-medium ${item.status === 'Done' ? 'text-gray-900' :
                                    item.status === 'Missed' ? 'text-gray-500 line-through decoration-gray-300' :
                                        'text-gray-800'
                                }`}>
                                {item.text}
                            </span>
                            {item.isCritical && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded mt-0.5">
                                    Critical
                                </span>
                            )}
                        </div>
                        {item.feedback && (
                            <p className="text-sm text-amber-600 mt-1 flex items-center gap-1.5">
                                <AlertCircle size={12} />
                                {item.feedback}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2 flex justify-center">
                        {item.status === 'Done' && (
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                <CheckCircle size={14} /> Done
                            </div>
                        )}
                        {item.status === 'Missed' && (
                            <div className="flex items-center gap-1 text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded-full">
                                <XCircle size={14} /> Missed
                            </div>
                        )}
                        {item.status === 'Partial' && (
                            <div className="flex items-center gap-1 text-amber-600 text-sm font-medium bg-amber-50 px-2 py-1 rounded-full">
                                <MinusCircle size={14} /> Partial
                            </div>
                        )}
                    </div>

                    <div className="col-span-2 text-right font-medium text-gray-700">
                        {item.score} <span className="text-gray-400 font-normal">/ {item.maxScore}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
