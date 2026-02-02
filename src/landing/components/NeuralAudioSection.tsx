import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Environment } from '@react-three/drei';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import * as THREE from 'three';

type VoiceState = 'LISTENING' | 'SPEAKING' | 'FORGET';

const CONFIG = {
    LISTENING: {
        color: "#F59E0B",
        orbSpeed: 1.5,
        orbDistort: 0.3,
        text: "Processing symptom timeline...",
    },
    SPEAKING: {
        color: "#D97706",
        orbSpeed: 4,
        orbDistort: 0.5,
        text: "I started feeling it yesterday.",
    },
    FORGET: {
        color: "#b45309",
        orbSpeed: 12,
        orbDistort: 1.2,
        text: "Wait... did I tell you about the pain? I forgot.",
    }
};

const VoiceOrb = ({ voiceState }: { voiceState: VoiceState }) => {
    const materialRef = useRef<any>(null);
    const targetConfig = CONFIG[voiceState];
    const colorRef = useRef(new THREE.Color(targetConfig.color));

    useFrame((state, delta) => {
        if (!materialRef.current) return;
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetConfig.orbDistort, delta * 2);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetConfig.orbSpeed, delta * 2);
        const targetColor = new THREE.Color(targetConfig.color);
        colorRef.current.lerp(targetColor, delta * 3);
        materialRef.current.color = colorRef.current;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[1, 64, 64]} scale={2.4}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color={targetConfig.color}
                    envMapIntensity={0.6}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.2}
                    roughness={0.2}
                    distort={0.3}
                    speed={1.5}
                />
            </Sphere>
            <Sphere args={[0.85, 32, 32]}>
                <meshBasicMaterial color={targetConfig.color} transparent opacity={0.2} />
            </Sphere>
        </Float>
    );
};

const WaveformCircle = ({ voiceState }: { voiceState: VoiceState }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const barsRef = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(() => {
        barsRef.current.forEach((bar, i) => {
            if (!bar) return;
            gsap.killTweensOf(bar);

            const colorClass = 'bg-osce-orange shadow-[0_0_15px_rgba(245,158,11,0.6)]';
            bar.className = `w-1 rounded-full transition-colors duration-500 ${colorClass}`;

            if (voiceState === 'LISTENING') {
                gsap.to(bar, { height: gsap.utils.random(8, 16), duration: gsap.utils.random(0.8, 1.2), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.1 });
            } else if (voiceState === 'SPEAKING') {
                gsap.to(bar, { height: gsap.utils.random(12, 32), duration: gsap.utils.random(0.1, 0.25), repeat: -1, yoyo: true, ease: "power1.inOut", delay: i * 0.05 });
            } else if (voiceState === 'FORGET') {
                gsap.to(bar, { height: gsap.utils.random(8, 24), duration: 0.1, repeat: -1, yoyo: true, ease: "steps(2)", delay: Math.random() * 0.1 });
            }
        });
    }, { dependencies: [voiceState], scope: containerRef });

    return (
        <div ref={containerRef} className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-xl border border-osce-navy/10 flex items-center justify-center gap-1 shadow-lg z-20">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} ref={(el) => { barsRef.current[i] = el }} className="w-1 bg-osce-orange rounded-full h-4" />)}
        </div>
    );
};

const NeuralAudioSection: React.FC = () => {
    const [voiceState, setVoiceState] = useState<VoiceState>('LISTENING');

    useEffect(() => {
        const sequence = [{ state: 'LISTENING', duration: 4000 }, { state: 'SPEAKING', duration: 3000 }, { state: 'FORGET', duration: 2500 }];
        let currentIndex = 0;
        let timerId: ReturnType<typeof setTimeout>;
        const runSequence = () => {
            const currentStep = sequence[currentIndex];
            setVoiceState(currentStep.state as VoiceState);
            currentIndex = (currentIndex + 1) % sequence.length;
            timerId = setTimeout(runSequence, currentStep.duration);
        };
        runSequence();
        return () => clearTimeout(timerId);
    }, []);

    const currentConfig = CONFIG[voiceState];

    return (
        <section className="relative w-full min-h-[80vh] md:min-h-screen bg-osce-blue overflow-hidden flex flex-col items-center justify-center py-20">
            <div className="absolute inset-0 z-0">
                <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#F59E0B" />
                    <pointLight position={[-10, -5, -10]} intensity={1} color="#003366" />
                    <Environment preset="city" />
                    <VoiceOrb voiceState={voiceState} />
                </Canvas>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl space-y-8 pointer-events-none">
                <div className="pointer-events-auto transition-transform hover:scale-110 duration-300">
                    <WaveformCircle voiceState={voiceState} />
                </div>
                <div className="min-h-[120px] flex items-center justify-center">
                    <h3 key={voiceState} className="text-3xl md:text-5xl font-bold tracking-tight text-osce-navy transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                        "{currentConfig.text}"
                    </h3>
                </div>
                <p className="text-osce-navy/70 max-w-lg mx-auto text-lg leading-relaxed font-medium">
                    Experience AI patients that don't just read a script—they have real clinical anxiety, memory lapses, and evolving symptoms.
                </p>
                <div className="pointer-events-auto pt-4">
                    <button className="group relative px-8 py-4 bg-osce-navy text-white rounded-full font-bold text-lg hover:bg-osce-orange transition-colors duration-300 shadow-xl overflow-hidden">
                        <span className="relative z-10">Test Voice Engine</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NeuralAudioSection;
