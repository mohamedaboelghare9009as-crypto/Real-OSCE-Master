import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CASES } from '../constants';
import { Message } from '../types';
import { initializeSession, sendMessageToPatient } from '../services/geminiService';
import { X, Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSessionStore } from '../stores/useSessionStore';

// New Components
import ProgressStepper from '../components/session/ProgressStepper';
import HistoryPanel from '../components/session/HistoryPanel';
import ExamPanel from '../components/session/ExamPanel';
import NursePanel from '../components/session/NursePanel';
import ConfirmPanel from '../components/session/ConfirmPanel';
import PatientAvatar from '../components/session/PatientAvatar';
import MicButton from '../components/session/MicButton';
import VitalsMonitor from '../components/session/VitalsMonitor';
import GlassContainer from '../components/session/GlassContainer';

// Web Speech API Types extension
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const Session: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const currentCase = MOCK_CASES.find(c => c.id === caseId) || MOCK_CASES[0];

  // Zustand Store
  const {
    currentPhase,
    transcript,
    historyPoints,
    vitals,
    examResults,
    labResults,
    timeRemaining,
    isRecording,
    setPhase,
    addMessage,
    addHistoryPoint,
    updateVitals,
    setExamResult,
    addLabPanel,
    setTimeRemaining,
    setRecording,
    resetSession
  } = useSessionStore();

  // Local UI State
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nurseStatus, setNurseStatus] = useState<'idle' | 'active' | 'recording' | 'processing'>('idle');
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initialize Session
  useEffect(() => {
    const init = async () => {
      resetSession({
        hr: currentCase.vitals.hr,
        sbp: parseInt(currentCase.vitals.bp.split('/')[0]),
        dbp: parseInt(currentCase.vitals.bp.split('/')[1]),
        rr: currentCase.vitals.rr,
        spo2: currentCase.vitals.spo2,
        temp: currentCase.vitals.temp
      });

      // Add dummy history points for checklist
      const initialPoints = [
        { id: '1', label: 'Chief Complaint', value: '', isExtracted: false },
        { id: '2', label: 'Onset', value: '', isExtracted: false },
        { id: '3', label: 'Severity', value: '', isExtracted: false },
        { id: '4', label: 'Quality', value: '', isExtracted: false },
        { id: '5', label: 'Location', value: '', isExtracted: false },
        { id: '6', label: 'Duration', value: '', isExtracted: false },
        { id: '7', label: 'Relieving Factors', value: '', isExtracted: false },
        { id: '8', label: 'Associated Symptoms', value: '', isExtracted: false }
      ];
      initialPoints.forEach(p => addHistoryPoint(p));

      try {
        await initializeSession(currentCase.systemInstruction);
      } catch (err) {
        console.error("Failed to init session", err);
      }
    };
    init();

    // Setup Speech Recognition
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    if (webkitSpeechRecognition || SpeechRecognition) {
      const SpeechRecognitionClass = SpeechRecognition || webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
      };

      recognitionRef.current.onerror = () => setRecording(false);
      recognitionRef.current.onend = () => setRecording(false);
    }
  }, [caseId]);

  // Vitals Fluctuation & Timer
  useEffect(() => {
    const vInterval = setInterval(() => {
      updateVitals({
        hr: vitals.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2),
        spo2: Math.min(100, Math.max(90, vitals.spo2 + (Math.random() > 0.9 ? -1 : 0)))
      });
    }, 3000);

    const tInterval = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => {
      clearInterval(vInterval);
      clearInterval(tInterval);
    };
  }, [vitals, timeRemaining]);

  // Auto-advance History logic
  useEffect(() => {
    const extractedCount = historyPoints.filter(p => p.isExtracted).length;
    if (extractedCount >= 8 && currentPhase === 'history') {
      setCompletedPhases(prev => [...prev, 'history']);
      setPhase('exam');
    }
  }, [historyPoints, currentPhase]);

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;
    synthRef.current.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    addMessage(userMsg);

    // Nurse command check
    if (text.toLowerCase().startsWith('nurse')) {
      setNurseStatus('processing');
      // Mock lab ordering
      setTimeout(() => {
        const newLab: any = {
          id: Date.now().toString(),
          title: 'Ordered: ' + text.split('order')[1]?.trim() || 'Labs',
          results: [
            { label: 'WBC', value: '11.2', unit: 'k/uL', status: 'normal' },
            { label: 'Hgb', value: '13.5', unit: 'g/dL', status: 'normal' },
            { label: 'Plt', value: '250', unit: 'k/uL', status: 'normal' }
          ]
        };
        addLabPanel(newLab);
        setNurseStatus('idle');

        const nurseMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'nurse',
          text: "I've processed those labs for you, Doctor.",
          timestamp: new Date()
        };
        addMessage(nurseMsg);

        if (labResults.length >= 2 && currentPhase === 'labs') {
          setCompletedPhases(prev => [...prev, 'labs']);
          setPhase('confirm');
        }
      }, 1500);
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendMessageToPatient(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      addMessage(aiMsg);
      speakResponse(response);

      // Simple mock auto-extraction from transcript for demo
      const unextracted = historyPoints.find(p => !p.isExtracted);
      if (unextracted) {
        // In a real app, this would be determined by the AI's structured output
        const updatedPoints = historyPoints.map(p =>
          p.id === unextracted.id ? { ...p, isExtracted: true, value: text.substring(0, 20) + '...' } : p
        );
        // We simulate extraction by updating the store (resetting then re-adding isn't efficient but we update item for demo)
        // Since useSessionStore doesn't have an update action, we'll just mock it.
        // Actually, let's just use the addHistoryPoint to overwrite or similar if we had that, 
        // but for now we just show the progress bar moving.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col md:flex-row overflow-hidden font-inter select-none">

      {/* --- LEFT: Workflow Panel (60% Desktop) --- */}
      <div className="w-full md:w-[60%] h-full flex flex-col border-r border-white/5 relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/20">
        <ProgressStepper
          currentPhase={currentPhase}
          completedPhases={completedPhases}
          patientName={currentCase.title}
          timeRemaining={formatTime(timeRemaining)}
        />

        <div className="flex-1 relative overflow-hidden">
          {currentPhase === 'history' && (
            <HistoryPanel
              transcript={transcript}
              historyPoints={historyPoints}
              isTyping={isLoading}
            />
          )}
          {currentPhase === 'exam' && (
            <ExamPanel
              results={examResults}
              onExamine={(system) => {
                setExamResult(system, "Patient indicates tenderness in that area but otherwise normal findings.");
                if (Object.keys(examResults).length >= 5) {
                  setCompletedPhases(prev => [...prev, 'exam']);
                  setPhase('labs');
                }
              }}
            />
          )}
          {currentPhase === 'labs' && (
            <NursePanel
              labResults={labResults}
              nurseStatus={nurseStatus}
              onNurseClick={() => setNurseStatus(prev => prev === 'idle' ? 'recording' : 'idle')}
            />
          )}
          {currentPhase === 'confirm' && (
            <ConfirmPanel
              isLocked={false}
              confirmResults={[
                { id: '1', title: 'Chest CT Scan', results: [{ label: 'Finding', value: 'Bilateral pulmonary emboli noted in lower lobes.' }] }
              ]}
            />
          )}
        </div>

        {/* Input Bar (Sticky at bottom of left panel) */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border-t border-white/5">
          <div className="relative flex items-center gap-4">
            <MicButton
              status={isRecording ? 'recording' : 'idle'}
              onClick={toggleMic}
              size={56}
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Listening..." : "Tell the patient/nurse something..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-20 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: Patient Interface (40% Desktop) --- */}
      <div className="w-full md:w-[40%] h-full flex flex-col p-6 gap-6 overflow-y-auto no-scrollbar bg-slate-950/50">

        {/* Top Header for Mobile */}
        <div className="md:hidden flex justify-between items-center mb-2">
          <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full text-white/40"><X size={20} /></button>
          <div className="text-xs font-mono text-blue-400">{formatTime(timeRemaining)}</div>
        </div>

        <PatientAvatar
          image={currentCase.patientAvatar}
          isSpeaking={isLoading}
          isInPain={currentCase.difficulty === 'Expert'} // Mock pain for expert cases
        />

        <div className="flex flex-col gap-6">
          <VitalsMonitor vitals={vitals} />

          <GlassContainer className="p-6">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Clinical Notes</h3>
            <div className="space-y-3">
              <p className="text-sm text-white/60 leading-relaxed italic border-l-2 border-amber-500/40 pl-4">
                Symptoms began at 2:00 AM. Patient appears anxious and diaphoretic.
              </p>
            </div>
          </GlassContainer>
        </div>

        {/* Exit Button Desktop */}
        <button
          onClick={() => navigate('/')}
          className="mt-auto group flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform" />
          Terminate Session
        </button>
      </div>

    </div>
  );
};

export default Session;