import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ExamFindingItem } from '../../../../services/feedbackMockData';

interface ExaminationSectionProps {
    items: ExamFindingItem[];
}

export const ExaminationSection: React.FC<ExaminationSectionProps> = ({ items }) => {
    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    {/* Status Icon Column */}
                    <div className="shrink-0 pt-1">
                        {item.status === 'Done' ? (
                            item.correctlyIdentified ? (
                                <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
                                    <CheckCircle size={20} />
                                </div>
                            ) : (
                                <div className="bg-amber-100 text-amber-600 p-1.5 rounded-full" title="Technique good, finding missed">
                                    <AlertCircle size={20} />
                                </div>
                            )
                        ) : (
                            <div className="bg-red-100 text-red-600 p-1.5 rounded-full">
                                <XCircle size={20} />
                            </div>
                        )}
                    </div>

                    {/* Content Column */}
                    <div className="grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-gray-900">{item.text}</h4>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.system}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900">{item.score}</span>
                                <span className="text-gray-400 text-sm"> / {item.maxScore}</span>
                            </div>
                        </div>

                        {/* Feedback / Context */}
                        <div className="mt-2 text-sm">
                            {item.status === 'Done' && !item.correctlyIdentified && (
                                <p className="text-amber-700">
                                    <span className="font-semibold">Insight:</span> You performed the maneuver but missed the clinical sign (e.g., murmur/crepitations).
                                </p>
                            )}
                            {item.feedback && (
                                <p className="text-slate-600 mt-1">
                                    <span className="font-semibold text-slate-700">Note:</span> {item.feedback}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
