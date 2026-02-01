import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ShieldCheck, Zap, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlanSelection() {
    const navigate = useNavigate();

    const handleSelectPlan = (plan: 'free' | 'pro') => {
        if (plan === 'pro') {
            navigate('/subscribe');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Path</h1>
                    <p className="text-xl text-slate-500">Select the plan that fits your preparation needs.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-200 to-slate-300 group-hover:h-3 transition-all"></div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Free</h2>
                            <p className="text-slate-500 mb-6">Essential basics for medical students.</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">$0</span>
                                <span className="text-slate-400">/ forever</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Limited Case Library Access (3/month)</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Basic Performance Feedback</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Standard Patient Interaction Mode</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSelectPlan('free')}
                            className="w-full py-3 px-6 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                        >
                            Start for Free
                        </button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="relative z-10 mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
                                <Star className="w-3 h-3 fill-current" /> Most Popular
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
                            <p className="text-slate-400 mb-6">Complete mastery toolkit for serious learners.</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$20</span>
                                <span className="text-slate-400">/ month</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 relative z-10">
                            <li className="flex items-start gap-3 text-slate-300">
                                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                    <Zap className="w-3 h-3" />
                                </div>
                                <span>Unlimited AI Case Simulations</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                    <ShieldCheck className="w-3 h-3" />
                                </div>
                                <span>Advanced Analytics & Detailed Metrics</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                    <Stethoscope className="w-3 h-3" />
                                </div>
                                <span>All Specialties (Pediatrics, Psych, etc)</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                    <Star className="w-3 h-3" />
                                </div>
                                <span>Priority Support & New Features</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSelectPlan('pro')}
                            className="w-full py-4 px-6 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all relative z-10"
                        >
                            Get Pro Access
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
