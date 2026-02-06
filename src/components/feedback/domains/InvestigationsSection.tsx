import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Beaker, ScanLine, Activity } from 'lucide-react';
import { InvestigationItem } from '../../../../services/feedbackMockData';

interface InvestigationsSectionProps {
    items: InvestigationItem[];
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Bedside': return Activity;
        case 'Lab': return Beaker;
        case 'Imaging': return ScanLine;
        default: return Activity;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Ordered':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    <CheckCircle size={12} /> Ordered
                </span>
            );
        case 'Missed':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    <XCircle size={12} /> Missed
                </span>
            );
        case 'Not Indicated':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    N/A
                </span>
            );
        default:
            return null;
    }
};

const getAppropriatenessBadge = (appropriateness: string) => {
    switch (appropriateness) {
        case 'Correct':
            return (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Appropriate
                </span>
            );
        case 'Harmful':
            return (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    ⚠ Potentially Harmful
                </span>
            );
        case 'Unnecessary':
            return (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    → Unnecessary
                </span>
            );
        default:
            return null;
    }
};

export const InvestigationsSection: React.FC<InvestigationsSectionProps> = ({ items }) => {
    // Group by type
    const grouped = items.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<string, InvestigationItem[]>);

    const typeOrder = ['Bedside', 'Lab', 'Imaging'];

    return (
        <div className="space-y-6">
            {typeOrder.map(type => {
                const typeItems = grouped[type];
                if (!typeItems || typeItems.length === 0) return null;

                const TypeIcon = getTypeIcon(type);

                return (
                    <div key={type}>
                        <div className="flex items-center gap-2 mb-3">
                            <TypeIcon size={16} className="text-slate-500" />
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{type}</h4>
                        </div>

                        <div className="grid gap-3">
                            {typeItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border transition-all ${item.status === 'Ordered' && item.appropriateness === 'Correct'
                                            ? 'bg-emerald-50/50 border-emerald-200'
                                            : item.appropriateness === 'Harmful'
                                                ? 'bg-red-50/50 border-red-200'
                                                : item.appropriateness === 'Unnecessary'
                                                    ? 'bg-amber-50/50 border-amber-200'
                                                    : 'bg-slate-50 border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getStatusBadge(item.status)}
                                                {getAppropriatenessBadge(item.appropriateness)}
                                            </div>
                                        </div>
                                        {item.cost && (
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400">Est. Cost</span>
                                                <p className="font-semibold text-slate-600">${item.cost}</p>
                                            </div>
                                        )}
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
