'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
    {
        title: "Neural Ingestion",
        description: "Securely upload raw patient history, vitals, and lab results. Our system standardizes 50+ data formats instantly.",
        id: "01"
    },
    {
        title: "Synaptic Processing",
        description: "The AI cross-references symptoms against 20 million clinical cases to identify subtle patterns invisible to the human eye.",
        id: "02"
    },
    {
        title: "Diagnostic Output",
        description: "Receive a probability-weighted differential diagnosis with recommended treatment pathways in under 300ms.",
        id: "03"
    }
];

const HowItWorks: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const svgRef = useRef<SVGSVGElement>(null);
    const drawPathRef = useRef<SVGPathElement>(null);
    const pulsePathRef = useRef<SVGPathElement>(null);

    const [pathD, setPathD] = useState<string>("");
    const [isMobile, setIsMobile] = useState(false);

    useLayoutEffect(() => {
        const calculatePath = () => {
            if (!containerRef.current || nodeRefs.current.length === 0) return;

            const width = window.innerWidth;
            if (width < 768) {
                setIsMobile(true);
                return;
            }
            setIsMobile(false);

            const containerRect = containerRef.current.getBoundingClientRect();
            const centerX = containerRect.width / 2;

            let d = `M ${centerX} 0`;

            nodeRefs.current.forEach((node) => {
                if (!node) return;
                const nodeRect = node.getBoundingClientRect();
                const relativeNodeY = nodeRect.top - containerRect.top + (nodeRect.height / 2);

                d += ` L ${centerX} ${relativeNodeY - 30}`;
                d += ` L ${centerX - 15} ${relativeNodeY - 10}`;
                d += ` L ${centerX + 15} ${relativeNodeY + 10}`;
                d += ` L ${centerX} ${relativeNodeY + 30}`;
            });

            d += ` L ${centerX} ${containerRect.height}`;

            setPathD(d);
        };

        calculatePath();

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(calculatePath);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    useGSAP(() => {
        if (isMobile || !pathD || !drawPathRef.current || !pulsePathRef.current) return;

        const pathLength = drawPathRef.current.getTotalLength();

        gsap.set([drawPathRef.current, pulsePathRef.current], {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
        });

        gsap.to(drawPathRef.current, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 40%",
                end: "bottom 80%",
                scrub: 1,
            }
        });

        const packetLength = 150;
        gsap.set(pulsePathRef.current, {
            strokeDasharray: `${packetLength} ${pathLength}`,
            strokeDashoffset: pathLength,
            opacity: 0.6
        });

        const pulseTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        pulseTl.fromTo(pulsePathRef.current,
            { strokeDashoffset: pathLength },
            { strokeDashoffset: -packetLength, duration: 2.5, ease: "linear" }
        );

        nodeRefs.current.forEach((node, index) => {
            const card = cardRefs.current[index];
            if (!node || !card) return;

            ScrollTrigger.create({
                trigger: node,
                start: "top 60%",
                onEnter: () => {
                    gsap.to(node, {
                        backgroundColor: "#10b981",
                        boxShadow: "0 0 25px #10b981",
                        borderColor: "#10b981",
                        scale: 1.1,
                        duration: 0.4
                    });
                    gsap.fromTo(card,
                        { opacity: 0, y: 20, filter: "blur(10px)" },
                        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
                    );
                },
                onLeaveBack: () => {
                    gsap.to(node, {
                        backgroundColor: "#020617",
                        boxShadow: "none",
                        borderColor: "#334155",
                        scale: 1,
                        duration: 0.4
                    });
                }
            });
        });

    }, { dependencies: [pathD, isMobile], scope: containerRef });

    return (
        <section ref={containerRef} className="relative w-full py-32 bg-[#0b1120] overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[100px]" />
            </div>
            {!isMobile && (
                <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path d={pathD} stroke="#1e293b" strokeWidth="2" fill="none" />
                    <path ref={drawPathRef} d={pathD} stroke="#10b981" strokeWidth="2" fill="none" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
                    <path ref={pulsePathRef} d={pathD} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
            )}
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-32">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">The Neural Architecture</h2>
                    <p className="text-slate-400">Processing speed of a supercomputer. Nuance of a specialist.</p>
                </div>
                <div className="flex flex-col gap-24 md:gap-40">
                    {steps.map((step, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={step.id} className={`relative w-full flex flex-col md:grid md:grid-cols-[1fr_60px_1fr] md:gap-0 ${isMobile ? 'pl-8 border-l border-slate-800' : ''}`}>
                                <div className={`md:flex md:justify-end md:pr-12 ${isEven ? 'order-2 md:order-1' : 'md:order-3'}`}>
                                    {(!isMobile && isEven) && (
                                        <div ref={el => { cardRefs.current[index] = el }} className="text-right opacity-0">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-500 font-mono text-xs tracking-widest">
                                                STEP {step.id}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                                            <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                        </div>
                                    )}
                                </div>
                                <div className={`relative flex items-center justify-center ${isMobile ? 'absolute -left-[45px] top-0 h-full w-[30px]' : 'order-1 md:order-2 h-full'}`}>
                                    <div ref={el => { nodeRefs.current[index] = el }} className={`w-4 h-4 rounded-full bg-[#020617] border-2 border-slate-700 z-20 transition-all duration-300 ${isMobile ? 'mt-2' : ''}`} />
                                </div>
                                <div className={`md:flex md:justify-start md:pl-12 ${isEven ? 'md:order-3' : 'order-2 md:order-3'}`}>
                                    {(!isMobile && !isEven) && (
                                        <div ref={el => { cardRefs.current[index] = el }} className="text-left opacity-0">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-500 font-mono text-xs tracking-widest">
                                                STEP {step.id}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                                            <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                        </div>
                                    )}
                                    {isMobile && (
                                        <div className="pt-1 pb-12">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-500 font-mono text-xs tracking-widest">
                                                STEP {step.id}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                                            <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
