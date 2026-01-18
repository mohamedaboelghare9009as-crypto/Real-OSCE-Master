import React from 'react';
import Checklist from './Checklist';
import InvestigationsTracker, { TrackerItem } from './InvestigationsTracker';
import CoherenceMeter from './CoherenceMeter';

interface RightPanelProps {
    checklistItems: any[];
    trackerItems: TrackerItem[];
    coherenceScore: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ checklistItems, trackerItems, coherenceScore }) => {
    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto border-l border-slate-700/50 bg-slate-900/30">

            {/* 1. Evaluation Checklist */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Checklist items={checklistItems} />
            </div>

            <div className="w-full h-[1px] bg-slate-800" />

            {/* 2. Investigations Tracker */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <InvestigationsTracker items={trackerItems} />
            </div>

            <div className="w-full h-[1px] bg-slate-800" />

            {/* 3. Coherence Meter */}
            <div className="flex-shrink-0">
                <CoherenceMeter value={coherenceScore} />
            </div>
        </div>
    );
};

export default RightPanel;
