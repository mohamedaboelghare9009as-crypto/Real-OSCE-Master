import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATS = [
    { value: 73, label: "feel significant OSCE anxiety" },
    { value: 68, label: '"knew it" but couldn\'t say it' },
    { value: 41, label: "cite freezing as why they failed" }
];

const TunnelVisionSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLDivElement>(null);

    const statRefs = useRef<(HTMLDivElement | null)[]>([]);
    const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            gsap.set(statRefs.current, { y: 150, opacity: 0, scale: 0.95 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=200%",
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                }
            });

            tl.to(headlineRef.current, {
                y: -180,
                scale: 0.8,
                opacity: 0.5,
                duration: 4,
                ease: "power2.inOut"
            }, 0);

            tl.to(statRefs.current[0], { y: 0, opacity: 1, scale: 1, duration: 2, ease: "back.out(1.2)" }, 1);
            tl.call(() => animateCounter(0), [], 2);

            tl.to(statRefs.current[1], { y: 0, opacity: 1, scale: 1, duration: 2, ease: "back.out(1.2)" }, 3);
            tl.call(() => animateCounter(1), [], 4);

            tl.to(statRefs.current[2], { y: 0, opacity: 1, scale: 1, duration: 2, ease: "back.out(1.2)" }, 5);
            tl.call(() => animateCounter(2), [], 6);

            tl.to({}, { duration: 2 });
        });

        mm.add("(max-width: 767px)", () => {
            gsap.set(statRefs.current, { y: 30, opacity: 0 });
            statRefs.current.forEach((el, i) => {
                if (!el) return;
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
                        animateCounter(i);
                    }
                });
            });
        });

        const animateCounter = (index: number) => {
            const el = numberRefs.current[index];
            if (!el) return;
            const target = STATS[index].value;
            const proxy = { val: 0 };
            gsap.to(proxy, {
                val: target,
                duration: 1.5,
                ease: "power2.out",
                onUpdate: () => { el.innerText = `${Math.round(proxy.val)}%`; },
                overwrite: true
            });
        };
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative w-full bg-osce-navy text-white z-20">
            <div ref={contentRef} className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center h-full justify-center">

                    <div ref={headlineRef} className="text-center relative z-30 transform-gpu mb-12 md:mb-0">
                        <div className="inline-block px-3 py-1 border border-osce-orange/50 bg-osce-orange/10 text-osce-orange font-mono text-xs tracking-[0.2em] mb-4 uppercase rounded-sm">
                            Clinical Panic Protocol
                        </div>
                        <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6">
                            Knowing ≠ Performing
                        </h2>
                        <p className="text-xl text-osce-blue max-w-2xl mx-auto font-light">
                            You can ace every practice question and still <span className="text-white font-medium border-b border-osce-orange">freeze on exam day</span>.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:mt-20 md:max-w-6xl md:px-6 pointer-events-none">
                        {STATS.map((stat, i) => (
                            <div key={i} ref={el => { statRefs.current[i] = el }} className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:border-osce-orange/50 pointer-events-auto">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="mb-4">
                                        <span ref={el => { numberRefs.current[i] = el }} className="text-7xl md:text-8xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">0%</span>
                                    </div>
                                    <div className="h-px w-12 bg-white/10 mb-4 group-hover:bg-osce-orange transition-colors" />
                                    <p className="text-slate-300 font-medium text-lg leading-relaxed">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TunnelVisionSection;
