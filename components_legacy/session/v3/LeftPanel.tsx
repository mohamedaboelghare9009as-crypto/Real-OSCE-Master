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
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-r border-slate-700/50 bg-slate-900/30">
            {/* 1. Action Menu */}
            <div className="flex-shrink-0">
                <ActionMenu stage={stage} onAction={onAction} />
            </div>

            <div className="w-full h-[1px] bg-slate-800" />

            {/* 2. Nurse Assistant */}
            <div className="flex-shrink-0">
                <NurseAssistant onOrder={(item) => onAction(`order_${item}`)} />
            </div>

            <div className="w-full h-[1px] bg-slate-800" />

            {/* 3. DDx Panel */}
            <div className="flex-1 min-h-0">
                <DDxPanel />
            </div>
        </div>
    );
};

export default LeftPanel;
