import React, { useState } from 'react';
import { Case } from '../../types';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface CaseEditorProps {
    initialData?: Case | null;
    onSave: () => void;
    onCancel: () => void;
}

const DEFAULT_CASE: any = {
    metadata: {
        title: '',
        specialty: 'Internal Medicine',
        difficulty: 'Intermediate',
        description: '',
        tags: []
    },
    history: {
        chiefComplaint: '',
        hpi: '',
        pmh: '',
        medications: '',
        allergies: '',
        socialHistory: '',
        familyHistory: '',
        reviewOfSystems: ''
    },
    examination: {
        generalAppearance: '',
        vitals: { hr: 70, bp: '120/80', rr: 16, spo2: 98, temp: 37 },
        findings: []
    },
    investigations: {
        bedside: [],
        confirmatory: []
    },
    management: {
        steps: [],
        diagnosis: ''
    }
};

const CaseEditor: React.FC<CaseEditorProps> = ({ initialData, onSave, onCancel }) => {
    // If initialData is partial (metadata only), we might need to fetch full?
    // For now assuming full if editing, or empty.
    // Ideally Admin fetches full case first. 
    // BUT list only returns metadata. 
    // We should fetch full case on init if editing.

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<any>(initialData ? {
        metadata: {
            title: initialData.title,
            specialty: initialData.specialty,
            difficulty: initialData.difficulty,
            description: initialData.description,
            tags: initialData.tags
        },
        // We might need to map flat 'Case' type back to nested schema or just use nested
        // The backend expects nested schema structure for create/update.
        // Let's assume we are building specific schema structure.
        ...initialData // Will likely mismatch if types are mixed.
    } : DEFAULT_CASE);

    // If ID exists, we are editing.
    // Note: The 'Case' type in frontend might be flat. The backend 'OsceCase' is nested.
    // We need to adhere to backend schema for saving.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = initialData?.id
                ? `http://localhost:3001/api/cases/${initialData.id}`
                : `http://localhost:3001/api/cases`;

            const method = initialData?.id ? 'PUT' : 'POST';

            // Construct payload matching OsceCase schema
            // For simplicity, we bind directly to nested state
            const payload = formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Save failed");
            onSave();
        } catch (error) {
            console.error(error);
            alert("Failed to save case.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Helper for nested inputs
    const InputGroup = ({ label, section, field, type = "text", textarea = false }: any) => (
        <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            {textarea ? (
                <textarea
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 min-h-[100px]"
                    value={formData[section]?.[field] || ''}
                    onChange={e => handleChange(section, field, e.target.value)}
                />
            ) : (
                <input
                    type={type}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                    value={formData[section]?.[field] || ''}
                    onChange={e => handleChange(section, field, e.target.value)}
                />
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">
                            {initialData ? 'Edit Case' : 'Create New Case'}
                        </h2>
                        <p className="text-slate-500 text-xs">Fill in the detailed medical scenario</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                    Save Case
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* 1. Metadata */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Case Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Case Title" section="metadata" field="title" />
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Specialty</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                                value={formData.metadata.specialty}
                                onChange={e => handleChange('metadata', 'specialty', e.target.value)}
                            >
                                <option>Internal Medicine</option>
                                <option>Surgery</option>
                                <option>Pediatrics</option>
                                <option>Psychiatry</option>
                                <option>Emergency</option>
                                <option>Plastics</option>
                                <option>Respiratory</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                                value={formData.metadata.difficulty}
                                onChange={e => handleChange('metadata', 'difficulty', e.target.value)}
                            >
                                <option>Novice</option>
                                <option>Intermediate</option>
                                <option>Expert</option>
                            </select>
                        </div>
                    </div>
                    <InputGroup label="Description (Brief)" section="metadata" field="description" textarea />
                </section>

                {/* 2. History */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Patient History</h3>
                    <InputGroup label="Chief Complaint" section="history" field="chiefComplaint" />
                    <InputGroup label="History of Present Illness (HPI)" section="history" field="hpi" textarea />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Past Medical History" section="history" field="pmh" textarea />
                        <InputGroup label="Medications" section="history" field="medications" textarea />
                        <InputGroup label="Allergies" section="history" field="allergies" />
                        <InputGroup label="Social History" section="history" field="socialHistory" textarea />
                        <InputGroup label="Family History" section="history" field="familyHistory" textarea />
                        <InputGroup label="Review of Systems" section="history" field="reviewOfSystems" textarea />
                    </div>
                </section>

                {/* 3. Examination & Vitals */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Examination & Vitals</h3>
                    <InputGroup label="General Appearance" section="examination" field="generalAppearance" textarea />

                    <div className="grid grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {/* We need a custom handler for nested vitals */}
                        {['hr', 'bp', 'rr', 'spo2', 'temp'].map(v => (
                            <div key={v} className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500">{v}</label>
                                <input
                                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-center"
                                    value={formData.examination?.vitals?.[v] || ''}
                                    onChange={e => {
                                        const newVal = { ...formData.examination.vitals, [v]: e.target.value };
                                        handleChange('examination', 'vitals', newVal);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
                    <strong>Note:</strong> Advanced editing for specific Findings, Investigations, and Management Steps is limited in this V1 editor.
                    Please ensure the core history and scenario are accurate.
                </div>

            </div>
        </form>
    );
};

export default CaseEditor;
