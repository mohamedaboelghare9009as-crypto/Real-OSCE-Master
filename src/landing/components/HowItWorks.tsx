import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
    { title: "Pick Your Station", description: "Choose from 200+ OSCE scenarios — cardio, respiratory, abdo, psych, peds, and more.", id: "01" },
    { title: "Run The Simulation", description: "Talk to an AI patient who responds, interrupts, and reacts — just like the real exam.", id: "02" },
    { title: "Get Your Feedback", description: "See exactly where you scored, what you missed, and how to improve — instantly.", id: "03" }
];

const HowItWorks: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const svgRef = useRef<SVGSVGElement>(null);
    const drawPathRef = useRef<SVGPathElement>(null);
    const sparkRef = useRef<SVGImageElement>(null);

    const [pathD, setPathD] = useState<string>("");
    const [isMobile, setIsMobile] = useState(false);

    useLayoutEffect(() => {
        const calculatePath = () => {
            if (!timelineRef.current || nodeRefs.current.length === 0) return;
            const width = window.innerWidth;
            if (width < 768) { setIsMobile(true); return; }
            setIsMobile(false);

            const timelineRect = timelineRef.current.getBoundingClientRect();
            const centerX = timelineRect.width / 2;
            let d = `M ${centerX} 0`;

            nodeRefs.current.forEach((node) => {
                if (!node) return;
                const nodeRect = node.getBoundingClientRect();
                const relativeNodeY = nodeRect.top - timelineRect.top + (nodeRect.height / 2);
                d += ` L ${centerX} ${relativeNodeY - 30}`;
                d += ` L ${centerX - 15} ${relativeNodeY - 10}`;
                d += ` L ${centerX + 15} ${relativeNodeY + 10}`;
                d += ` L ${centerX} ${relativeNodeY + 30}`;
            });

            d += ` L ${centerX} ${timelineRect.height}`;
            setPathD(d);
        };

        calculatePath();
        const resizeObserver = new ResizeObserver(() => requestAnimationFrame(calculatePath));
        if (timelineRef.current) resizeObserver.observe(timelineRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useGSAP(() => {
        if (isMobile || !pathD || !drawPathRef.current || !sparkRef.current) return;
        const pathLength = drawPathRef.current.getTotalLength();

        gsap.set(drawPathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(drawPathRef.current, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: timelineRef.current,
                start: "top 60%",
                end: "bottom 80%",
                scrub: 1,
                onUpdate: (self) => {
                    const point = drawPathRef.current!.getPointAtLength(self.progress * pathLength);
                    gsap.set(sparkRef.current, { x: point.x - 12, y: point.y - 12 });
                }
            }
        });

        nodeRefs.current.forEach((node, index) => {
            const card = cardRefs.current[index];
            if (!node || !card) return;
            ScrollTrigger.create({
                trigger: node, start: "top 70%",
                onEnter: () => {
                    gsap.to(node, { backgroundColor: "#F59E0B", boxShadow: "0 0 25px #F59E0B", borderColor: "#F59E0B", scale: 1.1, duration: 0.4 });
                    gsap.fromTo(card, { opacity: 0, y: 20, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" });
                },
                onLeaveBack: () => {
                    gsap.to(node, { backgroundColor: "#003366", boxShadow: "none", borderColor: "#1e293b", scale: 1, duration: 0.4 });
                }
            });
        });
    }, { dependencies: [pathD, isMobile], scope: sectionRef });

    return (
        <section ref={sectionRef} className="relative w-full py-32 bg-osce-blue overflow-hidden text-osce-navy">
            <div className="max-w-6xl mx-auto px-6 mb-24 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
                <p className="text-slate-600 font-medium text-lg">Three steps. Unlimited reps. Total confidence.</p>
            </div>

            <div ref={timelineRef} className="max-w-6xl mx-auto px-6 relative z-10">
                {!isMobile && (
                    <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>
                        <path d={pathD} stroke="#94a3b8" strokeWidth="2" fill="none" />
                        <path ref={drawPathRef} d={pathD} stroke="#F59E0B" strokeWidth="2" fill="none" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
                        <image ref={sparkRef} href="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/Symbol.png" width="24" height="24" />
                    </svg>
                )}

                <div className="flex flex-col gap-24 md:gap-40 pt-12">
                    {steps.map((step, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={step.id} className={`relative w-full flex flex-col md:grid md:grid-cols-[1fr_60px_1fr] md:gap-0 ${isMobile ? 'pl-8 border-l border-slate-300' : ''}`}>
                                <div className={`md:flex md:justify-end md:pr-12 ${isEven ? 'order-2 md:order-1' : 'md:order-3'}`}>
                                    {(!isMobile && isEven) && (
                                        <div ref={el => { cardRefs.current[index] = el }} className="text-right opacity-0">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-osce-orange/10 border border-osce-orange/30 text-osce-navy font-mono text-xs tracking-widest">STEP {step.id}</div>
                                            <h3 className="text-2xl font-bold mb-2 text-osce-navy">{step.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    )}
                                </div>
                                <div className={`relative flex items-center justify-center ${isMobile ? 'absolute -left-[45px] top-0 h-full w-[30px]' : 'order-1 md:order-2 h-full'}`}>
                                    <div ref={el => { nodeRefs.current[index] = el }} className={`w-4 h-4 rounded-full bg-osce-navy border-2 border-slate-300 z-20 transition-all duration-300 ${isMobile ? 'mt-2' : ''}`} />
                                </div>
                                <div className={`md:flex md:justify-start md:pl-12 ${isEven ? 'md:order-3' : 'order-2 md:order-3'}`}>
                                    {(!isMobile && !isEven) && (
                                        <div ref={el => { cardRefs.current[index] = el }} className="text-left opacity-0">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-osce-orange/10 border border-osce-orange/30 text-osce-navy font-mono text-xs tracking-widest">STEP {step.id}</div>
                                            <h3 className="text-2xl font-bold mb-2 text-osce-navy">{step.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    )}
                                    {isMobile && (
                                        <div className="pt-1 pb-12">
                                            <div className="inline-block px-2 py-1 mb-3 rounded bg-osce-orange/10 border border-osce-orange/30 text-osce-navy font-mono text-xs tracking-widest">STEP {step.id}</div>
                                            <h3 className="text-2xl font-bold mb-2 text-osce-navy">{step.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
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
