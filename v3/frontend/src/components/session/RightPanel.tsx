import React from 'react';
import Checklist from './Checklist';
import InvestigationsTracker, { TrackerItem } from './InvestigationsTracker';
import CoherenceMeter from './CoherenceMeter';

interface RightPanelProps {
    stage: 'History' | 'Examination' | 'Investigations' | 'Management';
    checklistItems: any[];
    trackerItems: TrackerItem[];
    coherenceScore: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ stage, checklistItems, trackerItems, coherenceScore }) => {
    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-l border-slate-800/50 bg-slate-950/40 backdrop-blur-xl">
            {/* Phase Content Filtering can be added here */}
            {/* 1. Checklist (Clayomorphic) */}
            <div className="clay-card">
                <Checklist items={checklistItems} />
            </div>

            {/* 2. Investigations Tracker (Clayomorphic) */}
            <div className="clay-card">
                <InvestigationsTracker items={trackerItems} />
            </div>

            {/* 3. Coherence Meter (Clayomorphic) */}
            <div className="clay-card">
                <CoherenceMeter value={coherenceScore} />
            </div>
        </div>
    );
};

export default RightPanel;
