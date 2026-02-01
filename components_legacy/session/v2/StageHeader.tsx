import React from 'react';
import { Check, Lock } from 'lucide-react';
import { StageStatus } from '../../../types';

interface StageHeaderProps {
    title: string;
    status: StageStatus;
    isFirst: boolean;
    isLast: boolean;
    onClick?: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
    title,
    status,
    isFirst,
    isLast,
    onClick
}) => {
    const isActive = status === StageStatus.ACTIVE;
    const isCompleted = status === StageStatus.COMPLETED;
    const isPending = status === StageStatus.PENDING;

    return (
        <div
            onClick={isCompleted ? onClick : undefined}
            className={`
        group relative flex items-center py-5 pr-6 pl-10 cursor-default
        transition-colors duration-300
        ${isActive ? 'bg-white' : 'bg-transparent'}
        ${isCompleted ? 'cursor-pointer hover:bg-slate-50' : ''}
    `}>
            {!isLast && (
                <div className={`
            absolute left-[39px] top-8 bottom-[-20px] w-[2px] z-0
            transition-colors duration-500
            ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}
        `} />
            )}

            <div className={`
        relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-6 shrink-0
        transition-all duration-500
        ${isActive
                    ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-110'
                    : isCompleted
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-200 bg-white'
                }
      `}>
                {isCompleted && <Check size={12} className="text-white" strokeWidth={3} />}
                {isActive && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>

            <div className="flex flex-col justify-center h-full">
                <h2 className={`
            text-sm font-bold tracking-tight transition-colors duration-300
            ${isActive ? 'text-slate-900 text-base' : isCompleted ? 'text-slate-500' : 'text-slate-400'}
        `}>
                    {title}
                </h2>
                {isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-0.5">Completed</span>
                )}
            </div>

            {isPending && (
                <div className="ml-auto opacity-20 text-slate-400">
                    <Lock size={16} />
                </div>
            )}
        </div>
    );
};
