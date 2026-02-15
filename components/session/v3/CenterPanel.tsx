import React, { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../v2/Avatar';
import { PatientEmotion } from '../../../types';
import { Send, Activity, FlaskConical, CheckCircle2 } from 'lucide-react';
import VitalsMonitor from '../VitalsMonitor';
import { useVoiceActivity } from '../../../hooks/useVoiceActivity';
import {
  fadeScaleVariants,
  slideVariants,
  messageSlideVariants,
  messageContainerVariants,
  cardContainerVariants,
  cardVariants,
  investigationCardVariants,
  DURATIONS,
  SPRINGS,
  thinkingDotsVariants,
  thinkingDotVariants,
  listeningWaveVariants,
  prefersReducedMotion,
  getStaggerDelay,
} from './animations';

interface Message {
  id: string;
  role: 'user' | 'model' | 'nurse';
  text: string;
  timestamp: Date;
}

interface CenterPanelProps {
  stage: 'History' | 'Examination' | 'Investigations' | 'Management';
  transcript: Message[];
  isListing: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  inputMode: 'voice' | 'chat';
  onSendMessage: (text: string) => void;
  currentQuery: string;
  caseData: any;
  vitals?: any;
  examFindings?: any[];
  invResults?: any[];
  mgmtPlan?: string;
}

const CenterPanel: React.FC<CenterPanelProps> = ({
  stage,
  transcript,
  isListing,
  isThinking,
  isSpeaking,
  inputMode,
  onSendMessage,
  currentQuery,
  caseData,
  vitals,
  examFindings = [],
  invResults = [],
  mgmtPlan = "",
}) => {
  // Extract patient name from case data (now included in normalized case)
  const patientName = caseData?.patientName || "Patient";
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = React.useState('');
  const [prevStage, setPrevStage] = React.useState(stage);
  const [animationDirection, setAnimationDirection] = React.useState<'forward' | 'backward'>('forward');
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Parse vitals if they exist
  const vitalsData = useMemo(() => {
    if (!vitals) return null;
    // Check if vitals.bp is a string that needs parsing (e.g., "120/80")
    if (typeof vitals.bp === 'string' && vitals.bp.includes('/')) {
      const [sbp, dbp] = vitals.bp.split('/').map((v: string) => parseInt(v));
      return { ...vitals, sbp: sbp || null, dbp: dbp || null };
    }
    // Otherwise, return vitals as is (assuming sbp/dbp are already numbers or not present)
    return vitals;
  }, [vitals]);

  // Track stage changes for directional animations
  useEffect(() => {
    const stages = ['History', 'Examination', 'Investigations', 'Management'];
    const currentIndex = stages.indexOf(stage);
    const prevIndex = stages.indexOf(prevStage);

    if (currentIndex !== prevIndex) {
      setAnimationDirection(currentIndex > prevIndex ? 'forward' : 'backward');
      setPrevStage(stage);
    }
  }, [stage, prevStage]);

  // Auto-scroll to bottom only for History
  useEffect(() => {
    if (stage === 'History') {
      scrollEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [transcript, currentQuery, stage, reducedMotion]);

  const handleSend = () => {
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  let emotion = PatientEmotion.NEUTRAL;
  if (isSpeaking) emotion = PatientEmotion.SPEAKING;
  if (isListing) emotion = PatientEmotion.LISTENING;

  // Voice activity detection for reactive sphere
  const { audioLevel } = useVoiceActivity(isListing);

  // Get stage transition variants based on direction
  const getStageVariants = () => {
    if (reducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
    return animationDirection === 'forward'
      ? slideVariants.slideRight
      : slideVariants.slideLeft;
  };

  const stageVariants = getStageVariants();

  // Status indicator animation configuration
  const statusConfig = useMemo(() => {
    if (reducedMotion) return { animate: {} };

    if (isThinking) {
      return {
        animate: {
          scale: [1, 1.05, 1],
          opacity: [1, 0.7, 1],
        },
        transition: {
          duration: 1,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      };
    }
    return { animate: {} };
  }, [isThinking, reducedMotion]);

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stage}
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 flex flex-col min-h-0"
          layout
        >
          {stage === 'History' && (
            <>
              {/* Patient Area (Flexible Height) */}
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATIONS.standard,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.1,
                }}
                className={`
                  flex-none flex flex-col items-center justify-center relative transition-all duration-500 ease-in-out
                  ${transcript.length > 0 ? 'h-[35vh]' : 'h-[50vh]'}
                  border-b border-slate-200/50 bg-gradient-to-b from-white/50 to-transparent
                `}
              >
                {(() => {
                  const lastMsg = transcript[transcript.length - 1];
                  const isNurseSpeaking = isSpeaking && lastMsg?.role === 'nurse';

                  return (
                    <div className="flex items-end gap-8">
                      <motion.div
                        animate={{
                          opacity: isNurseSpeaking ? 0.4 : 1,
                          scale: isNurseSpeaking ? 0.75 : 1,
                          filter: isNurseSpeaking ? 'blur(1px)' : 'blur(0px)',
                        }}
                        transition={{
                          duration: DURATIONS.standard,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <Avatar
                          type="patient"
                          emotion={!isNurseSpeaking && isSpeaking ? PatientEmotion.SPEAKING : emotion}
                          patientName={patientName}
                          audioLevel={isListing ? audioLevel : (!isNurseSpeaking && isSpeaking ? 0.6 : 0.1)}
                          className="scale-110 md:scale-125 transition-transform duration-700"
                        />
                      </motion.div>

                      <motion.div
                        animate={{
                          opacity: isNurseSpeaking ? 1 : 0.4,
                          scale: isNurseSpeaking ? 1.1 : 0.75,
                          filter: isNurseSpeaking ? 'blur(0px)' : 'blur(1px)',
                        }}
                        transition={{
                          duration: DURATIONS.standard,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <Avatar
                          type="nurse"
                          emotion={isNurseSpeaking ? PatientEmotion.SPEAKING : PatientEmotion.NEUTRAL}
                          audioLevel={isNurseSpeaking ? 0.5 : 0.1}
                          className=""
                        />
                      </motion.div>
                    </div>
                  );
                })()}

                <motion.div
                  {...statusConfig}
                  className={`
                    absolute top-6 px-4 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase tracking-widest shadow-sm
                    ${isThinking ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : ''}
                    ${isSpeaking ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : ''}
                    ${isListing ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' : ''}
                    ${!isThinking && !isSpeaking && !isListing ? 'bg-slate-100 border-slate-200 text-slate-500' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isThinking && (
                      <motion.div
                        variants={thinkingDotsVariants}
                        initial="initial"
                        animate="animate"
                        className="flex gap-0.5"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            variants={thinkingDotVariants}
                            className="w-1 h-1 bg-amber-500 rounded-full"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </motion.div>
                    )}
                    {isThinking
                      ? 'Processing...'
                      : isSpeaking
                        ? 'Speaking'
                        : isListing
                          ? 'Listening'
                          : 'Ready'}
                    {isSpeaking && (() => {
                      const lastMsg = transcript[transcript.length - 1];
                      return ` (${lastMsg?.role === 'nurse' ? 'Nurse' : 'Patient'})`;
                    })()}
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {(currentQuery || isThinking) && (
                    <motion.div
                      key={currentQuery || 'thinking'}
                      initial={reducedMotion ? {} : { opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reducedMotion ? {} : { opacity: 0, y: -10, scale: 0.98 }}
                      transition={{
                        duration: DURATIONS.quick,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="absolute bottom-4 w-full px-6 flex justify-center"
                    >
                      <span className="inline-block px-6 py-2 bg-white/80 backdrop-blur-[2px] rounded-xl text-slate-800 text-sm font-medium leading-relaxed border border-slate-200 mx-auto max-w-md text-center shadow-lg">
                        {currentQuery || (isThinking ? '...' : '')}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Listening wave animation */}
                <AnimatePresence>
                  {isListing && (
                    <motion.div
                      variants={listeningWaveVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Transcript Area */}
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATIONS.standard, delay: 0.2 }}
                className="flex-1 flex flex-col min-h-0 bg-white/10 relative"
              >
                <motion.div
                  variants={messageContainerVariants}
                  initial="initial"
                  animate="animate"
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-6"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {transcript.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        variants={messageSlideVariants[msg.role]}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                        custom={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        style={{
                          transitionDelay: reducedMotion ? 0 : `${getStaggerDelay(index, 0.03)}s`,
                        }}
                      >
                        <div
                          className={`
                            max-w-[75%] clay-card !p-4 !rounded-2xl
                            ${msg.role === 'user' ? '!bg-blue-50/80 !border-blue-100 text-slate-800' : '!bg-white/90 text-slate-800'}
                            ${msg.role === 'nurse' ? '!bg-amber-50/50 !border-amber-200' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2 mb-1 opacity-60">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user'
                                ? 'text-blue-600'
                                : msg.role === 'nurse'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                                }`}
                            >
                              {msg.role === 'user' ? 'Student' : msg.role === 'nurse' ? 'Nurse Sarah' : 'Patient'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={scrollEndRef} />
                </motion.div>

                {inputMode === 'chat' && (
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: DURATIONS.standard,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.1,
                    }}
                    className="p-4 pt-8"
                  >
                    <div className="flex gap-2">
                      <motion.input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your response..."
                        className="flex-1 bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        whileFocus={reducedMotion ? {} : { scale: 1.005 }}
                        transition={SPRINGS.gentle}
                      />
                      <motion.button
                        onClick={handleSend}
                        disabled={!chatInput.trim()}
                        className="p-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={reducedMotion ? {} : { scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={SPRINGS.snappy}
                      >
                        <Send size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}

          {stage === 'Examination' && (
            <motion.div
              variants={cardContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto"
            >
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="flex items-center gap-3"
              >
                <Activity className="text-rose-500" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Physical Examination</h3>
              </motion.div>

              <motion.div variants={cardVariants}>
                <VitalsMonitor vitals={vitalsData} />
              </motion.div>

              <motion.div
                variants={cardContainerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {examFindings.map((f: any, index: number) => (
                    <motion.div
                      key={f.system || index}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      whileHover={reducedMotion ? {} : 'hover'}
                      custom={index}
                      layout
                      className="clay-card !p-5 cursor-default"
                    >
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {f.system}
                      </h4>
                      <p className="text-slate-800 text-sm leading-relaxed">
                        {typeof f.finding === 'string' ? f.finding : JSON.stringify(f.finding)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {examFindings.length === 0 && (
                  <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    className="clay-card !p-5 col-span-full text-center py-10"
                  >
                    <p className="text-slate-400 italic">No specific examination findings recorded for this case.</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {stage === 'Investigations' && (
            <motion.div
              variants={cardContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto"
            >
              <motion.div
                variants={cardVariants}
                className="flex items-center gap-3"
              >
                <FlaskConical className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Clinical Investigations</h3>
              </motion.div>

              <div className="space-y-6">
                {['bedside', 'confirmatory'].map((type, typeIndex) => (
                  <motion.div
                    key={type}
                    initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: DURATIONS.standard,
                      delay: typeIndex * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <motion.h4
                      initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: DURATIONS.standard,
                        delay: typeIndex * 0.1 + 0.1,
                      }}
                      className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2"
                    >
                      {type} Results
                    </motion.h4>
                    <motion.div
                      variants={cardContainerVariants}
                      initial="initial"
                      animate="animate"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {invResults.filter(r => r.category?.toLowerCase() === type.toLowerCase()).length > 0 ? (
                          invResults
                            .filter(r => r.category?.toLowerCase() === type.toLowerCase())
                            .map((inv: any, idx: number) => (
                              <motion.div
                                key={`${type}-${idx}`}
                                variants={investigationCardVariants}
                                initial="initial"
                                animate="animate"
                                whileHover={reducedMotion ? {} : { scale: 1.01, y: -2 }}
                                custom={idx}
                                layout
                                className={`
                                  clay-card !p-5 cursor-default
                                  ${inv.abnormal ? '!bg-amber-50/50 !border-amber-200' : ''}
                                `}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-slate-900">{inv.test || inv.name}</span>
                                  {inv.abnormal && (
                                    <motion.span
                                      initial={reducedMotion ? {} : { scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 30,
                                        delay: idx * 0.05 + 0.2,
                                      }}
                                      className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold uppercase"
                                    >
                                      Abnormal
                                    </motion.span>
                                  )}
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span
                                    className={`text-lg font-bold ${inv.abnormal ? 'text-red-600' : 'text-blue-600'
                                      }`}
                                  >
                                    {inv.result}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {inv.normalRange}
                                  </span>
                                </div>
                              </motion.div>
                            ))
                        ) : (
                          <motion.div
                            variants={cardVariants}
                            className="clay-card !p-5 col-span-full opacity-50"
                          >
                            <p className="text-slate-400 text-xs text-center italic">
                              No {type} investigations requested.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'Management' && (
            <motion.div
              variants={fadeScaleVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 p-8 flex flex-col gap-6 text-center justify-center"
            >
              <motion.div
                initial={reducedMotion ? {} : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
              </motion.div>

              <motion.h3
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATIONS.standard,
                  delay: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="text-2xl font-bold text-slate-900"
              >
                Final Management Plan
              </motion.h3>

              <motion.textarea
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATIONS.standard,
                  delay: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
                whileFocus={reducedMotion ? {} : { scale: 1.005 }}
                className="clay-card w-full h-48 bg-white/50 text-left text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter your management plan here..."
              />

              <motion.p
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATIONS.standard, delay: 0.4 }}
                className="text-sm text-slate-500 max-w-md mx-auto"
              >
                Review your findings and provide a comprehensive management plan. This will be evaluated against the expected clinical pathway.
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CenterPanel;
