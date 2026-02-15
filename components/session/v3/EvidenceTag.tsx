import React from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, X } from 'lucide-react';

interface EvidenceTagProps {
  type: 'supporting' | 'contradicting' | 'neutral';
  text: string;
  count?: number;
}

const EvidenceTag: React.FC<EvidenceTagProps> = ({ type, text, count }) => {
  const getStyles = () => {
    switch (type) {
      case 'supporting':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'contradicting':
        return 'bg-red-500/10 text-red-700 border-red-500/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'supporting':
        return <Check size={10} className="text-emerald-600" />;
      case 'contradicting':
        return <X size={10} className="text-red-600" />;
      default:
        return <AlertCircle size={10} className="text-slate-500" />;
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}
    >
      {getIcon()}
      <span className="truncate max-w-[100px]">{text}</span>
      {count !== undefined && count > 1 && (
        <span className="ml-1 text-[10px] opacity-75">({count})</span>
      )}
    </motion.span>
  );
};

export default EvidenceTag;
