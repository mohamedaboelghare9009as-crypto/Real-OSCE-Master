import React, { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';
import { Case } from '../../types';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';

interface CaseListProps {
    onEdit: (caseData: Case) => void;
    onCreate: () => void;
}

const CaseList: React.FC<CaseListProps> = ({ onEdit, onCreate }) => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadCases = async () => {
        try {
            setLoading(true);
            const data = await caseService.getAllCases();
            setCases(data);
        } catch (error) {
            console.error('Failed to load cases', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCases();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                // We need to add deleteCase to caseService frontend
                await fetch(`http://localhost:3001/api/cases/${id}`, { method: 'DELETE' });
                loadCases();
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete case.");
            }
        }
    };

    const filteredCases = cases.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading cases...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">Case Library Manager</h2>
                    <p className="text-slate-500 text-sm">Manage medical cases stored in the database.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm w-64"
                        />
                    </div>
                    <button
                        onClick={onCreate}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Create New Case
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Title</th>
                            <th className="px-4 py-3">Specialty</th>
                            <th className="px-4 py-3">Difficulty</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredCases.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">{c.specialty}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.difficulty === 'Novice' ? 'bg-emerald-100 text-emerald-600' :
                                            c.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-600' :
                                                'bg-red-100 text-red-600'
                                        }`}>{c.difficulty}</span>
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button onClick={() => onEdit(c)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(c.id, c.title)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredCases.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-slate-400">
                                    No cases found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CaseList;
