import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, X, Check, AlertCircle, MoreHorizontal } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';
import EvidenceTag from './EvidenceTag';

export type DiagnosisStatus = 'supported' | 'uncertain' | 'contradicted' | 'working';

export interface Evidence {
  id: string;
  text: string;
  type: 'supporting' | 'contradicting' | 'neutral';
  source?: string;
}

export interface DDxItem {
  id: string;
  diagnosis: string;
  status: DiagnosisStatus;
  confidence: number;
  evidence: Evidence[];
  notes?: string;
  timestamp: number;
}

interface DiagnosisCardProps {
  item: DDxItem;
  index: number;
  isDragging?: boolean;
  onStatusChange: (id: string, status: DiagnosisStatus) => void;
  onRemove: (id: string) => void;
  onNotesClick?: (id: string) => void;
  dragHandleProps?: any;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  item,
  index,
  isDragging,
  onStatusChange,
  onRemove,
  onNotesClick,
  dragHandleProps
}) => {
  const getStatusConfig = (status: DiagnosisStatus) => {
    switch (status) {
      case 'supported':
        return {
          bg: 'bg-emerald-50/80 border-emerald-200',
          headerBg: 'bg-emerald-100/50',
          icon: Check,
          iconColor: 'text-emerald-600',
          badge: 'bg-emerald-500 text-white',
          label: 'Supported'
        };
      case 'contradicted':
        return {
          bg: 'bg-red-50/80 border-red-200',
          headerBg: 'bg-red-100/50',
          icon: X,
          iconColor: 'text-red-600',
          badge: 'bg-red-500 text-white',
          label: 'Contradicted'
        };
      case 'working':
        return {
          bg: 'bg-[#0474b8]/5 border-[#0474b8]/30',
          headerBg: 'bg-[#0474b8]/10',
          icon: AlertCircle,
          iconColor: 'text-[#0474b8]',
          badge: 'bg-[#0474b8] text-white',
          label: 'Working'
        };
      default:
        return {
          bg: 'bg-amber-50/80 border-amber-200',
          headerBg: 'bg-amber-100/50',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          badge: 'bg-amber-500 text-white',
          label: 'Uncertain'
        };
    }
  };

  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  const supportingEvidence = item.evidence.filter(e => e.type === 'supporting');
  const contradictingEvidence = item.evidence.filter(e => e.type === 'contradicting');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`
        relative rounded-xl border-2 overflow-hidden transition-all duration-200
        ${statusConfig.bg}
        ${isDragging ? 'shadow-lg scale-[1.02] z-10' : 'shadow-sm hover:shadow-md'}
      `}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/5 transition-colors"
        aria-label="Drag to reorder diagnosis"
      >
        <GripVertical size={14} className="text-slate-400" />
      </div>

      <div className="pl-6 pr-3 py-3">
        {/* Header */}
        <div className={`flex items-start justify-between gap-2 mb-2 rounded-lg p-2 ${statusConfig.headerBg}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIcon size={16} className={statusConfig.iconColor} />
            <span className="font-semibold text-slate-800 truncate">
              {index + 1}. {item.diagnosis}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig.badge}`}>
              {statusConfig.label}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 hover:bg-red-100 rounded-full transition-colors group"
              aria-label={`Remove ${item.diagnosis}`}
            >
              <X size={14} className="text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mb-3 px-2">
          <ConfidenceMeter percentage={item.confidence} size="sm" />
        </div>

        {/* Evidence Tags */}
        {(supportingEvidence.length > 0 || contradictingEvidence.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-2 px-2">
            {supportingEvidence.slice(0, 2).map((ev, i) => (
              <EvidenceTag key={ev.id} type="supporting" text={ev.text} />
            ))}
            {contradictingEvidence.slice(0, 1).map((ev, i) => (
              <EvidenceTag key={ev.id} type="contradicting" text={ev.text} />
            ))}
            {item.evidence.length > 3 && (
              <EvidenceTag type="neutral" text={`+${item.evidence.length - 3} more`} />
            )}
          </div>
        )}

        {/* Status Toggles */}
        <div className="flex gap-1 px-2 pt-1">
          {(['working', 'supported', 'uncertain', 'contradicted'] as DiagnosisStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(item.id, status)}
              className={`
                flex-1 px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide transition-all
                ${item.status === status
                  ? status === 'supported'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : status === 'contradicted'
                    ? 'bg-red-500 text-white shadow-sm'
                    : status === 'working'
                    ? 'bg-[#0474b8] text-white shadow-sm'
                    : 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'
              }
              `}
              aria-pressed={item.status === status}
              aria-label={`Mark as ${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DiagnosisCard;
