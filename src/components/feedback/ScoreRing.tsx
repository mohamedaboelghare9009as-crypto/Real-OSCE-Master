import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    showPercentage?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
    score,
    size = 180,
    strokeWidth = 12,
    label = 'Overall Score',
    showPercentage = true
}) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedScore / 100) * circumference;

    // Determine color based on score
    const getColor = (score: number) => {
        if (score >= 70) return { primary: '#10b981', secondary: '#d1fae5', text: 'text-emerald-600' };
        if (score >= 50) return { primary: '#f59e0b', secondary: '#fef3c7', text: 'text-amber-600' };
        return { primary: '#ef4444', secondary: '#fee2e2', text: 'text-red-600' };
    };

    const colors = getColor(score);

    useEffect(() => {
        // Animate the score from 0 to target
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);
        return () => clearTimeout(timer);
    }, [score]);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <motion.span
                    className={`text-4xl font-bold ${colors.text}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {showPercentage ? `${Math.round(animatedScore)}%` : Math.round(animatedScore)}
                </motion.span>
                <span className="text-sm text-gray-500 font-medium mt-1">{label}</span>
            </div>
        </div>
    );
};
