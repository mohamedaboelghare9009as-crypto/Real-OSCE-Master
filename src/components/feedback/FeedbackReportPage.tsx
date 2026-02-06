import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, Printer, Share2, AlertCircle, FileText, Activity, Search,
    Microscope, Stethoscope, ClipboardList, CheckCircle, AlertTriangle,
    ArrowLeft, PlayCircle, Clock, Target, Award, BookOpen, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_FEEDBACK } from "../../../services/feedbackMockData";
import { ScoreRing } from './ScoreRing';
import { DomainScoreCard } from './DomainScoreCard';
import { DomainAccordion } from './domains/DomainAccordion';
import { HistorySection } from './domains/HistorySection';
import { ExaminationSection } from './domains/ExaminationSection';
import { InvestigationsSection } from './domains/InvestigationsSection';
import { ManagementSection } from './domains/ManagementSection';
import { DDxTimelineSection } from './domains/DDxTimelineSection';

// Hero Header with gradient and score ring
const FeedbackHero = () => {
    const navigate = useNavigate();

    const getGradeColors = () => {
        if (MOCK_FEEDBACK.result.grade === 'Pass') return {
            gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
            badge: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30'
        };
        if (MOCK_FEEDBACK.result.grade === 'Borderline') return {
            gradient: 'from-amber-500 via-orange-500 to-yellow-500',
            badge: 'bg-amber-400/20 text-amber-100 border-amber-400/30'
        };
        return {
            gradient: 'from-red-600 via-rose-600 to-pink-600',
            badge: 'bg-red-400/20 text-red-100 border-red-400/30'
        };
    };

    const colors = getGradeColors();

    return (
        <div className={`relative bg-gradient-to-r ${colors.gradient} text-white overflow-hidden`}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-10">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <Printer size={18} />
                        </button>
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row items-center gap-10">
                    {/* Score Ring */}
                    <div className="flex-shrink-0">
                        <div className="bg-white rounded-3xl p-6 shadow-2xl">
                            <ScoreRing score={MOCK_FEEDBACK.result.score} size={160} />
                        </div>
                    </div>

                    {/* Station Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${colors.badge} mb-4`}>
                            <Award size={16} />
                            <span className="font-bold uppercase tracking-wide text-sm">
                                {MOCK_FEEDBACK.result.grade}
                            </span>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                            {MOCK_FEEDBACK.station.title}
                        </h1>

                        <p className="text-white/80 text-lg mb-6 max-w-xl">
                            {MOCK_FEEDBACK.station.scenario}
                        </p>

                        {/* Stats row */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                <Clock size={16} />
                                <span>{MOCK_FEEDBACK.station.timeTaken} / {MOCK_FEEDBACK.station.timeAllowed} min</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                <Target size={16} />
                                <span>{MOCK_FEEDBACK.station.difficulty} Difficulty</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                <BookOpen size={16} />
                                <span>Cardiology</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Domain Score Overview Grid
const DomainOverview = ({ onDomainClick }: { onDomainClick: (domain: string) => void }) => {
    const domains = [
        { key: 'history', title: 'History Taking', icon: FileText, score: MOCK_FEEDBACK.domains.history.score },
        { key: 'examination', title: 'Examination', icon: Stethoscope, score: MOCK_FEEDBACK.domains.examination.score },
        { key: 'investigations', title: 'Investigations', icon: Microscope, score: MOCK_FEEDBACK.domains.investigations.score },
        { key: 'ddx', title: 'Clinical Reasoning', icon: Search, score: MOCK_FEEDBACK.domains.ddx.score },
        { key: 'management', title: 'Management', icon: ClipboardList, score: MOCK_FEEDBACK.domains.management.score },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                Performance Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {domains.map(domain => (
                    <DomainScoreCard
                        key={domain.key}
                        title={domain.title}
                        icon={domain.icon}
                        obtained={domain.score.obtained}
                        total={domain.score.total}
                        onClick={() => onDomainClick(domain.key)}
                    />
                ))}
            </div>
        </div>
    );
};

// Examiner Verdict Card
const ExaminerVerdict = () => (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg">
                    <Award size={20} />
                </div>
                <h2 className="text-lg font-bold">Examiner Verdict</h2>
            </div>
            <p className="text-white/90 leading-relaxed text-lg">
                {MOCK_FEEDBACK.result.outcomeSummary}
            </p>
        </div>
    </div>
);

// Critical Errors Alert
const CriticalErrorsAlert = () => {
    if (MOCK_FEEDBACK.globalCriticalErrors.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-red-800 text-lg mb-2">Critical Safety Errors Identified</h3>
                    <ul className="space-y-2">
                        {MOCK_FEEDBACK.globalCriticalErrors.map((err, i) => (
                            <li key={i} className="flex items-center gap-2 text-red-700">
                                <ChevronRight size={16} className="text-red-400" />
                                {err}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

// Examiner Feedback Panel
const ExaminerFeedbackPanel = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Activity size={18} />
                Examiner Feedback
            </h3>
        </div>
        <div className="p-6 space-y-6">
            <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle size={14} />
                    Strengths
                </h4>
                <ul className="space-y-2">
                    {MOCK_FEEDBACK.examinerComments.strengths.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 bg-emerald-50 p-3 rounded-lg">
                            <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="text-sm font-bold text-amber-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Areas for Improvement
                </h4>
                <ul className="space-y-2">
                    {MOCK_FEEDBACK.examinerComments.weaknesses.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 bg-amber-50 p-3 rounded-lg">
                            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

// Key Learning Points Panel
const KeyLearningPanel = () => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mt-6">
        <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Key Learning Points
        </h3>
        <p className="text-indigo-800 leading-relaxed mb-4">
            {MOCK_FEEDBACK.modelAnswer.summary}
        </p>
        <div className="space-y-2">
            {MOCK_FEEDBACK.modelAnswer.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                    </span>
                    <span className="text-indigo-800">{point}</span>
                </div>
            ))}
        </div>
    </div>
);

// Action Footer
const ActionFooter = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 py-4 px-6 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                    Return to Dashboard
                </button>
                <button
                    onClick={() => navigate('/stations')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                    <PlayCircle size={18} />
                    Start New Session
                </button>
            </div>
        </div>
    );
};

// Main Page Component
export const FeedbackReportPage = () => {
    const historyRef = useRef<HTMLDivElement>(null);
    const examinationRef = useRef<HTMLDivElement>(null);
    const investigationsRef = useRef<HTMLDivElement>(null);
    const ddxRef = useRef<HTMLDivElement>(null);
    const managementRef = useRef<HTMLDivElement>(null);

    const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDomainClick = (domain: string) => {
        switch (domain) {
            case 'history': scrollToRef(historyRef); break;
            case 'examination': scrollToRef(examinationRef); break;
            case 'investigations': scrollToRef(investigationsRef); break;
            case 'ddx': scrollToRef(ddxRef); break;
            case 'management': scrollToRef(managementRef); break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <FeedbackHero />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Critical Errors (if any) */}
                <CriticalErrorsAlert />

                {/* Examiner Verdict */}
                <ExaminerVerdict />

                {/* Domain Score Overview */}
                <DomainOverview onDomainClick={handleDomainClick} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Detailed Checklists */}
                    <div className="lg:col-span-2 space-y-4">
                        <div ref={historyRef}>
                            <DomainAccordion
                                title="History Taking"
                                icon={FileText}
                                score={MOCK_FEEDBACK.domains.history.score}
                                defaultOpen={true}
                            >
                                <HistorySection items={MOCK_FEEDBACK.domains.history.items} />
                            </DomainAccordion>
                        </div>

                        <div ref={examinationRef}>
                            <DomainAccordion
                                title="Physical Examination"
                                icon={Stethoscope}
                                score={MOCK_FEEDBACK.domains.examination.score}
                            >
                                <ExaminationSection items={MOCK_FEEDBACK.domains.examination.items} />
                            </DomainAccordion>
                        </div>

                        <div ref={investigationsRef}>
                            <DomainAccordion
                                title="Investigations"
                                icon={Microscope}
                                score={MOCK_FEEDBACK.domains.investigations.score}
                            >
                                <InvestigationsSection items={MOCK_FEEDBACK.domains.investigations.items} />
                            </DomainAccordion>
                        </div>

                        <div ref={managementRef}>
                            <DomainAccordion
                                title="Management Plan"
                                icon={ClipboardList}
                                score={MOCK_FEEDBACK.domains.management.score}
                            >
                                <ManagementSection items={MOCK_FEEDBACK.domains.management.items} />
                            </DomainAccordion>
                        </div>
                    </div>

                    {/* Right Column - Summary & Learning */}
                    <div className="space-y-6">
                        <div ref={ddxRef}>
                            <DomainAccordion
                                title="Diagnostic Reasoning"
                                icon={Search}
                                score={MOCK_FEEDBACK.domains.ddx.score}
                                defaultOpen={true}
                            >
                                <DDxTimelineSection items={MOCK_FEEDBACK.domains.ddx.items} />
                            </DomainAccordion>
                        </div>

                        <ExaminerFeedbackPanel />
                        <KeyLearningPanel />
                    </div>
                </div>
            </main>

            <ActionFooter />
        </div>
    );
};
