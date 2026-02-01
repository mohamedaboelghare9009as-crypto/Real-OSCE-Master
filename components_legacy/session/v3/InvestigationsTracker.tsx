import React from 'react';
import { Clock, CheckCircle2, FlaskConical } from 'lucide-react';

export interface TrackerItem {
    id: string;
    name: string;
    category: 'Bedside' | 'Labs' | 'Imaging';
    status: 'ordered' | 'pending' | 'result_available';
    result?: string;
}

interface InvestigationsTrackerProps {
    items: TrackerItem[];
}

const InvestigationsTracker: React.FC<InvestigationsTrackerProps> = ({ items }) => {

    const renderSection = (category: string, list: TrackerItem[]) => {
        if (list.length === 0) return null;
        return (
            <div className="flex flex-col gap-2 mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{category}</h4>
                {list.map(item => (
                    <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-slate-200">{item.name}</span>
                            <StatusBadge status={item.status} />
                        </div>
                        {item.status === 'result_available' && item.result && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-blue-200 font-mono">
                                {item.result}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const bedside = items.filter(i => i.category === 'Bedside');
    const labs = items.filter(i => i.category === 'Labs');
    const imaging = items.filter(i => i.category === 'Imaging');

    return (
        <div className="flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FlaskConical size={14} />
                Investigations Tracker
            </h3>

            <div className="overflow-y-auto max-h-[300px] pr-2">
                {items.length === 0 && (
                    <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-xs">No investigations requested.</p>
                    </div>
                )}
                {renderSection('Bedside / Vitals', bedside)}
                {renderSection('Laboratory', labs)}
                {renderSection('Imaging', imaging)}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: TrackerItem['status'] }) => {
    switch (status) {
        case 'ordered':
            return (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    Ordered
                </span>
            );
        case 'pending':
            return (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded animate-pulse">
                    <Clock size={10} /> Pending
                </span>
            );
        case 'result_available':
            return (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">
                    <CheckCircle2 size={10} /> Result
                </span>
            );
    }
};

export default InvestigationsTracker;
