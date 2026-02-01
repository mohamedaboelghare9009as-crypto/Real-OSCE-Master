import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

type ReviewType = 'success' | 'experience';

interface Review {
    id: string;
    name: string;
    role: string;
    text: string;
    badge: string;
    type: ReviewType;
}

const SUCCESS_REVIEWS: Review[] = [
    { id: 's1', name: "Alex M.", role: "Matched Surgery", text: "Matched into Surgery at Mayo! The cardio cases were identical to my interview.", badge: "Matched", type: 'success' },
    { id: 's2', name: "Sarah J.", role: "Step 2: 268", text: "My score jumped 20 points after using the active recall simulations.", badge: "High Score", type: 'success' },
    { id: 's3', name: "David K.", role: "Passed Step 1", text: "Finally passed Step 1 on my first try. The anxiety training works.", badge: "Passed", type: 'success' },
    { id: 's4', name: "Dr. Chen", role: "Resident", text: "I use this to keep my differential diagnosis sharp during residency.", badge: "Pro", type: 'success' },
    { id: 's5', name: "Emily R.", role: "Matched Peds", text: "The pediatric cases helped me crush my OSCEs and match.", badge: "Matched", type: 'success' },
    { id: 's6', name: "Marcus T.", role: "M3 Student", text: "Understood heart sounds for the first time in 3 years.", badge: "Clarity", type: 'success' },
    { id: 's7', name: "Priya L.", role: "IMG Candidate", text: "Helped me understand US clinical culture perfectly.", badge: "IMG", type: 'success' },
    { id: 's8', name: "James B.", role: "Matched IM", text: "Detailed feedback on my empathy score got me the match.", badge: "Matched", type: 'success' },
];

const EXPERIENCE_REVIEWS: Review[] = [
    { id: 'e1', name: "Chloe W.", role: "M4, UCLA", text: "The AI patients felt scarily real. They actually interrupt you.", badge: "Realism", type: 'experience' },
    { id: 'e2', name: "Tom H.", role: "PA Student", text: "Better than UWorld. It's not just knowledge, it's performance.", badge: "Quality", type: 'experience' },
    { id: 'e3', name: "Anita S.", role: "Nursing", text: "The instant feedback is brutal but exactly what I needed.", badge: "Feedback", type: 'experience' },
    { id: 'e4', name: "Raj P.", role: "M2, Oxford", text: "Prep changed my life. I don't freeze in front of attendings anymore.", badge: "Confidence", type: 'experience' },
    { id: 'e5', name: "Sophie L.", role: "M3, Harvard", text: "It tracks micro-expressions? The tech is insane.", badge: "Tech", type: 'experience' },
    { id: 'e6', name: "K. O'Conner", role: "Clinical Lead", text: "We are rolling this out to our entire cohort next semester.", badge: "Enterprise", type: 'experience' },
    { id: 'e7', name: "Miguel R.", role: "M4", text: "Finally, a tool that simulates the CHAOS of the ER.", badge: "Chaos", type: 'experience' },
    { id: 'e8', name: "Liu Wei", role: "M3", text: "I practice 20 minutes a day on the bus. Seamless mobile UI.", badge: "Mobile", type: 'experience' },
];

const Counter = () => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const [displayValue, setDisplayValue] = useState(0);

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: 2.5
    });

    useEffect(() => {
        if (inView) {
            springValue.set(12403);
        }
    }, [inView, springValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [springValue]);

    return (
        <span ref={ref} className="tabular-nums">
            {displayValue.toLocaleString()}
        </span>
    );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const isSuccess = review.type === 'success';

    return (
        <motion.div
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            className={`
        flex-shrink-0 w-[300px] md:w-[350px] p-5 rounded-2xl mx-3 md:mx-4 cursor-default
        bg-white/70 backdrop-blur-md border border-white/80 shadow-sm
        flex flex-col gap-3 transition-colors duration-300
      `}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${isSuccess ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {review.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-osce-navy text-sm">{review.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{review.role}</div>
                    </div>
                </div>

                <div className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${isSuccess ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {review.badge}
                </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
                "{review.text}"
            </p>
        </motion.div>
    );
};

const SocialProofSection: React.FC = () => {
    return (
        <section className="relative w-full py-24 md:py-32 overflow-hidden bg-osce-blue">

            <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-left {
          animation: scroll-left 45s linear infinite;
        }
        .marquee-right {
          animation: scroll-right 55s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>

            <div className="relative z-10 max-w-4xl mx-auto text-center px-6 mb-20 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <ShieldCheck size={16} className="text-slate-500" />
                        <span className="text-slate-600 text-xs md:text-sm font-bold tracking-widest uppercase">
                            Trusted by Medical Students Worldwide
                        </span>
                    </div>

                    <h2 className="text-6xl md:text-8xl font-bold text-osce-navy tracking-tighter leading-none mb-4">
                        <Counter />
                    </h2>
                    <p className="text-slate-600 font-medium text-lg">Active Learners & Counting</p>
                </motion.div>
            </div>

            <div className="flex flex-col gap-8 md:gap-12 relative z-10">

                <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-osce-blue to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-osce-blue to-transparent z-20 pointer-events-none" />

                <div className="w-full overflow-hidden marquee-container py-2">
                    <div className="flex w-max marquee-content marquee-right hover:cursor-grab active:cursor-grabbing">
                        {[...SUCCESS_REVIEWS, ...SUCCESS_REVIEWS].map((review, i) => (
                            <ReviewCard key={`${review.id}-${i}`} review={review} />
                        ))}
                    </div>
                </div>

                <div className="w-full overflow-hidden marquee-container py-2">
                    <div className="flex w-max marquee-content marquee-left hover:cursor-grab active:cursor-grabbing">
                        {[...EXPERIENCE_REVIEWS, ...EXPERIENCE_REVIEWS].map((review, i) => (
                            <ReviewCard key={`${review.id}-${i}`} review={review} />
                        ))}
                    </div>
                </div>

            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[120px] opacity-40 z-0 pointer-events-none" />

        </section>
    );
};

export default SocialProofSection;
