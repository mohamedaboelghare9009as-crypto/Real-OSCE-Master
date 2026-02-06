import React from 'react';
import { useSimulationStore } from '../../../stores/useSimulationStore';
import { ClipboardCheck } from 'lucide-react';

export const ManagementPhase: React.FC = () => {
    const { managementPlan, updateManagement } = useSimulationStore();

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="bg-osce-navy text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Management Plan</h2>
                    <p className="opacity-80">Formulate a comprehensive plan for the patient.</p>
                </div>
                <ClipboardCheck className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white opacity-5" />
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacological Interventions</label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-osce-navy/20 outline-none min-h-[100px]"
                        placeholder="List medications, doses, routes, and frequencies..."
                        value={managementPlan.meds}
                        onChange={e => updateManagement('meds', e.target.value)}
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Non-Pharmacological / Procedures</label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-osce-navy/20 outline-none min-h-[100px]"
                        placeholder="e.g. Oxygen, PCI, Counseling..."
                        value={managementPlan.nonPharma}
                        onChange={e => updateManagement('nonPharma', e.target.value)}
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Monitoring & Follow-up</label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-slate-200 border rounded-xl focus:ring-2 focus:ring-osce-navy/20 outline-none min-h-[80px]"
                        placeholder="e.g. Admit to CCU, Monitor telemetry..."
                        value={managementPlan.followUp}
                        onChange={e => updateManagement('followUp', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
