import React from 'react';
import { CheckCircle, XCircle, MinusCircle, AlertCircle, Pill, Heart, Building, GraduationCap } from 'lucide-react';
import { ManagementItem } from '../../../../services/feedbackMockData';

interface ManagementSectionProps {
    items: ManagementItem[];
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Pharm': return Pill;
        case 'Non-Pharm': return Heart;
        case 'Disposition': return Building;
        case 'Education': return GraduationCap;
        default: return Pill;
    }
};

const getCategoryLabel = (category: string) => {
    switch (category) {
        case 'Pharm': return 'Pharmacological';
        case 'Non-Pharm': return 'Non-Pharmacological';
        case 'Disposition': return 'Disposition';
        case 'Education': return 'Patient Education';
        default: return category;
    }
};

export const ManagementSection: React.FC<ManagementSectionProps> = ({ items }) => {
    // Group by category
    const grouped = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ManagementItem[]>);

    const categoryOrder = ['Pharm', 'Non-Pharm', 'Disposition', 'Education'];

    return (
        <div className="space-y-6">
            {categoryOrder.map(category => {
                const categoryItems = grouped[category];
                if (!categoryItems || categoryItems.length === 0) return null;

                const CategoryIcon = getCategoryIcon(category);

                return (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                            <CategoryIcon size={16} className="text-slate-500" />
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                {getCategoryLabel(category)}
                            </h4>
                        </div>

                        <div className="space-y-2">
                            {categoryItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border transition-all ${item.status === 'Done'
                                            ? 'bg-white border-slate-200'
                                            : item.status === 'Missed'
                                                ? 'bg-red-50/50 border-red-200'
                                                : 'bg-amber-50/50 border-amber-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            {/* Status Icon */}
                                            {item.status === 'Done' && (
                                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full mt-0.5">
                                                    <CheckCircle size={16} />
                                                </div>
                                            )}
                                            {item.status === 'Missed' && (
                                                <div className="p-1.5 bg-red-100 text-red-600 rounded-full mt-0.5">
                                                    <XCircle size={16} />
                                                </div>
                                            )}
                                            {item.status === 'Partial' && (
                                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full mt-0.5">
                                                    <MinusCircle size={16} />
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${item.status === 'Missed'
                                                            ? 'text-gray-500 line-through'
                                                            : 'text-gray-900'
                                                        }`}>
                                                        {item.text}
                                                    </span>
                                                    {item.isCritical && (
                                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded">
                                                            Critical
                                                        </span>
                                                    )}
                                                </div>

                                                {item.feedback && (
                                                    <p className="text-sm text-amber-600 mt-1.5 flex items-center gap-1.5">
                                                        <AlertCircle size={12} />
                                                        {item.feedback}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className={`font-bold ${item.status === 'Done' ? 'text-emerald-600' :
                                                    item.status === 'Missed' ? 'text-red-600' : 'text-amber-600'
                                                }`}>
                                                {item.score}
                                            </span>
                                            <span className="text-gray-400 text-sm">/{item.maxScore}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
