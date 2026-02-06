import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/useSimulationStore';
import { INVESTIGATION_LIBRARY, Investigation } from '../../../../services/simulationData';
import { Search, Beaker, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const InvestigationPhase: React.FC = () => {
    const { orderInvestigation, orderedInvestigations } = useSimulationStore();
    const [search, setSearch] = useState('');

    // Filter logic
    const results = search
        ? INVESTIGATION_LIBRARY.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
        : INVESTIGATION_LIBRARY; // Show all for MVP ease

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-osce-navy">Investigation Portal</h2>
                    <p className="text-slate-500">Order bedside tests, labs, and imaging.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for investigations (e.g. ECG, Troponin)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-osce-navy/20 outline-none"
                    />
                </div>

                {/* Search Results */}
                {search && (
                    <div className="border rounded-xl bg-white overflow-hidden max-h-60 overflow-y-auto shadow-inner">
                        {results.map(test => {
                            const isOrdered = orderedInvestigations.some(o => o.id === test.id);
                            return (
                                <div key={test.id} className="flex items-center justify-between p-3 hover:bg-slate-50 border-b last:border-0 transition-colors">
                                    <div>
                                        <div className="font-bold text-sm text-slate-800">{test.name}</div>
                                        <div className="text-xs text-slate-500">{test.category} • {test.cost} min</div>
                                    </div>
                                    <button
                                        disabled={isOrdered}
                                        onClick={() => { orderInvestigation(test); setSearch(''); }}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold ${isOrdered ? 'bg-green-100 text-green-700' : 'bg-osce-navy text-white'}`}
                                    >
                                        {isOrdered ? 'Ordered' : 'Order'}
                                    </button>
                                </div>
                            );
                        })}
                        {results.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">No tests found</div>}
                    </div>
                )}
            </div>

            {/* Results Grid */}
            <div className="flex-grow overflow-y-auto">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Results ({orderedInvestigations.length})
                </h3>

                {orderedInvestigations.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed">
                        <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400">No investigations ordered yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orderedInvestigations.map(inv => (
                            <div key={inv.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`h-1.5 w-full ${inv.isAbnormal ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-bold text-slate-800">{inv.name}</span>
                                        {inv.isAbnormal ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                                <AlertTriangle className="w-3 h-3" /> Abnormal
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> Normal
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl text-sm font-mono text-slate-700 border border-slate-100">
                                        {inv.result}
                                    </div>
                                    {inv.reference && (
                                        <div className="mt-2 text-xs text-slate-400">Ref: {inv.reference}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
