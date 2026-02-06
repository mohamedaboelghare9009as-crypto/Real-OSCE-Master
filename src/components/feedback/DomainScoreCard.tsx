import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DomainScoreCardProps {
    title: string;
    icon: LucideIcon;
    obtained: number;
    total: number;
    onClick?: () => void;
}

export const DomainScoreCard: React.FC<DomainScoreCardProps> = ({
    title,
    icon: Icon,
    obtained,
    total,
    onClick
}) => {
    const percentage = Math.round((obtained / total) * 100);

    const getColors = () => {
        if (percentage >= 70) return {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: 'bg-emerald-100 text-emerald-600',
            bar: 'bg-emerald-500',
            text: 'text-emerald-600'
        };
        if (percentage >= 50) return {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: 'bg-amber-100 text-amber-600',
            bar: 'bg-amber-500',
            text: 'text-amber-600'
        };
        return {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'bg-red-100 text-red-600',
            bar: 'bg-red-500',
            text: 'text-red-600'
        };
    };

    const colors = getColors();

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-xl border ${colors.bg} ${colors.border} hover:shadow-md transition-all group text-left`}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                    <Icon size={18} />
                </div>
                <span className="font-semibold text-gray-800 text-sm">{title}</span>
            </div>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <span className={`text-2xl font-bold ${colors.text}`}>{obtained}</span>
                    <span className="text-gray-400 text-sm font-medium">/{total}</span>
                </div>
                <span className={`text-sm font-bold ${colors.text}`}>{percentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </button>
    );
};
