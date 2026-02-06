import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Helper for Scramble Text Effect
const useScrambleText = (targetText: string, triggerRef: React.RefObject<HTMLElement>) => {
    const [display, setDisplay] = useState(targetText.split('').map(() => '#').join(''));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

    useGSAP(() => {
        if (!triggerRef.current) return;

        ScrollTrigger.create({
            trigger: triggerRef.current,
            start: "top 80%",
            onEnter: () => {
                let iterations = 0;
                const interval = setInterval(() => {
                    setDisplay(prev =>
                        targetText.split('').map((char, index) => {
                            if (index < iterations) return targetText[index];
                            return chars[Math.floor(Math.random() * chars.length)];
                        }).join('')
                    );

                    if (iterations >= targetText.length) clearInterval(interval);
                    iterations += 1 / 2; // Speed control
                }, 30);
            }
        });
    }, { scope: triggerRef });

    return display;
};

const ContentSection: React.FC = () => {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrambleRef = useRef<HTMLHeadingElement>(null);

    const scrambledWord = useScrambleText("PRECISION_FAILURE", scrambleRef);

    useGSAP(() => {
        // 1. Staggered Entry for cards
        gsap.from(".anim-item", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
            }
        });

        // 2. Parallax Floating Elements
        gsap.to(".parallax-bg", {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                scrub: true,
            }
        });

    }, { scope: sectionRef });

    return (
        <div
            ref={sectionRef}
            className="relative z-10 w-full min-h-screen bg-[#0b1120] text-white flex flex-col items-center py-32 px-6 overflow-hidden transition-colors duration-700"
        >
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#020617] to-[#0b1120] z-0 pointer-events-none" />

            {/* Parallax Elements (Floating Stethoscopes/Books abstract representation) */}
            <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full border border-sky-900/30 parallax-bg opacity-50 blur-sm" />
            <div className="absolute bottom-1/4 right-10 w-64 h-64 rounded-full border border-indigo-900/20 parallax-bg opacity-30" />

            <div ref={containerRef} className="max-w-6xl w-full z-10 space-y-24">

                {/* Section Header */}
                <div className="text-center space-y-6">
                    <div className="inline-block px-3 py-1 rounded-full border border-sky-800 bg-sky-950/30 text-sky-400 font-mono text-xs tracking-wider uppercase anim-item">
                        System Analysis
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight anim-item">
                        Stop fearing <br />
                        <span ref={scrambleRef} className="text-rose-500 font-mono">
                            {scrambledWord}
                        </span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-400 text-lg anim-item">
                        Traditional medical training is static. OSCE Master is dynamic.
                        We simulate the chaos of real clinical environments so you can master the calm.
                    </p>
                </div>

                {/* Feature Grid (Bento Style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Voice AI */}
                    <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/50 transition-colors duration-500 anim-item overflow-hidden md:col-span-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Voice-Reactive AI</h3>
                            <p className="text-slate-400">Practice history taking with patients that talk back, interrupt, and get confused.</p>
                        </div>
                        {/* Simulated Waveform Visualizer */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-between px-8 pb-8 gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-2 bg-sky-400 rounded-t-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Metrics */}
                    <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-colors duration-500 anim-item">
                        <h3 className="text-2xl font-bold mb-2">Real-time Metrics</h3>
                        <div className="mt-8 space-y-3 font-mono text-sm text-slate-300">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Empathy</span>
                                <span className="text-emerald-400">98%</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Accuracy</span>
                                <span className="text-emerald-400">94%</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span>Timing</span>
                                <span className="text-amber-400">85%</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* CTA */}
                <div className="flex justify-center anim-item pt-12">
                    <button
                        onClick={() => navigate('/auth')}
                        className="px-10 py-5 bg-white text-slate-950 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Start Simulation
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ContentSection;
