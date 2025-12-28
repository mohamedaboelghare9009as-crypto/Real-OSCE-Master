import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CASES } from '../constants';
import { VitalsData, Message } from '../types';
import { initializeSession, sendMessageToPatient } from '../services/geminiService';
import { 
  Mic, MicOff, Send, X, Activity, Heart, Thermometer, 
  Wind, Droplets, Clock, Clipboard, Stethoscope, FileText, Loader2
} from 'lucide-react';

// Web Speech API Types extension
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const Session: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [currentCase] = useState(() => MOCK_CASES.find(c => c.id === caseId) || MOCK_CASES[0]);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [vitals, setVitals] = useState<VitalsData>({
    hr: currentCase.vitals.hr,
    sbp: parseInt(currentCase.vitals.bp.split('/')[0]),
    dbp: parseInt(currentCase.vitals.bp.split('/')[1]),
    rr: currentCase.vitals.rr,
    spo2: currentCase.vitals.spo2,
    temp: currentCase.vitals.temp
  });
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 mins
  const [activeTab, setActiveTab] = useState<'history' | 'physical' | 'tests'>('history');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initialize Gemini & Speech Recognition
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSession(currentCase.systemInstruction);
      } catch (err) {
        console.error("Failed to init session", err);
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          text: "System Error: Unable to connect to AI simulation engine. Please check configuration.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
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
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
                // Optionally auto-send if silence detected or specific keywords, 
                // but for now we let user review and press send for accuracy.
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
            if (isListening) {
                // If we didn't manually stop, try to restart (continuous listening simulation)
                // However, often better to just let it stop.
            }
        };
    }

  }, [currentCase]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Browser does not support Speech Recognition.");
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current) {
        // Cancel any currently playing speech
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to find a good voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        synthRef.current.speak(utterance);
    }
  };

  // Vitals Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(v => ({
        ...v,
        hr: v.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
        rr: v.rr + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0),
        spo2: Math.min(100, Math.max(85, v.spo2 + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    if (isListening) {
        toggleListening(); // Stop listening on send
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToPatient(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speakResponse(responseText); // Trigger TTS
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: "Error: Patient is unresponsive. Connection to AI service interrupted.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex bg-[#F6F8FA] overflow-hidden relative font-inter">
      
      {/* --- LEFT SIDE: Patient & Vitals --- */}
      <div className="w-1/3 h-full border-r border-slate-200 flex flex-col relative bg-slate-50">
        
        {/* Header / Timer */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <button onClick={() => navigate('/')} className="p-3 bg-white/80 hover:bg-white rounded-full text-slate-700 backdrop-blur-md shadow-soft transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className={`px-4 py-2 rounded-full backdrop-blur-md bg-white/90 shadow-soft flex items-center gap-2 font-mono border border-white/50 ${timeRemaining < 60 ? 'text-red-500' : 'text-slate-900'}`}>
            <Clock className="w-4 h-4 text-emerald-500" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Patient Visuals */}
        <div className="flex-1 relative">
            <img src={currentCase.patientAvatar} alt="patient" className="w-full h-full object-cover" />
            
            {/* Vitals Overlay */}
            <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 grid grid-cols-2 gap-4 shadow-soft">
                <VitalDisplay label="HR" value={vitals.hr} unit="bpm" icon={Heart} color="text-red-500" />
                <VitalDisplay label="BP" value={`${vitals.sbp}/${vitals.dbp}`} unit="mmHg" icon={Activity} color="text-emerald-500" />
                <VitalDisplay label="RR" value={vitals.rr} unit="/min" icon={Wind} color="text-blue-500" />
                <VitalDisplay label="SpO2" value={vitals.spo2} unit="%" icon={Droplets} color="text-cyan-500" />
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Interaction & Clinical Tools --- */}
      <div className="w-2/3 h-full flex flex-col bg-[#F6F8FA] relative p-4">
        
        <div className="bg-white rounded-[2.5rem] shadow-soft flex-1 flex flex-col overflow-hidden relative border border-slate-100">
            
            {/* Top Tabs */}
            <div className="h-16 border-b border-slate-100 flex items-center px-8 gap-8">
            {[
                { id: 'history', label: 'History', icon: Clipboard },
                { id: 'physical', label: 'Physical Exam', icon: Stethoscope },
                { id: 'tests', label: 'Labs & Imaging', icon: FileText },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        h-full flex items-center gap-2 px-2 border-b-[3px] text-sm font-bold transition-all
                        ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
                    `}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center mt-20">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clipboard className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-lg font-bold text-slate-900">Session Started</p>
                            <p className="text-slate-400 text-sm">Start by introducing yourself to the patient.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[70%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-emerald-500 text-white rounded-tr-none' 
                                    : msg.role === 'system'
                                    ? 'bg-red-50 text-red-600 w-full text-center border-none'
                                    : 'bg-slate-50 text-slate-800 rounded-tl-none'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-50 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Controls */}
                <div className="p-6 bg-white border-t border-slate-50">
                    <div className="relative flex items-center gap-3">
                        <button 
                            onClick={toggleListening}
                            className={`p-4 rounded-full transition-all duration-300 ${
                                isListening 
                                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                                : 'bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                        >
                            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isListening ? "Listening..." : activeTab === 'history' ? "Ask the patient a question..." : "Describe physical exam action..."}
                                className="w-full bg-slate-50 border-none rounded-full pl-6 pr-14 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!inputText.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper for Vitals
const VitalDisplay: React.FC<{ label: string, value: string | number, unit: string, icon: any, color: string }> = ({ label, value, unit, icon: Icon, color }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-slate-50`}>
             <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">{label}</p>
            <p className="text-slate-900 font-mono leading-none font-bold text-lg">
                {value} <span className="text-xs text-slate-400 font-sans font-medium">{unit}</span>
            </p>
        </div>
    </div>
);

export default Session;