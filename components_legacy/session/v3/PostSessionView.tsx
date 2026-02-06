import React from 'react';
import { RefreshCw, ArrowRight, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostSessionView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Session Evaluation</h1>
                    <p className="text-slate-400">Case: Chronic Cough & Weight Loss</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-sm text-slate-500 uppercase font-bold tracking-widest">Total Score</span>
                        <span className="text-4xl font-bold text-emerald-400">72%</span>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">

                {/* Score Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Section Breakdown
                    </h2>
                    <div className="space-y-4">
                        <ScoreRow label="History Taking" score={85} />
                        <ScoreRow label="Physical Examination" score={60} />
                        <ScoreRow label="Investigations" score={90} />
                        <ScoreRow label="Management Plan" score={40} />
                    </div>
                </div>

                {/* DDx Review */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                        Diagnosis Review
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <span className="font-bold text-emerald-400">Correct: Lung Cancer</span>
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl opacity-60">
                            <span className="text-slate-400 line-through">TB (Tuberculosis)</span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl opacity-60">
                            <span className="text-slate-400">Pneumonia</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">You missed checking for occupational exposure risks sooner.</p>
                    </div>
                </div>

                {/* Communication Feedback */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                        Communication & Empathy
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        <FeedbackMetric label="Empathy" score="High" text="Good validation of patient pain." />
                        <FeedbackMetric label="Structure" score="Medium" text="Jumped between topics occasionally." />
                        <FeedbackMetric label="Clarity" score="High" text="Explanation was very clear." />
                    </div>
                </div>

                {/* Full Transcript (Collapsed/Snippet) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-200">Session Transcript</h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <FileText size={16} /> Export PDF
                        </button>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl h-48 overflow-y-auto text-sm text-slate-400 font-mono">
                        <p><span className="text-blue-400 font-bold">Student:</span> Hello, I'm Dr. Smith. What brings you in?</p>
                        <p><span className="text-emerald-400 font-bold">Patient:</span> I can't stop coughing, doctor.</p>
                        <p><span className="text-blue-400 font-bold">Student:</span> How long has this been going on?</p>
                        <p><span className="text-emerald-400 font-bold">Patient:</span> About 3 months now.</p>
                        {/* Mock content */}
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800 p-6 bg-slate-900 flex justify-center gap-6 mt-auto">
                <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                    <RotateCcw size={18} /> Retry Case
                </button>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20">
                    Finish Review <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

const ScoreRow = ({ label, score }: { label: string, score: number }) => (
    <div className="flex items-center gap-4">
        <span className="flex-1 text-slate-300 font-medium">{label}</span>
        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
        </div>
        <span className="w-8 text-right font-bold text-slate-200">{score}%</span>
    </div>
);

const FeedbackMetric = ({ label, score, text }: { label: string, score: string, text: string }) => (
    <div className="p-4 bg-slate-800/50 rounded-xl">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <div className="text-xl font-bold text-white mb-2">{score}</div>
        <p className="text-sm text-slate-400 italic">"{text}"</p>
    </div>
);

export default PostSessionView;
