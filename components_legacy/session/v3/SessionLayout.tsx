import React, { ReactNode } from 'react';

interface SessionLayoutProps {
    topBar: ReactNode;
    leftPanel: ReactNode;
    centerPanel: ReactNode;
    rightPanel: ReactNode;
    footer: ReactNode;
}

const SessionLayout: React.FC<SessionLayoutProps> = ({
    topBar,
    leftPanel,
    centerPanel,
    rightPanel,
    footer
}) => {
    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden font-sans">
            {/* Top Bar (Fixed) */}
            <div className="flex-none">
                {topBar}
            </div>

            {/* Main Grid (Fixed Height, No Window Scroll) */}
            <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* Left Panel: Clinical Control (3 cols) */}
                <div className="hidden lg:block col-span-3 min-w-0 h-full overflow-hidden">
                    {leftPanel}
                </div>

                {/* Center Panel: Simulation Core (6 cols) */}
                <div className="col-span-12 lg:col-span-6 min-w-0 border-x border-slate-800/50 h-full overflow-hidden relative">
                    {centerPanel}
                </div>

                {/* Right Panel: Reasoning & Feedback (3 cols) */}
                <div className="hidden lg:block col-span-3 min-w-0 h-full overflow-hidden">
                    {rightPanel}
                </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="flex-none">
                {footer}
            </div>
        </div>
    );
};

export default SessionLayout;
