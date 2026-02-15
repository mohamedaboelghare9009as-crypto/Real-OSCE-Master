import React, { useEffect, useState } from 'react';
import { RefreshCw, ArrowRight, FileText, CheckCircle2, RotateCcw, AlertCircle, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface EvaluationData {
    sessionId: string;
    caseTitle: string;
    totalScore: number;
    sectionScores: {
        history: number;
        examination: number;
        investigations: number;
        management: number;
    };
    differentialDiagnoses: {
        submitted: string[];
        correct: string;
        feedback: string;
    };
    communication: {
        empathy: { score: string; feedback: string };
        structure: { score: string; feedback: string };
        clarity: { score: string; feedback: string };
    };
    transcript: Array<{ role: string; text: string; timestamp: Date }>;
}

const PostSessionView: React.FC = () => {
    const navigate = useNavigate();
    const { caseId } = useParams<{ caseId: string }>();
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvaluation = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get sessionId from sessionStorage (should be set during session)
                const sessionId = sessionStorage.getItem('currentSessionId');
                
                if (!sessionId) {
                    throw new Error('No session ID found. Please complete a simulation first.');
                }

                const response = await fetch(`http://localhost:3001/api/sessions/${sessionId}/evaluation`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load evaluation: ${response.statusText}`);
                }

                const data = await response.json();
                setEvaluation(data);
            } catch (err: any) {
                console.error('[PostSession] Error loading evaluation:', err);
                setError(err.message || 'Failed to load session evaluation');
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, [caseId]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen w-full bg-slate-950 items-center justify-center">
                <Loader className="animate-spin text-blue-400 mb-4" size={48} />
                <p className="text-slate-400 animate-pulse">Analyzing your session...</p>
            </div>
        );
    }

    if (error || !evaluation) {
        return (
            <div className="flex flex-col h-screen w-full bg-slate-950 items-center justify-center p-8">
                <AlertCircle className="text-red-400 mb-4" size={48} />
                <h1 className="text-2xl font-bold text-white mb-2">Evaluation Not Available</h1>
                <p className="text-slate-400 text-center max-w-md mb-6">{error || 'No evaluation data found'}</p>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Session Evaluation</h1>
                    <p className="text-slate-400">Case: {evaluation.caseTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-sm text-slate-500 uppercase font-bold tracking-widest">Total Score</span>
                        <span className={`text-4xl font-bold ${
                            evaluation.totalScore >= 70 ? 'text-emerald-400' :
                            evaluation.totalScore >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                            {evaluation.totalScore}%
                        </span>
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
                        <ScoreRow label="History Taking" score={evaluation.sectionScores.history} />
                        <ScoreRow label="Physical Examination" score={evaluation.sectionScores.examination} />
                        <ScoreRow label="Investigations" score={evaluation.sectionScores.investigations} />
                        <ScoreRow label="Management Plan" score={evaluation.sectionScores.management} />
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
                            <span className="font-bold text-emerald-400">Correct: {evaluation.differentialDiagnoses.correct}</span>
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                        {evaluation.differentialDiagnoses.submitted.map((dx, i) => (
                            dx !== evaluation.differentialDiagnoses.correct && (
                                <div key={i} className="p-3 bg-slate-800 rounded-xl opacity-60">
                                    <span className="text-slate-400">{dx}</span>
                                </div>
                            )
                        ))}
                        {evaluation.differentialDiagnoses.feedback && (
                            <p className="text-xs text-slate-500 mt-2 italic">{evaluation.differentialDiagnoses.feedback}</p>
                        )}
                    </div>
                </div>

                {/* Communication Feedback */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                        Communication & Empathy
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        <FeedbackMetric 
                            label="Empathy" 
                            score={evaluation.communication.empathy.score} 
                            text={evaluation.communication.empathy.feedback} 
                        />
                        <FeedbackMetric 
                            label="Structure" 
                            score={evaluation.communication.structure.score} 
                            text={evaluation.communication.structure.feedback} 
                        />
                        <FeedbackMetric 
                            label="Clarity" 
                            score={evaluation.communication.clarity.score} 
                            text={evaluation.communication.clarity.feedback} 
                        />
                    </div>
                </div>

                {/* Full Transcript */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-200">Session Transcript</h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <FileText size={16} /> Export PDF
                        </button>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl h-48 overflow-y-auto text-sm text-slate-400 font-mono space-y-2">
                        {evaluation.transcript.map((msg, i) => (
                            <p key={i}>
                                <span className={`font-bold ${
                                    msg.role === 'user' ? 'text-blue-400' :
                                    msg.role === 'nurse' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {msg.role === 'user' ? 'Student' : 
                                     msg.role === 'nurse' ? 'Nurse' : 'Patient'}:
                                </span> {msg.text}
                            </p>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800 p-6 bg-slate-900 flex justify-center gap-6 mt-auto">
                <button 
                    onClick={() => navigate(`/session/${caseId}`)} 
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                    <RotateCcw size={18} /> Retry Case
                </button>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('currentSessionId');
                        navigate('/dashboard');
                    }} 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
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
