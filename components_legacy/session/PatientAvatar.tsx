import React from 'react';
import { motion } from 'framer-motion';
import GlassContainer from './GlassContainer';

interface PatientAvatarProps {
    image: string;
    isSpeaking?: boolean;
    isInPain?: boolean;
}

const PatientAvatar: React.FC<PatientAvatarProps> = ({ image, isSpeaking, isInPain }) => {
    return (
        <GlassContainer className="relative overflow-hidden w-full h-[400px] md:h-[500px] p-0 border-none group">
            <motion.img
                src={image}
                alt="Patient"
                className="w-full h-full object-cover"
                animate={{
                    scale: isSpeaking ? [1, 1.02, 1] : 1,
                    filter: isInPain ? 'sepia(0.2) saturate(1.5) hue-rotate(-20deg)' : 'none'
                }}
                transition={{
                    duration: 1.5,
                    repeat: isSpeaking ? Infinity : 0,
                    ease: "easeInOut"
                }}
            />

            {/* Speaking Indicator / Waveform Overlay */}
            {isSpeaking && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 h-8">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 bg-emerald-400 rounded-full"
                            animate={{ height: [12, 32, 12] }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Pain Indicator */}
            {isInPain && (
                <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
            )}
        </GlassContainer>
    );
};

export default PatientAvatar;
