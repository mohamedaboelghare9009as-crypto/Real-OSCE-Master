import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ 
  percentage, 
  size = 'md',
  showLabel = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'sm':
        return 'text-[10px]';
      case 'lg':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  const getColor = () => {
    if (percentage >= 70) return 'from-emerald-500 to-emerald-400';
    if (percentage >= 40) return 'from-amber-500 to-amber-400';
    return 'from-red-500 to-red-400';
  };

  const getLabel = () => {
    if (percentage >= 80) return 'High Confidence';
    if (percentage >= 50) return 'Moderate';
    if (percentage >= 20) return 'Uncertain';
    return 'Low Confidence';
  };

  return (
    <div className="w-full">
      <div className={`relative ${getSizeClasses()} bg-slate-200 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${getColor()}`}
        />
      </div>
      {showLabel && (
        <div className={`flex justify-between mt-1 ${getLabelSize()}`}>
          <span className="font-medium text-slate-600">{getLabel()}</span>
          <span className="text-slate-400">{percentage}%</span>
        </div>
      )}
    </div>
  );
};

export default ConfidenceMeter;
