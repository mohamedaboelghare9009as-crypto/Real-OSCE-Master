import React from 'react';
import { PatientEmotion } from '../../../types';

interface AvatarProps {
    type: 'patient' | 'nurse';
    emotion: PatientEmotion;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ type, emotion, className = '' }) => {
    const isPatient = type === 'patient';

    const getAvatarColor = () => {
        if (!isPatient) return 'bg-sky-100';
        switch (emotion) {
            case PatientEmotion.PAIN: return 'bg-amber-100';
            case PatientEmotion.ANXIOUS: return 'bg-orange-50';
            case PatientEmotion.SPEAKING: return 'bg-slate-100';
            default: return 'bg-slate-100';
        }
    };

    const getBorderColor = () => {
        if (!isPatient) return 'border-sky-200';
        if (emotion === PatientEmotion.SPEAKING) return 'border-slate-300';
        if (emotion === PatientEmotion.PAIN) return 'border-amber-200';
        return 'border-slate-200';
    };

    return (
        <div className={`relative flex flex-col items-center justify-center ${className}`}>
            <div className={`
            relative flex items-center justify-center
            rounded-full backdrop-blur-xl
            border border-white/40 shadow-xl
            transition-colors duration-700 ease-in-out
            ${isPatient ? 'w-64 h-64 bg-white/30' : 'w-24 h-24 bg-white/50'}
        `}>
                <div className={`
                rounded-full overflow-hidden relative
                transition-all duration-500
                border-2
                ${getAvatarColor()}
                ${getBorderColor()}
                ${isPatient ? 'w-56 h-56' : 'w-20 h-20'}
            `}>
                    <img
                        src={isPatient ? "https://picsum.photos/400/400?grayscale" : "https://picsum.photos/200/200?blur=2"}
                        alt={type}
                        className={`object-cover w-full h-full opacity-80 mix-blend-multiply transition-transform duration-[2000ms] ${emotion === PatientEmotion.SPEAKING ? 'scale-110' : 'scale-100'}`}
                    />

                    {emotion === PatientEmotion.SPEAKING && (
                        <div className="absolute inset-0 bg-black/5 animate-pulse" />
                    )}
                </div>

                <div className={`
                absolute bottom-4 right-4 w-4 h-4 rounded-full border-2 border-white
                transition-colors duration-300
                ${emotion === PatientEmotion.SPEAKING ? 'bg-green-400' : 'bg-slate-300'}
            `} />
            </div>

            <div className="mt-6 text-center">
                <h3 className={`font-medium tracking-tight text-slate-700 ${isPatient ? 'text-lg' : 'text-xs'}`}>
                    {isPatient ? "Alex Mercer" : "Triage Nurse"}
                </h3>
                {isPatient && (
                    <p className="text-sm text-slate-400 font-light mt-1">
                        {emotion === PatientEmotion.PAIN ? "In Distress" : "Stable"}
                    </p>
                )}
            </div>
        </div>
    );
};
