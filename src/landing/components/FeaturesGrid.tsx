import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FeaturesGrid: React.FC = () => {
    const gridRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
    const countObj = useRef({ value: 0 });
    const countTextRef = useRef<HTMLSpanElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!gridRef.current) return;
        cardsRef.current.forEach((card) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    };

    useGSAP(() => {
        if (countTextRef.current) {
            gsap.to(countObj.current, {
                value: 23,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: { trigger: countTextRef.current, start: "top 85%" },
                onUpdate: () => {
                    if (countTextRef.current) countTextRef.current.innerText = `${Math.round(countObj.current.value)}%`;
                }
            });
        }

        gsap.from(cardsRef.current, {
            y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 80%" }
        });
    }, { scope: gridRef });

    return (
        <section className="w-full bg-osce-blue py-24 px-6 relative overflow-hidden">

            <div className="max-w-7xl mx-auto mb-16 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-osce-navy mb-4 tracking-tight">
                    Clinical <span className="text-transparent bg-clip-text bg-osce-gold">Intelligence</span>
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto font-medium">
                    Holographic interface systems designed to replicate the pressure of real-world medicine.
                </p>
            </div>

            <div
                ref={gridRef}
                onMouseMove={handleMouseMove}
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 group relative z-10"
            >

                <div
                    ref={(el) => { cardsRef.current[0] = el }}
                    className="relative h-64 md:h-80 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-8 transition-colors hover:border-osce-orange shadow-lg"
                >
                    <div
                        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245, 158, 11, 0.2), transparent 40%)` }}
                    />
                    <div className="flex gap-2 items-center h-24 mb-6">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-4 bg-osce-navy rounded-full animate-equalizer" style={{ animationDelay: `${i * 0.15}s`, height: '20%' }} />
                        ))}
                    </div>
                    <h3 className="relative z-10 text-xl font-bold text-osce-navy">Voice Recognition</h3>
                    <p className="relative z-10 text-slate-600 text-sm mt-2 text-center">Natural language processing that detects hesitation.</p>
                </div>

                <div
                    ref={(el) => { cardsRef.current[1] = el }}
                    className="relative h-64 md:h-80 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-8 transition-colors hover:border-osce-orange shadow-lg"
                >
                    <div
                        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245, 158, 11, 0.2), transparent 40%)` }}
                    />
                    <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute left-0 right-0 h-[2px] bg-osce-orange shadow-[0_0_20px_rgba(245,158,11,1)] animate-scanline" />
                    </div>
                    <div className="relative z-10 bg-osce-navy/10 px-4 py-2 rounded-lg border border-osce-navy/20">
                        <span className="text-osce-navy font-mono text-xs tracking-widest uppercase font-bold">Analysis Complete</span>
                    </div>
                    <h3 className="relative z-10 text-xl font-bold text-osce-navy mt-6">Instant Feedback</h3>
                    <p className="relative z-10 text-slate-600 text-sm mt-2 text-center">Automated error detection scans for clinical red flags.</p>
                </div>

                <div
                    ref={(el) => { cardsRef.current[2] = el }}
                    className="relative h-64 md:h-80 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-8 transition-colors hover:border-osce-orange shadow-lg"
                >
                    <div
                        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245, 158, 11, 0.2), transparent 40%)` }}
                    />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-osce-navy tracking-tighter" ref={countTextRef}>0%</span>
                            <span className="text-osce-orange text-xl font-bold">↑</span>
                        </div>
                        <span className="text-osce-darkOrange font-mono text-xs uppercase tracking-widest mt-2 font-bold">Pass Rate Increase</span>
                    </div>
                    <h3 className="relative z-10 text-xl font-bold text-osce-navy mt-6">Performance Lift</h3>
                    <p className="relative z-10 text-slate-600 text-sm mt-2 text-center">Students using active recall simulation score higher.</p>
                </div>

            </div>
        </section>
    );
};

export default FeaturesGrid;
