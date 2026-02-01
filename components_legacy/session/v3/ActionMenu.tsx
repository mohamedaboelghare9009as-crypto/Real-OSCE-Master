import React from 'react';
import { MessageSquare, HelpCircle, Activity, FileText, Stethoscope } from 'lucide-react';

interface ActionMenuProps {
    stage: 'History' | 'Examination' | 'Investigations' | 'Management';
    onAction: (action: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ stage, onAction }) => {

    const renderButtons = () => {
        switch (stage) {
            case 'History':
                return (
                    <div className="grid grid-cols-1 gap-2">
                        <ActionButton icon={MessageSquare} label="Ask Open Question" onClick={() => onAction('ask_open')} />
                        <ActionButton icon={HelpCircle} label="Clarify Last Answer" onClick={() => onAction('clarify')} />
                        <ActionButton icon={FileText} label="Summarize History" onClick={() => onAction('summarize')} />
                    </div>
                );
            case 'Examination':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <ActionButton icon={Activity} label="Vitals Check" onClick={() => onAction('vitals')} />
                        <ActionButton icon={Stethoscope} label="General Exam" onClick={() => onAction('exam_general')} />
                        <ActionButton icon={Stethoscope} label="CVS Exam" onClick={() => onAction('exam_cvs')} />
                        <ActionButton icon={Stethoscope} label="Resp Exam" onClick={() => onAction('exam_resp')} />
                        <ActionButton icon={Stethoscope} label="Abd Exam" onClick={() => onAction('exam_abd')} />
                        <ActionButton icon={Stethoscope} label="Neuro Exam" onClick={() => onAction('exam_neuro')} />
                    </div>
                );
            case 'Investigations':
                return (
                    <div className="grid grid-cols-1 gap-2">
                        <ActionButton icon={Activity} label="ECG (Bedside)" onClick={() => onAction('order_ecg')} />
                        <ActionButton icon={Activity} label="ABG (Bedside)" onClick={() => onAction('order_abg')} />
                        <ActionButton icon={FileText} label="Open Lab Order Form" onClick={() => onAction('open_lab_form')} />
                        <ActionButton icon={FileText} label="Request Imaging" onClick={() => onAction('request_imaging')} />
                    </div>
                );
            default:
                return <div className="text-slate-500 text-sm italic p-4">Select actions via Voice or Chat.</div>;
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Clinical Actions
            </h3>
            {renderButtons()}
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all active:scale-95"
    >
        <Icon size={16} className="text-blue-400" />
        <span className="text-sm font-bold text-slate-200">{label}</span>
    </button>
);

export default ActionMenu;
