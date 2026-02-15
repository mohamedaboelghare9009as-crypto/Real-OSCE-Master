import React from 'react';

interface GlassContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'card';
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', variant = 'card' }) => {
    const baseStyles = variant === 'primary'
        ? 'bg-gradient-to-br from-slate-900/80 via-blue-900/30 backdrop-blur-3xl border border-white/10 rounded-[2rem]'
        : 'backdrop-blur-xl bg-white/5 border border-white/10 rounded-[1.5rem]';

    return (
        <div className={`${baseStyles} ${className}`}>
            {children}
        </div>
    );
};

export default GlassContainer;
