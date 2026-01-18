import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Circle } from 'lucide-react';

interface DDxItem {
    id: string;
    diagnosis: string;
    status: 'supported' | 'uncertain' | 'contradicted';
}

const DDxPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [diagnoses, setDiagnoses] = useState<DDxItem[]>([]);
    const [input, setInput] = useState('');

    const addDiagnosis = () => {
        if (!input.trim()) return;
        const newDx: DDxItem = {
            id: Date.now().toString(),
            diagnosis: input.trim(),
            status: 'uncertain'
        };
        setDiagnoses([...diagnoses, newDx]);
        setInput('');
    };

    const removeDiagnosis = (id: string) => {
        setDiagnoses(diagnoses.filter(d => d.id !== id));
    };

    const toggleStatus = (id: string) => {
        setDiagnoses(diagnoses.map(d => {
            if (d.id === id) {
                const nextStatus = d.status === 'uncertain' ? 'supported' : d.status === 'supported' ? 'contradicted' : 'uncertain';
                return { ...d, status: nextStatus };
            }
            return d;
        }));
    };

    const getStatusColor = (status: DDxItem['status']) => {
        switch (status) {
            case 'supported': return 'bg-emerald-500 text-emerald-950 border-emerald-500/50';
            case 'contradicted': return 'bg-red-500 text-white border-red-500/50';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    return (
        <div className="flex flex-col border border-slate-700 rounded-2xl overflow-hidden bg-slate-900/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    Differential Diagnosis
                </h3>
                {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </button>

            {isOpen && (
                <div className="p-4 flex flex-col gap-4">
                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                            placeholder="Add hypothesis..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={addDiagnosis}
                            className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {diagnoses.length === 0 && (
                            <p className="text-xs text-slate-600 text-center italic py-2">No diagnoses tracked yet.</p>
                        )}
                        {diagnoses.map(dx => (
                            <div
                                key={dx.id}
                                className={`flex items-center justify-between p-2 pl-3 rounded-lg border text-sm font-medium transition-all ${getStatusColor(dx.status)}`}
                            >
                                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleStatus(dx.id)}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                    {dx.diagnosis}
                                </div>
                                <button onClick={() => removeDiagnosis(dx.id)} className="p-1 hover:bg-black/20 rounded opacity-60 hover:opacity-100">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DDxPanel;
