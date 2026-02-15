import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, MessageSquare, Activity, X, AlertTriangle, Lightbulb, Stethoscope, Brain, Shield, Scale, Eye, Target, Heart } from 'lucide-react';

interface EvaluationReportProps {
    evaluation: any;
    onClose: () => void;
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation, onClose }) => {
    const clinicalPercentage = (evaluation.clinicalScore.total / evaluation.clinicalScore.maxTotal) * 100;
    const communicationPercentage = (evaluation.communicationScore.total / evaluation.communicationScore.maxTotal) * 100;
    const overallPercentage = (evaluation.overallScore / evaluation.overallMaxScore) * 100;

    const getGradeColor = (percentage: number) => {
        if (percentage >= 80) return 'text-emerald-500';
        if (percentage >= 60) return 'text-blue-500';
        if (percentage >= 40) return 'text-amber-500';
        return 'text-red-500';
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Pass';
        return 'Needs Improvement';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl my-8"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-8 rounded-t-3xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="text-white" size={24} />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <Trophy className="text-yellow-300" size={48} />
                        <div>
                            <h2 className="text-3xl font-bold text-white">OSCE Evaluation Report</h2>
                            <p className="text-purple-100">Comprehensive Performance Analysis</p>
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold text-lg">Overall Score</span>
                            <span className={`text-4xl font-bold ${getGradeColor(overallPercentage)}`}>
                                {Math.round(overallPercentage)}%
                            </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallPercentage}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
                            />
                        </div>
                        <p className="text-white/80 text-sm mt-2">
                            {evaluation.overallScore} / {evaluation.overallMaxScore} points • {getGrade(overallPercentage)}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Clinical Performance */}
                    <div className="clay-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="text-blue-500" size={24} />
                            <h3 className="text-xl font-bold text-slate-200">Clinical Performance</h3>
                            <span className={`ml-auto text-2xl font-bold ${getGradeColor(clinicalPercentage)}`}>
                                {Math.round(clinicalPercentage)}%
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScoreCard
                                title="History Taking"
                                score={evaluation.clinicalScore.history.score}
                                maxScore={evaluation.clinicalScore.history.maxScore}
                                feedback={evaluation.clinicalScore.history.feedback}
                            />
                            <ScoreCard
                                title="Physical Examination"
                                score={evaluation.clinicalScore.examination.score}
                                maxScore={evaluation.clinicalScore.examination.maxScore}
                                feedback={evaluation.clinicalScore.examination.feedback}
                            />
                            <ScoreCard
                                title="Investigations"
                                score={evaluation.clinicalScore.investigations.score}
                                maxScore={evaluation.clinicalScore.investigations.maxScore}
                                feedback={evaluation.clinicalScore.investigations.feedback}
                            />
                            <ScoreCard
                                title="Differential Diagnosis"
                                score={evaluation.clinicalScore.ddx.score}
                                maxScore={evaluation.clinicalScore.ddx.maxScore}
                                feedback={evaluation.clinicalScore.ddx.feedback}
                            />
                        </div>
                    </div>

                    {/* Communication Skills */}
                    <div className="clay-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-emerald-500" size={24} />
                            <h3 className="text-xl font-bold text-slate-200">Communication Skills</h3>
                            <span className={`ml-auto text-2xl font-bold ${getGradeColor(communicationPercentage)}`}>
                                {Math.round(communicationPercentage)}%
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScoreCard
                                title="Empathy & Rapport"
                                score={evaluation.communicationScore.empathy.score}
                                maxScore={evaluation.communicationScore.empathy.maxScore}
                                feedback={evaluation.communicationScore.empathy.feedback}
                            />
                            <ScoreCard
                                title="Clarity"
                                score={evaluation.communicationScore.clarity.score}
                                maxScore={evaluation.communicationScore.clarity.maxScore}
                                feedback={evaluation.communicationScore.clarity.feedback}
                            />
                            <ScoreCard
                                title="Professionalism"
                                score={evaluation.communicationScore.professionalism.score}
                                maxScore={evaluation.communicationScore.professionalism.maxScore}
                                feedback={evaluation.communicationScore.professionalism.feedback}
                            />
                            <ScoreCard
                                title="Active Listening"
                                score={evaluation.communicationScore.activeListening.score}
                                maxScore={evaluation.communicationScore.activeListening.maxScore}
                                feedback={evaluation.communicationScore.activeListening.feedback}
                            />
                        </div>
                    </div>

                    {/* Reasoning & Non-Clinical Skills */}
                    {evaluation.reasoningScore && (
                        <div className="clay-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Brain className="text-purple-500" size={24} />
                                <h3 className="text-xl font-bold text-slate-200">Clinical Reasoning & Thinking Skills</h3>
                                <span className={`ml-auto text-2xl font-bold ${getGradeColor((evaluation.reasoningScore.total / evaluation.reasoningScore.maxTotal) * 100)}`}>
                                    {Math.round((evaluation.reasoningScore.total / evaluation.reasoningScore.maxTotal) * 100)}%
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ReasoningCard
                                    icon={<Brain size={18} />}
                                    title="Clinical Reasoning"
                                    score={evaluation.reasoningScore.clinicalReasoning.score}
                                    maxScore={evaluation.reasoningScore.clinicalReasoning.maxScore}
                                    feedback={evaluation.reasoningScore.clinicalReasoning.feedback}
                                    details={evaluation.reasoningScore.clinicalReasoning.thinkingProcess}
                                />
                                <ReasoningCard
                                    icon={<Eye size={18} />}
                                    title="Critical Thinking"
                                    score={evaluation.reasoningScore.criticalThinking.score}
                                    maxScore={evaluation.reasoningScore.criticalThinking.maxScore}
                                    feedback={evaluation.reasoningScore.criticalThinking.feedback}
                                    details={evaluation.reasoningScore.criticalThinking.evidenceAnalysis}
                                />
                                <ReasoningCard
                                    icon={<Target size={18} />}
                                    title="Medical Knowledge"
                                    score={evaluation.reasoningScore.medicalKnowledge.score}
                                    maxScore={evaluation.reasoningScore.medicalKnowledge.maxScore}
                                    feedback={evaluation.reasoningScore.medicalKnowledge.feedback}
                                    details={evaluation.reasoningScore.medicalKnowledge.knowledgeApplication}
                                />
                                <ReasoningCard
                                    icon={<Shield size={18} />}
                                    title="Decision Making"
                                    score={evaluation.reasoningScore.decisionMaking.score}
                                    maxScore={evaluation.reasoningScore.decisionMaking.maxScore}
                                    feedback={evaluation.reasoningScore.decisionMaking.feedback}
                                    details={evaluation.reasoningScore.decisionMaking.uncertaintyHandling}
                                />
                                <ReasoningCard
                                    icon={<Scale size={18} />}
                                    title="Ethical Reasoning"
                                    score={evaluation.reasoningScore.ethicalReasoning.score}
                                    maxScore={evaluation.reasoningScore.ethicalReasoning.maxScore}
                                    feedback={evaluation.reasoningScore.ethicalReasoning.feedback}
                                    details={evaluation.reasoningScore.ethicalReasoning.ethicalConsiderations}
                                />
                                <ReasoningCard
                                    icon={<Heart size={18} />}
                                    title="Professional Judgment"
                                    score={evaluation.reasoningScore.professionalJudgment.score}
                                    maxScore={evaluation.reasoningScore.professionalJudgment.maxScore}
                                    feedback={evaluation.reasoningScore.professionalJudgment.feedback}
                                    details={evaluation.reasoningScore.professionalJudgment.judgmentAreas}
                                />
                            </div>
                        </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="clay-card p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="text-emerald-500" size={20} />
                                <h4 className="font-bold text-slate-200">Strengths</h4>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.strengths.map((strength: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="clay-card p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="text-amber-500" size={20} />
                                <h4 className="font-bold text-slate-200">Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.areasForImprovement.map((area: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">→</span>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Critical Errors */}
                    {evaluation.criticalErrors && evaluation.criticalErrors.length > 0 && (
                        <div className="clay-card p-6 border-red-500/30 bg-red-500/5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="text-red-500" size={20} />
                                <h4 className="font-bold text-red-400">Critical Errors</h4>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.criticalErrors.map((error: string, i: number) => (
                                    <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                                        <span className="text-red-500 mt-1">⚠</span>
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                        <div className="clay-card p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="text-yellow-500" size={20} />
                                <h4 className="font-bold text-slate-200">Recommendations</h4>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.recommendations.map((rec: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-yellow-500 mt-1">💡</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Detailed Evaluation Breakdown */}
                    <div className="clay-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Stethoscope className="text-blue-500" size={20} />
                            <h4 className="font-bold text-slate-200">Detailed Evaluation</h4>
                        </div>
                        <div className="space-y-4">
                            <DetailedSection
                                title="History Taking"
                                score={evaluation.clinicalScore.history}
                            />
                            <DetailedSection
                                title="Physical Examination"
                                score={evaluation.clinicalScore.examination}
                            />
                            <DetailedSection
                                title="Investigations"
                                score={evaluation.clinicalScore.investigations}
                            />
                            <DetailedSection
                                title="Differential Diagnosis"
                                score={evaluation.clinicalScore.ddx}
                            />
                            <DetailedSection
                                title="Management Plan"
                                score={evaluation.clinicalScore.management}
                            />
                        </div>
                    </div>

                    {/* Overall Feedback */}
                    <div className="clay-card p-6 bg-gradient-to-r from-slate-800 to-slate-900">
                        <h4 className="font-bold text-slate-200 mb-3">Overall Feedback</h4>
                        <p className="text-slate-300 leading-relaxed">{evaluation.overallFeedback}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ScoreCard: React.FC<{ title: string; score: number; maxScore: number; feedback: string }> = ({
    title,
    score,
    maxScore,
    feedback
}) => {
    const percentage = (score / maxScore) * 100;

    return (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-bold text-slate-300">{title}</h5>
                <span className="text-lg font-bold text-blue-400">{score}/{maxScore}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-slate-400">{feedback}</p>
        </div>
    );
};

const DetailedSection: React.FC<{ 
    title: string; 
    score: { score: number; maxScore: number; feedback: string; details?: string[] } 
}> = ({ title, score }) => {
    const percentage = (score.score / score.maxScore) * 100;
    
    return (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20">
            <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-slate-300">{title}</h5>
                <span className={`font-bold ${percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {score.score}/{score.maxScore} ({Math.round(percentage)}%)
                </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">{score.feedback}</p>
            {score.details && score.details.length > 0 && (
                <div className="mt-2 space-y-1">
                    {score.details.map((detail: string, i: number) => (
                        <p key={i} className="text-xs text-slate-500 pl-3 border-l-2 border-slate-600">
                            • {detail}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

const ReasoningCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    score: number;
    maxScore: number;
    feedback: string;
    details?: string[];
}> = ({ icon, title, score, maxScore, feedback, details }) => {
    const percentage = (score / maxScore) * 100;
    
    return (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    {icon}
                </div>
                <h5 className="text-sm font-bold text-slate-300">{title}</h5>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-purple-400">{score}/{maxScore}</span>
                <span className={`text-xs font-medium ${percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {Math.round(percentage)}%
                </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
                <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-slate-400 mb-2">{feedback}</p>
            {details && details.length > 0 && (
                <div className="space-y-1">
                    {details.map((detail: string, i: number) => (
                        <p key={i} className="text-xs text-slate-500 flex items-start gap-1">
                            <span className="text-purple-400 mt-0.5">•</span>
                            {detail}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvaluationReport;
