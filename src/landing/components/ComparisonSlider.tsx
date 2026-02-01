import React, { useState, useRef, useCallback } from 'react';
import { HelpCircle, PauseCircle, CloudFog, CheckCircle2, PlayCircle, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const COMPARISON_DATA = [
    { id: 1, old: { icon: HelpCircle, text: "Hope you remember", subtext: "Passive learning leaves gaps when the pressure is on." }, new: { icon: CheckCircle2, text: "Know it cold", subtext: "Active recall creates permanent neural pathways." } },
    { id: 2, old: { icon: PauseCircle, text: "Freeze off-script", subtext: "Static cases don't prepare you for real clinical chaos." }, new: { icon: PlayCircle, text: "Adapt instantly", subtext: "Dynamic AI throws curveballs you can actually handle." } },
    { id: 3, old: { icon: CloudFog, text: "Unsure outcome", subtext: "Subjective feedback leaves you guessing about performance." }, new: { icon: Activity, text: "Precision scoring", subtext: "Data-driven grading tracks every micro-second of care." } }
];

const ComparisonSlider: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderPosition, setSliderPosition] = useState(50);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const percentage = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(100, Math.max(0, percentage)));
    }, []);

    const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: React.TouchEvent) => { if (e.touches && e.touches.length > 0) handleMove(e.touches[0].clientX); };

    return (
        <section className="w-full bg-osce-blue py-24 px-6 flex flex-col items-center gap-16 overflow-hidden">

            <div className="text-center max-w-4xl mx-auto space-y-6">
                <div className="inline-block px-3 py-1 border border-osce-navy/30 bg-osce-navy/10 text-osce-navy font-mono text-xs tracking-[0.2em] uppercase">
                    Evolution of Training
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-bold text-osce-navy tracking-tight">The Shift</h2>
                    <p className="text-xl text-slate-600 font-light">Old Way vs. Mastering</p>
                </div>
            </div>

            <div ref={containerRef} className="relative w-full max-w-6xl mx-auto rounded-3xl border border-white bg-white overflow-hidden select-none cursor-ew-resize touch-none group shadow-2xl grid" onMouseMove={onMouseMove} onTouchMove={onTouchMove} onTouchStart={onTouchMove}>

                <div className="col-start-1 row-start-1 w-full h-full flex flex-col justify-center p-12 md:p-16 bg-[#EDF5FF] relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003366 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10 pointer-events-none">
                        {COMPARISON_DATA.map((row) => (
                            <div key={row.id} className="flex flex-col items-start text-left gap-4">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-osce-navy/10 border border-osce-navy/20 flex items-center justify-center text-osce-navy shadow-sm">
                                    <row.new.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-osce-navy drop-shadow-sm">{row.new.text}</h3>
                                    <p className="text-sm text-slate-600 font-mono mt-2 leading-relaxed">{row.new.subtext}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-start-1 row-start-1 w-full h-full flex flex-col justify-center p-12 md:p-16 bg-slate-200 z-10 relative" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-none opacity-60 mix-blend-luminosity grayscale relative z-10">
                        {COMPARISON_DATA.map((row) => (
                            <div key={row.id} className="flex flex-col items-start text-left gap-4">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-300 border border-slate-400 flex items-center justify-center text-slate-500">
                                    <row.old.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-600 decoration-slate-400 decoration-2 line-through">{row.old.text}</h3>
                                    <p className="text-sm text-slate-500 font-mono mt-2 leading-relaxed">{row.old.subtext}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-0 bottom-0 z-30 w-1 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                    <div className="absolute inset-y-0 -left-[2px] w-[4px] bg-osce-navy shadow-[0_0_20px_2px_rgba(0,51,102,0.4)]" />
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-4 border-osce-orange shadow-lg flex items-center justify-center z-40">
                        <div className="flex gap-1">
                            <ChevronLeft size={14} className="text-osce-navy" />
                            <ChevronRight size={14} className="text-osce-navy" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button className="px-8 py-4 bg-osce-navy hover:bg-osce-orange text-white font-bold rounded-full text-lg shadow-xl transition-all hover:scale-105 active:scale-95">
                    Upgrade Your Clinical Skills →
                </button>
            </div>
        </section>
    );
};

export default ComparisonSlider;
