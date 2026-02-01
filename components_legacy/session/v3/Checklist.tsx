import React from 'react';
import { Check, Circle } from 'lucide-react';

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

interface ChecklistProps {
    items: ChecklistItem[];
}

const Checklist: React.FC<ChecklistProps> = ({ items }) => {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Evaluation Checklist</h3>
            <div className="flex flex-col gap-1">
                {items.length === 0 && <p className="text-sm text-slate-600 italic">No active criteria for this stage.</p>}
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`flex items-start gap-3 p-2 rounded border transition-all ${item.completed
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                : 'bg-transparent border-transparent text-slate-500'
                            }`}
                    >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
                            }`}>
                            {item.completed && <Check size={12} className="text-slate-900 stroke-[4]" />}
                        </div>
                        <span className="text-sm font-medium">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Checklist;
