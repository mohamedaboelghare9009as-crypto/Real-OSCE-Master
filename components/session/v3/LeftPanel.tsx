import React from 'react';
import ActionMenu from './ActionMenu';
import NurseAssistant from './NurseAssistant';
import DDxPanel from './DDxPanel';

interface LeftPanelProps {
    stage: 'History' | 'Examination' | 'Investigations' | 'Management';
    onAction: (action: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ stage, onAction }) => {
    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-r border-slate-200/50 bg-white/95 shadow-lg">
            {/* 1. Action Menu (Clayomorphic) */}
            <div className="clay-card">
                <ActionMenu stage={stage} onAction={onAction} />
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* 2. Nurse Assistant (Clayomorphic) */}
            <div className="clay-card">
                <NurseAssistant onOrder={(item) => onAction(`order_${item}`)} />
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* 3. DDx Panel (Clayomorphic) */}
            <div className="clay-card flex-1 min-h-0 overflow-y-auto">
                <DDxPanel />
            </div>
        </div>
    );
};

export default LeftPanel;
