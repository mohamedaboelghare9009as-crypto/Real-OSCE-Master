import React, { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';

interface SimulationLayoutProps {
    children: ReactNode;
    leftPanel: ReactNode;
    rightPanel: ReactNode;
}

export const SimulationLayout: React.FC<SimulationLayoutProps> = ({ children, leftPanel, rightPanel }) => {
    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-osce-orange/20">
            {/* Floating Progress Bar */}
            <ProgressBar />

            <div className="flex-grow flex overflow-hidden pt-20"> {/* Added pt-20 to account for floating header */}
                {/* Left Panel: Communication */}
                <div className="w-[400px] flex-shrink-0 border-r border-slate-200 bg-white z-10 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    {leftPanel}
                </div>

                {/* Center Panel: Main Workspace */}
                <div className="flex-grow bg-[#F8FAFC] relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}></div>
                    <div className="flex-grow p-8 overflow-y-auto relative z-10">
                        {children}
                    </div>
                </div>

                {/* Right Panel: DDx */}
                <div className="w-[350px] flex-shrink-0 border-l border-slate-200 bg-white z-10 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
                    {rightPanel}
                </div>
            </div>
        </div>
    );
};
