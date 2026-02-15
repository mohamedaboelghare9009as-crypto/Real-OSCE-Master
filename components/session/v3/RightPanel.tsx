import React from 'react';
import Checklist from './Checklist';
import InvestigationsTracker, { TrackerItem } from './InvestigationsTracker';
import CoherenceMeter from './CoherenceMeter';
import DDxPanel from './DDxPanel';

interface RightPanelProps {
    checklistItems: any[];
    trackerItems: TrackerItem[];
    coherenceScore: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ checklistItems, trackerItems, coherenceScore }) => {
    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-l border-slate-200/50 bg-white/95 shadow-lg">

            {/* 1. Differential Diagnosis Panel - Enhanced for Clinical Reasoning */}
            <div className="clay-card flex-shrink-0">
                <DDxPanel />
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* 2. Evaluation Checklist (Clayomorphic) */}
            <div className="clay-card flex-1 min-h-0 overflow-y-auto">
                <Checklist items={checklistItems} />
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* 3. Investigations Tracker (Clayomorphic) */}
            <div className="clay-card flex-1 min-h-0 overflow-y-auto">
                <InvestigationsTracker items={trackerItems} />
            </div>

            <div className="w-full h-[1px] bg-slate-200" />

            {/* 4. Coherence Meter (Clayomorphic) */}
            <div className="clay-card flex-shrink-0">
                <CoherenceMeter value={coherenceScore} />
            </div>
        </div>
    );
};

export default RightPanel;
