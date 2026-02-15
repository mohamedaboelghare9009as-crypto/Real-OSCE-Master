import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HowItWorks: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const pulseRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // EKG Line Drawing Animation
        if (pathRef.current && sectionRef.current) {
            const pathLength = pathRef.current.getTotalLength();

            // Set initial state (hidden)
            gsap.set(pathRef.current, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength
            });

            gsap.to(pathRef.current, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 1,
                }
            });
        }

        // Pulse dot following the line (simplified approximation)
        /*
        gsap.to(pulseRef.current, {
            offsetDistance: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "bottom center",
                scrub: 1,
            }
        });
        */

    }, { scope: sectionRef });

    const steps = [
        { title: "Select Case", desc: "Choose from 50+ diverse clinical scenarios." },
        { title: "Interview", desc: "Voice-driven dialogue with AI patient avatars." },
        { title: "Diagnose", desc: "Submit differential diagnosis and care plan." },
        { title: "Feedback", desc: "Instant grading on empathy and accuracy." },
    ];

    return (
        <section ref={sectionRef} className="w-full bg-[#0b1120] py-32 px-6 relative overflow-hidden">

            <div className="max-w-5xl mx-auto relative">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-24 text-center">
                    How It Works
                </h2>

                {/* EKG SVG Background */}
                <div className="absolute top-20 left-0 w-full h-full opacity-30 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" preserveAspectRatio="none">
                        <path
                            ref={pathRef}
                            d="M 400 0 V 100 L 350 150 L 450 250 L 380 320 L 400 350 V 600"
                            stroke="#10b981"
                            strokeWidth="4"
                            fill="none"
                        />
                    </svg>
                </div>

                {/* Steps */}
                <div className="relative z-10 space-y-24">
                    {steps.map((step, i) => (
                        <div key={i} className={`flex items-center ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-xl hover:border-emerald-500/50 transition-colors">
                                <div className="text-emerald-500 font-mono text-xl mb-2">0{i + 1}</div>
                                <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;
