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
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-r border-slate-800/50 bg-slate-950/40 backdrop-blur-xl">
            {/* 1. Action Menu (Clayomorphic) */}
            <div className="clay-card">
                <ActionMenu stage={stage} onAction={onAction} />
            </div>

            {/* 2. Nurse Assistant (Clayomorphic) */}
            <div className="clay-card">
                <NurseAssistant onOrder={(item) => onAction(`order_${item}`)} />
            </div>

            {/* 3. DDx Panel (Clayomorphic) */}
            <div className="clay-card flex-1 min-h-0 overflow-y-auto">
                <DDxPanel />
            </div>
        </div>
    );
};

export default LeftPanel;
