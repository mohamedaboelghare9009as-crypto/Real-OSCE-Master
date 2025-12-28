import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  noPadding?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick, hoverEffect = false, noPadding = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-[1.75rem] shadow-soft border-none
        ${hoverEffect ? 'hover:translate-y-[-2px] hover:shadow-lg cursor-pointer transition-all duration-300 ease-out' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;