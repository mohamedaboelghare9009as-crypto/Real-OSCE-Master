
import React from 'react';
import CaseLibrary from '../../pages_legacy/CaseLibrary';

export const StationsSection = () => {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* We might need to adjust styles since CaseLibrary might have its own layout */}
            <CaseLibrary />
        </div>
    );
};
