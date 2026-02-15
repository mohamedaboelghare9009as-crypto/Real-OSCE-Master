'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketSession } from '@/hooks/useGeminiLiveSession';
import { PatientEmotion } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

// V3 UI Components
import SessionLayout from '@/components/session/SessionLayout';
import TopBar from '@/components/session/TopBar';
import LeftPanel from '@/components/session/LeftPanel';
import CenterPanel from '@/components/session/CenterPanel';
import RightPanel from '@/components/session/RightPanel';
import Footer from '@/components/session/Footer';
import PostSessionView from '@/components/session/PostSessionView';
import { NurseDialog } from '@/components/vibe/NurseDialog';
import DDxInterstitial from '@/components/session/DDxInterstitial';
import EvaluationReport from '@/components/session/EvaluationReport';

// Define the possible stages
type Stage = 'History' | 'Examination' | 'Investigations' | 'Management';
const STAGES: Stage[] = ['History', 'Examination', 'Investigations', 'Management'];

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;

    // --- State ---
    const [stage, setStage] = useState<Stage>('History');
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isPostSession, setIsPostSession] = useState(false);
    const [inputMode, setInputMode] = useState<'voice' | 'chat'>('voice');
    const [transcript, setTranscript] = useState<any[]>([]);

    // Vitals State (null initially in V3)
    const [vitals, setVitals] = useState<any>(null);

    // Stable Session ID
    const [sessionId] = useState(() => `${caseId}-${Date.now()}`);

    // Phase 2: Structural Simulation State
    const [examFindings, setExamFindings] = useState<any[]>([]);
    const [invResults, setInvResults] = useState<any[]>([]);
    const [mgmtPlan, setMgmtPlan] = useState('');

    // DDx and Evaluation State
    const [showDDxInterstitial, setShowDDxInterstitial] = useState(false);
    const [currentDDxStage, setCurrentDDxStage] = useState<string>('');
    const [ddxByStage, setDdxByStage] = useState<any>({});
    const [evaluationResult, setEvaluationResult] = useState<any>(null);
    const [showEvaluation, setShowEvaluation] = useState(false);

    // Nurse Specialist State
    const [showNurse, setShowNurse] = useState(false);
    const [nurseMessage, setNurseMessage] = useState("Initializing clinical environment...");
...
    // --- Gemini Live Brain ---
    const {
        isThinking,
        isAiSpeaking,
        sendMessage,
        startMic,
        stopMic,
        resetSession
    } = useSocketSession({
        caseId: caseId || 'default',
        sessionId,
        onAiMessage: (text, meta) => {
            const isNurse = meta?.role === 'nurse';
            const respMsg = {
                id: `ai-${Date.now()}`,
                role: isNurse ? 'nurse' : (meta?.role || 'model'),
                text,
                timestamp: new Date()
            };
            setTranscript(prev => [...prev, respMsg]);

            if (isNurse) {
                setNurseMessage(text);
                setShowNurse(true);
            }
        },
        onStateUpdate: (state) => {
            console.log("[V3] State Update Applied:", state);
            if (state.vitals) setVitals(state.vitals);
            if (state.physicalExamFindings) setExamFindings(state.physicalExamFindings);
            if (state.investigationResults) setInvResults(state.investigationResults);
            if (state.managementPlan !== undefined) setMgmtPlan(state.managementPlan);
        },
        onEvaluationComplete: (evaluation: any) => {
            console.log("[V3] Evaluation Complete:", evaluation);
            setEvaluationResult(evaluation);
            setShowEvaluation(true);
        }
    });

    // --- Voice Coordination ---
    const handleSilence = useCallback((text: string) => {
        if (!isAiSpeaking && text.trim()) {
            const userMsg = { id: `u-${Date.now()}`, role: 'user', text, timestamp: new Date() };
            setTranscript(prev => [...prev, userMsg]);
            sendMessage(text);
        }
    }, [isAiSpeaking, sendMessage]);

    const {
        isListening,
        transcript: liveTranscript,
        startListening,
        stopListening
    } = useSpeechRecognition(handleSilence, isThinking || isAiSpeaking);

    // --- Init ---
    useEffect(() => {
        setLoading(false);
        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- UI Handlers ---
    const toggleMic = () => isListening ? stopListening() : startListening();

    const handleNextStage = () => {
        const idx = STAGES.indexOf(stage);

        // Show DDx interstitial after History, Examination, and Investigations
        if (stage === 'History' || stage === 'Examination' || stage === 'Investigations') {
            setCurrentDDxStage(stage);
            setShowDDxInterstitial(true);
        } else if (idx < STAGES.length - 1) {
            setStage(STAGES[idx + 1]);
        } else {
            // Request evaluation at end of session
            requestEvaluation();
        }
    };

    const handleDDxSubmit = (ddxList: Array<{ diagnosis: string; status: string }>) => {
        console.log(`[V3] Submitting DDx for ${currentDDxStage}:`, ddxList);

        // Store DDx locally
        setDdxByStage((prev: any) => ({
            ...prev,
            [currentDDxStage]: ddxList
        }));

        // Send to backend
        sendMessage('', undefined, {
            event: 'submit-ddx',
            data: {
                sessionId,
                stage: currentDDxStage,
                ddxList
            }
        });

        // Move to next stage
        const idx = STAGES.indexOf(stage);
        if (idx < STAGES.length - 1) {
            setStage(STAGES[idx + 1]);
        }
    };

    const requestEvaluation = () => {
        console.log('[V3] Requesting evaluation...');
        sendMessage('', undefined, {
            event: 'request-evaluation',
            data: {
                sessionId,
                caseId: caseId || 'default'
            }
        });
    };

    // Sync transcript to backend
    useEffect(() => {
        if (transcript.length > 0) {
            const lastMessage = transcript[transcript.length - 1];
            sendMessage('', undefined, {
                event: 'add-transcript-message',
                data: {
                    sessionId,
                    role: lastMessage.role,
                    text: lastMessage.text
                }
            });
        }
    }, [transcript]);

    if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono">Loading Neural Session...</div>;
    if (isPostSession) return <PostSessionView />;

    return (
        <div className="relative h-screen overflow-hidden bg-slate-950">
            <SessionLayout
                topBar={
                    <TopBar
                        title={`Case: ${caseId}`}
                        stage={stage}
                        difficulty={3}
                        timeLeft={timeLeft}
                        onExit={() => router.push('/')}
                    />
                }
                leftPanel={
                    <motion.div
                        key={stage}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-full"
                    >
                        <LeftPanel
                            stage={stage}
                            onAction={(action) => {
                                console.log("[V3] LeftPanel Action:", action);
                                const lowerAction = action.toLowerCase();

                                if (lowerAction.startsWith('order_') || lowerAction === 'vitals') {
                                    const item = action.startsWith('order_') ? action.replace('order_', '') : action;
                                    setTranscript(prev => [...prev, { id: `u-n-${Date.now()}`, role: 'user', text: `Nurse, please ${item}`, timestamp: new Date() }]);
                                    sendMessage(item, 'Nurse');
                                } else if (lowerAction.startsWith('ask_') || lowerAction === 'clarify') {
                                    const query = action === 'clarify' ? "Can you clarify that last part?" : "Can you tell me more about that?";
                                    setTranscript(prev => [...prev, { id: `u-p-${Date.now()}`, role: 'user', text: query, timestamp: new Date() }]);
                                    sendMessage(query, 'Patient');
                                } else if (lowerAction.startsWith('exam_')) {
                                    const target = action.replace('exam_', '');
                                    setTranscript(prev => [...prev, { id: `u-e-${Date.now()}`, role: 'user', text: `I'd like to examine your ${target}.`, timestamp: new Date() }]);
                                    sendMessage(`I am examining your ${target}. What do I find?`, 'Patient');
                                }
                            }}
                        />
                    </motion.div>
                }
                centerPanel={
                    <CenterPanel
                        stage={stage}
                        transcript={transcript}
                        inputMode={inputMode}
                        isListing={isListening}
                        isThinking={isThinking}
                        isSpeaking={isAiSpeaking}
                        currentQuery={liveTranscript}
                        vitals={vitals}
                        examFindings={examFindings}
                        invResults={invResults}
                        mgmtPlan={mgmtPlan}
                        onSendMessage={(t: string) => {
                            setTranscript(prev => [...prev, { id: Date.now().toString(), role: 'user', text: t, timestamp: new Date() }]);
                            sendMessage(t);
                        }}
                    />
                }
                rightPanel={
                    <motion.div
                        key={stage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-full"
                    >
                        <RightPanel
                            stage={stage}
                            checklistItems={[]}
                            trackerItems={[]}
                            coherenceScore={85}
                        />
                    </motion.div>
                }
                footer={
                    <Footer
                        isListening={isListening}
                        onToggleMic={toggleMic}
                        inputMode={inputMode}
                        onToggleMode={() => setInputMode(prev => prev === 'voice' ? 'chat' : 'voice')}
                        onNextStage={handleNextStage}
                        onEndSession={() => setIsPostSession(true)}
                        canAdvance={true}
                    />
                }
            />

            {/* Nurse Specialist Overlay */}
            <NurseDialog
                isVisible={showNurse}
                message={nurseMessage}
                isThinking={false}
            />

            {/* Toggle Nurse Button */}
            <button
                onClick={() => setShowNurse(!showNurse)}
                className="fixed bottom-24 right-6 p-3 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 backdrop-blur-md hover:bg-blue-600/40 transition-all z-50"
            >
                NPC
            </button>

            {/* DDx Interstitial Modal */}
            <DDxInterstitial
                isOpen={showDDxInterstitial}
                stage={currentDDxStage}
                onContinue={handleDDxSubmit}
                onClose={() => setShowDDxInterstitial(false)}
            />

            {/* Evaluation Report Modal */}
            {showEvaluation && evaluationResult && (
                <EvaluationReport
                    evaluation={evaluationResult}
                    onClose={() => setShowEvaluation(false)}
                />
            )}
        </div>
    );
}
