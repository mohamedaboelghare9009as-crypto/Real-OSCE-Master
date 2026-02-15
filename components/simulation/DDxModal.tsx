import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';

interface DDxModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: 'history' | 'physical' | 'labs';
    onSubmit: () => void;
}

export const DDxModal: React.FC<DDxModalProps> = ({ isOpen, onClose, stage, onSubmit }) => {
    const { submitDDx, setDDxFeedback, ddxFeedback, setPhase } = useSessionStore();
    const [ddxList, setDdxList] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleAddDDx = () => {
        if (inputValue.trim()) {
            setDdxList([...ddxList, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemoveDDx = (index: number) => {
        setDdxList(ddxList.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Call API via store or service (abstracted here for now, assuming service call happens in parent or we call fetch directly)
            // Ideally this logic belongs in simulationService, but for speed:
            const response = await fetch('http://localhost:3001/api/assess-ddx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stage,
                    caseId: 'current-case-id', // TODO: Get from store
                    caseData: { title: "Mock Case", hiddenTruth: { diagnosis: "Mock Diagnosis" } }, // TODO: Real data
                    studentDDx: ddxList,
                    justification
                })
            });
            const feedback = await response.json();

            setDDxFeedback(feedback);
            submitDDx(ddxList);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        onSubmit(); // Trigger stage transition in parent
        setDDxFeedback(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Differential Diagnosis</h2>
                        <p className="text-sm text-slate-500 font-medium">Stage: {stage.toUpperCase()}</p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {!ddxFeedback ? (
                        <>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700">Rank your Hypotheses</label>
                                <div className="flex gap-2">
                                    <input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddDDx()}
                                        placeholder="Type a diagnosis (e.g. Acute MI)..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    />
                                    <button onClick={handleAddDDx} className="bg-slate-800 text-white px-4 rounded-xl hover:bg-slate-700 transition-colors">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 min-h-[100px]">
                                    {ddxList.map((dx, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group animate-fade-in-up">
                                            <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 font-medium text-slate-700">{dx}</span>
                                            <button onClick={() => handleRemoveDDx(idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {ddxList.length === 0 && (
                                        <div className="text-center text-slate-400 text-sm italic py-4">No diagnoses added yet.</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Justification (Why?)</label>
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[100px] font-medium resize-none"
                                    placeholder="Explain your reasoning based on the findings so far..."
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-emerald-800">Assessment Complete</h3>
                                    <p className="text-emerald-700 font-medium">Score: {ddxFeedback.score}/100</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-blue-500" />
                                    Feedback
                                </h4>
                                <p className="text-slate-600 leading-relaxed dark:text-gray-300">
                                    {ddxFeedback.feedback}
                                </p>
                            </div>

                            {ddxFeedback.detailedCritique && (
                                <div className="prose prose-sm max-w-none text-slate-600">
                                    <div dangerouslySetInnerHTML={{ __html: ddxFeedback.detailedCritique }} /> {/* Ideally sanitize/parse MD */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    {!ddxFeedback ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || ddxList.length === 0}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Evaluating...' : 'Submit & Evaluate'}
                        </button>
                    ) : (
                        <button
                            onClick={handleContinue}
                            className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                        >
                            Continue to Next Stage <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
