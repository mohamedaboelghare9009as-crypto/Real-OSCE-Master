import React from 'react';
import { PatientEmotion } from '@/types';
import VoiceReactiveSphere from '../VoiceReactiveSphere';

interface AvatarProps {
    type: 'patient' | 'nurse';
    emotion: PatientEmotion;
    className?: string;
    patientName?: string;
    audioLevel?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ 
    type, 
    emotion, 
    className = '', 
    patientName,
    audioLevel = 0
}) => {
    const isPatient = type === 'patient';
    const isSpeaking = emotion === PatientEmotion.SPEAKING;

    return (
        <div className={`relative flex flex-col items-center justify-center ${className}`}>
            {/* Voice Reactive Sphere replaces static image */}
            <VoiceReactiveSphere
                isActive={isSpeaking}
                intensity={audioLevel}
                color={isPatient ? '#3b82f6' : '#8b5cf6'}
                size={isPatient ? 'lg' : 'sm'}
                mode={type}
            />

            <div className="mt-6 text-center">
                <h3 className={`font-medium tracking-tight text-slate-700 ${isPatient ? 'text-lg' : 'text-xs'}`}>
                    {isPatient ? (patientName || "Patient") : "Triage Nurse"}
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
