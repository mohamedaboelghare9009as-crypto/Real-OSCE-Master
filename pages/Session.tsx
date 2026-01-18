import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useVoiceTransport } from '../hooks/useVoiceTransport';
import { simulation } from '../services/simulationService';
import { Case } from '../types';

// V3 Layout Components
import SessionLayout from '../components/session/v3/SessionLayout';
import TopBar from '../components/session/v3/TopBar';
import LeftPanel from '../components/session/v3/LeftPanel';
import CenterPanel from '../components/session/v3/CenterPanel';
import RightPanel from '../components/session/v3/RightPanel';
import Footer from '../components/session/v3/Footer';
import PostSessionView from '../components/session/v3/PostSessionView';
import { TrackerItem } from '../components/session/v3/InvestigationsTracker';

type Stage = 'History' | 'Examination' | 'Investigations' | 'Management';

const STAGES: Stage[] = ['History', 'Examination', 'Investigations', 'Management'];

export default function Session() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [stage, setStage] = useState<Stage>('History');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [isPostSession, setIsPostSession] = useState(false);

  // Inputs
  const [inputMode, setInputMode] = useState<'voice' | 'chat'>('voice');

  // Simulation Data
  const [transcript, setTranscript] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([
    { id: '1', text: 'Introduced self', completed: false },
    { id: '2', text: 'Asked onset of symptoms', completed: false },
    { id: '3', text: 'Asked about risk factors', completed: false },
    { id: '4', text: 'Screened for red flags', completed: false },
  ]);
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);
  const [coherence, setCoherence] = useState(65);

  // UI States
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false); // FIX: Prevent echo - tracks speaking state

  // --- Voice Logic (Hook) ---
  const handleSilence = useCallback((text: string) => {
    // Prevent echo: Only process if not currently speaking
    if (!isSpeakingRef.current && text.trim()) {
      handleSendMessage(text);
    }
  }, []);

  const {
    isListening,
    transcript: liveTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition(handleSilence, isSpeaking); // Pass isSpeaking to prevent echo

  // New Voice Transport (Infrastructure)
  const { playAudio: playPcmAudio } = useVoiceTransport();

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      try {
        const c = await simulation.initializeCase(caseId || 'test-session-case');
        if (c) setCurrentCase(c);
      } catch (err) {
        console.error("Init failed", err);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Timer
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [caseId]);

  // --- Handlers ---

  const playAudio = async (blob: Blob) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // FORCE STOP LISTENING
      if (isListening) {
        console.log("[ECHO PREVENTION] Stopping mic for playback...");
        stopListening();
      }

      // Set speaking state (blocks new input)
      isSpeakingRef.current = true;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        // Keep the "Software Deafness" active for a buffer period after audio ends
        setTimeout(() => {
          resetTranscript(); // CRITICAL: Clear echo buffer
          isSpeakingRef.current = false; // Unlock Input
          console.log("Mic Unlocked & Transcript Cleared");
          // Resume listening if in voice mode
          if (inputMode === 'voice') startListening();
        }, 500); // 500ms reduces delay, resetTranscript removes echo
      };

      await audio.play();
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsSpeaking(false);
      isSpeakingRef.current = false; // Reset on error
      // Ensure mic comes back if audio fails
      if (inputMode === 'voice') startListening();
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, timestamp: new Date() };
    setTranscript(prev => [...prev, userMsg]);
    resetTranscript();
    setIsThinking(true);

    try {
      // Use real backend via simulation service
      const res = await simulation.sendMessage(text, transcript);
      setIsThinking(false);

      const respMsg = { id: `p-${Date.now()}`, role: 'patient', text: res.text || (typeof res === 'string' ? res : "No response"), timestamp: new Date() };
      setTranscript(prev => [...prev, respMsg]);

      // Handle Audio if V2 (Blobs)
      if (res.audioBlob) {
        await playAudio(res.audioBlob);
      }
      // Handle PCM Infrastructure (Future/New)
      else if (res.audioPCM) { // Hypothetical field for new transport
        console.log("[Session] Playing PCM via Transport Infrastructure");
        await playPcmAudio(res.audioPCM);
      }
      // Handle PCM Infrastructure (Future/New)
      else if (res.audioPCM) { // Hypothetical field for new transport
        console.log("[Session] Playing PCM via Transport Infrastructure");
        await playPcmAudio(res.audioPCM);
      }
    } catch (e) {
      console.error("Message error", e);
      setIsThinking(false);
    }
  };

  const handleAction = (action: string) => {
    console.log("Action:", action);

    if (action.startsWith('order_')) {
      const testName = action.replace('order_', '').toUpperCase();
      const newItem: TrackerItem = {
        id: Date.now().toString(),
        name: testName,
        category: 'Labs',
        status: 'ordered'
      };
      setTrackerItems(prev => [newItem, ...prev]);

      // Simulate result arrival
      setTimeout(() => {
        setTrackerItems(prev => prev.map(i => i.id === newItem.id ? { ...i, status: 'result_available', result: 'Normal' } : i));
      }, 3000);
    }
  };

  const handleNextStage = () => {
    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) {
      setStage(STAGES[idx + 1]);
    } else {
      setIsPostSession(true);
    }
  };

  // --- Voice Handlers ---
  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Restart listener if it stops but we didn't explicitly want it to (handled by hook mostly, but precise state sync needed)
  // The 'useSpeechRecognition' hook handles 'continuous' internally. 
  // However, we want to ensure visual state matches.


  // --- Render ---

  if (isPostSession) {
    return <PostSessionView />;
  }

  if (loading) {
    return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-500 font-mono animate-pulse">Initializing Simulation Core...</div>;
  }

  return (
    <SessionLayout
      topBar={
        <TopBar
          title={currentCase?.title || "Unknown Case"}
          stage={stage}
          difficulty={2}
          timeLeft={timeLeft}
          onExit={() => navigate('/dashboard')}
        />
      }
      leftPanel={
        <LeftPanel
          stage={stage}
          onAction={handleAction}
        />
      }
      centerPanel={
        <CenterPanel
          transcript={transcript}
          inputMode={inputMode}
          isListing={isListening}
          isThinking={isThinking}
          isSpeaking={isSpeaking}
          currentQuery={isSpeaking ? '' : liveTranscript}
          onSendMessage={handleSendMessage}
        />
      }
      rightPanel={
        <RightPanel
          checklistItems={checklistItems}
          trackerItems={trackerItems}
          coherenceScore={coherence}
        />
      }
      footer={
        <Footer
          isListening={isListening}
          onToggleMic={toggleMic}
          inputMode={inputMode}
          onToggleMode={() => setInputMode(prev => prev === 'voice' ? 'chat' : 'voice')}
          onNextStage={handleNextStage}
          onEndSession={() => setIsPostSession(true)}
          canAdvance={true} // Could add logic to block if criteria not met
        />
      }
    />
  );
}