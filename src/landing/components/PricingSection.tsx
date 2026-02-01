import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, Sparkles, Zap, Stethoscope, Crown } from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';
interface PricingTier { id: string; name: string; description: string; monthlyPrice: number; annualPrice: number; features: string[]; highlight?: boolean; color: string; icon: React.ElementType; }

const TIERS: PricingTier[] = [
    { id: 'essentials', name: 'Essentials', description: 'Core simulation tools for early medical students.', monthlyPrice: 49, annualPrice: 29, color: 'bg-slate-500', icon: Stethoscope, features: ['Access to 50+ Core Cases', 'Basic Performance Scoring', 'Standard AI Patient Response', 'Mobile App Access'] },
    { id: 'pro', name: 'Pro', description: 'Advanced OSCE prep for high-stakes exams.', monthlyPrice: 99, annualPrice: 59, highlight: true, color: 'bg-osce-gold', icon: Zap, features: ['Unlimited AI Patient Cases', 'Voice-to-Text Detailed Feedback', 'Personalized Weakness Analysis', 'Micro-Expression Tracking', 'Compare vs. Global Cohort'] },
    { id: 'elite', name: 'Elite', description: 'The complete clinical mastery suite.', monthlyPrice: 199, annualPrice: 119, color: 'bg-indigo-500', icon: Crown, features: ['Everything in Pro', '1-on-1 Human Coach Review', 'Institution-Grade Analytics', 'Offline VR Headset Support', 'Priority Support Channel'] }
];

const AnimatedPrice = ({ price }: { price: number }) => {
    return (
        <div className="relative h-[1.1em] w-fit overflow-hidden flex justify-center items-center text-4xl md:text-5xl font-bold text-osce-navy tracking-tight">
            <span className="absolute text-transparent select-none">${price}</span>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={price} initial={{ y: 50, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -50, opacity: 0, filter: "blur(4px)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="block">
                    ${price}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

interface PricingCardProps { tier: PricingTier; billing: BillingCycle; }
const PricingCard: React.FC<PricingCardProps> = ({ tier, billing }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
    const glintX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glintY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const price = billing === 'annual' ? tier.annualPrice : tier.monthlyPrice;

    return (
        <div style={{ perspective: 1000 }} className="h-full">
            <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className={`relative h-full flex flex-col p-8 rounded-3xl border transition-all duration-200 ${tier.highlight ? 'bg-white/80 border-osce-orange/50 shadow-xl shadow-osce-orange/10' : 'bg-white/40 border-white/60 shadow-lg'} backdrop-blur-xl`}>
                <motion.div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" style={{ background: `radial-gradient(circle at ${glintX} ${glintY}, rgba(255,255,255,0.8) 0%, transparent 60%)`, mixBlendMode: "overlay" }} />
                {tier.highlight && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20 transform translate-z-10">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="px-4 py-1 bg-gradient-to-r from-osce-orange to-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                            <Sparkles size={12} /> Most Popular
                        </motion.div>
                    </div>
                )}
                <div className="mb-8 relative z-0">
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-md ${tier.highlight ? 'bg-gradient-to-br from-osce-orange to-amber-600' : 'bg-slate-400'}`}>
                        <tier.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-osce-navy">{tier.name}</h3>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed h-10">{tier.description}</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                    <AnimatedPrice price={price} />
                    <span className="text-slate-500 font-medium">/mo</span>
                    {billing === 'annual' && <span className="ml-2 text-xs font-bold text-osce-orange bg-amber-100 px-2 py-0.5 rounded-full">SAVE 40%</span>}
                </div>
                <div className="flex-grow space-y-4 mb-8">
                    {tier.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className={`mt-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center ${tier.highlight ? 'bg-amber-100 text-osce-orange' : 'bg-slate-200 text-slate-500'}`}><Check size={10} strokeWidth={3} /></div>
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>
                <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${tier.highlight ? 'bg-osce-navy text-white hover:bg-osce-orange shadow-xl' : 'bg-white text-osce-navy border border-slate-200 hover:bg-slate-50'}`}>Select {tier.name}</button>
            </motion.div>
        </div>
    );
};

const PricingSection: React.FC = () => {
    const [billing, setBilling] = useState<BillingCycle>('monthly');
    const [showConfetti, setShowConfetti] = useState(false);

    const toggleBilling = (cycle: BillingCycle) => {
        if (cycle === billing) return;
        setBilling(cycle);
        if (cycle === 'annual') { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000); }
    };

    return (
        <section className="relative w-full py-24 md:py-32 bg-osce-blue overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-block px-3 py-1 mb-6 border border-osce-navy/20 bg-white/50 backdrop-blur-sm text-osce-navy font-mono text-xs tracking-widest uppercase rounded-full">The Holographic Price Lab</div>
                    <h2 className="text-4xl md:text-5xl font-bold text-osce-navy tracking-tight mb-4">Invest in your future. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-osce-orange to-amber-500">Match with confidence.</span></h2>
                    <p className="text-lg text-slate-600">Choose the plan that fits your exam timeline. Cancel anytime.</p>
                </div>
                <div className="flex justify-center mb-16 relative z-20">
                    <div className="bg-white/60 p-1 rounded-full flex relative backdrop-blur-md border border-white/80 shadow-sm">
                        <AnimatePresence>
                            {showConfetti && (
                                <motion.div initial={{ opacity: 1, scale: 0.5, y: 0 }} animate={{ opacity: 0, scale: 1.5, y: -50 }} exit={{ opacity: 0 }} className="absolute right-0 top-0 -mt-12 -mr-12 pointer-events-none">
                                    <img src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/Symbol.png" className="w-16 h-16 animate-spin" alt="confetti" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button onClick={() => toggleBilling('monthly')} className={`relative px-6 py-2 rounded-full text-sm font-bold transition-colors z-10 ${billing === 'monthly' ? 'text-osce-navy' : 'text-slate-500 hover:text-slate-700'}`}>
                            Monthly
                            {billing === 'monthly' && <motion.div layoutId="pill-bg" className="absolute inset-0 bg-white rounded-full shadow-md" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                        </button>
                        <button onClick={() => toggleBilling('annual')} className={`relative px-6 py-2 rounded-full text-sm font-bold transition-colors z-10 ${billing === 'annual' ? 'text-osce-navy' : 'text-slate-500 hover:text-slate-700'}`}>
                            Annual (Save 40%)
                            {billing === 'annual' && <motion.div layoutId="pill-bg" className="absolute inset-0 bg-gradient-to-r from-osce-gold to-osce-darkOrange rounded-full shadow-md" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 max-w-6xl mx-auto">
                    {TIERS.map((tier) => <PricingCard key={tier.id} tier={tier} billing={billing} />)}
                </div>
                <div className="mt-16 text-center">
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-2"><Check size={16} className="text-osce-orange" /> 14-day money-back guarantee on all annual plans.</p>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
