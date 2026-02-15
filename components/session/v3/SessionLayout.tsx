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
        <div className="flex flex-col h-screen w-full bg-[#f8f8f8] dark:bg-slate-950 overflow-hidden font-sans">
            {/* Top Bar (Fixed) - z-50 for highest priority */}
            <div className="flex-none z-50">
                {topBar}
            </div>

            {/* Main Grid (Fixed Height, No Window Scroll) - z-10 base layer */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 gap-0 md:gap-1 bg-[#f8f8f8] dark:bg-slate-950 z-10">
                {/* Left Panel: Clinical Control (3 cols) - Hidden on mobile, shown on lg+ */}
                <div className="hidden lg:block lg:col-span-3 xl:col-span-3 min-w-0 h-full overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    {leftPanel}
                </div>

                {/* Center Panel: Simulation Core (6 cols) - Full width on mobile, 6 cols on lg+ */}
                <div className="col-span-1 md:col-span-12 lg:col-span-6 xl:col-span-6 min-w-0 border-x border-[#e5e7eb] dark:border-slate-800/50 h-full overflow-hidden relative bg-gradient-to-b from-white to-[#fafafa] dark:from-slate-900 dark:to-slate-950">
                    {centerPanel}
                </div>

                {/* Right Panel: Reasoning & Feedback (3 cols) - Hidden on mobile, shown on lg+ */}
                <div className="hidden lg:block lg:col-span-3 xl:col-span-3 min-w-0 h-full overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    {rightPanel}
                </div>
            </div>

            {/* Footer (Fixed) - z-40 for overlay priority */}
            <div className="flex-none z-40">
                {footer}
            </div>
        </div>
    );
};

export default SessionLayout;
