import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/useSimulationStore';
import { EXAMINATION_FINDINGS } from '../../../../services/simulationData';
import { Stethoscope, Activity, Eye, Thermometer } from 'lucide-react';

const SYSTEMS = ['Cardiovascular', 'Respiratory', 'Abdominal', 'Constitutional', 'Extremities'];

export const ExaminationPhase: React.FC = () => {
    const { performExam, performedExams } = useSimulationStore();
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

    const availableFindings = selectedSystem
        ? EXAMINATION_FINDINGS.filter(f => f.system === selectedSystem)
        : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-2">
                <h2 className="text-xl font-bold text-osce-navy">Physical Examination</h2>
                <p className="text-slate-500">Select a body system to perform specific maneuvers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* System Menu */}
                <div className="space-y-3">
                    {SYSTEMS.map(system => (
                        <button
                            key={system}
                            onClick={() => setSelectedSystem(system)}
                            className={`w-full p-4 rounded-xl text-left font-semibold transition-all flex items-center gap-3
                                ${selectedSystem === system
                                    ? 'bg-osce-navy text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border'}
                            `}
                        >
                            {system === 'Cardiovascular' && <Activity className="w-5 h-5" />}
                            {system === 'Respiratory' && <Stethoscope className="w-5 h-5" />}
                            {system === 'Abdominal' && <div className="w-5 h-5 border-2 border-current rounded-full" />}
                            {system === 'Constitutional' && <Thermometer className="w-5 h-5" />}
                            {system === 'Extremities' && <div className="w-5 h-5 border-2 border-current rounded" />}
                            {system}
                        </button>
                    ))}
                </div>

                {/* Maneuvers & Findings */}
                <div className="md:col-span-2 space-y-4">
                    {selectedSystem ? (
                        <div className="bg-white rounded-2xl border overflow-hidden min-h-[400px] flex flex-col">
                            <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">
                                {selectedSystem} Assessment
                            </div>
                            <div className="p-4 space-y-2">
                                {availableFindings.map(finding => {
                                    const isPerformed = performedExams.some(e => e.id === finding.id);
                                    return (
                                        <div key={finding.id} className="transition-all">
                                            <button
                                                onClick={() => performExam(finding)}
                                                disabled={isPerformed}
                                                className={`w-full p-4 rounded-xl text-left border flex justify-between items-center
                                                    ${isPerformed
                                                        ? 'bg-slate-50 border-slate-200'
                                                        : 'bg-white hover:border-osce-navy/50 border-slate-200 hover:shadow-sm'}
                                                `}
                                            >
                                                <span className="font-semibold text-sm">{finding.maneuver}</span>
                                                {isPerformed ? (
                                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Performed</span>
                                                ) : (
                                                    <span className="text-xs text-osce-navy font-bold">Perform</span>
                                                )}
                                            </button>

                                            {/* Finding Result Reveal */}
                                            {isPerformed && (
                                                <div className="mt-2 ml-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <span className="font-bold text-blue-800">Finding:</span> {finding.finding}
                                                    {finding.isAbnormal && (
                                                        <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">ABNORMAL</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-2xl bg-white/50">
                            <Stethoscope className="w-12 h-12 mb-2 opacity-50" />
                            <p>Select a system to begin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
