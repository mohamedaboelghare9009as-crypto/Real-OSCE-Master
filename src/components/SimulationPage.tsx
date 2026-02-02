
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MessageSquare,
  Activity,
  Search,
  Plus,
  CheckCircle2,
  X,
  Beaker,
  Stethoscope,
  ArrowRight,
  Mic,
  Heart,
  Wind,
  Droplets,
  Brain,
  Pill,
  Timer,
  AlertTriangle,
  ChevronLeft,
  Minimize2,
  Maximize2,
  FileText,
  Thermometer,
  Zap,
  LayoutDashboard,
  Check
} from 'lucide-react';

type Stage = 'history' | 'investigations' | 'management' | 'feedback';

interface Message {
  id: number;
  sender: 'doctor' | 'patient' | 'system';
  text: string;
  time: string;
}

interface Investigation {
  id: string;
  name: string;
  category: 'Lab' | 'Imaging' | 'Bedside';
  result: string;
  reference?: string;
  isAbnormal?: boolean;
  timeCost: number;
}

const PATIENT_DATA = {
  name: "James Anderson",
  dob: "14/05/1965",
  age: 58,
  sex: "Male",
  mrn: "MRN-998210",
  complaint: "Central Chest Pain",
  allergies: "Penicillin",
  vitals: {
    hr: { value: 110, unit: 'bpm', status: 'high' },
    bp: { value: "150/95", unit: 'mmHg', status: 'high' },
    rr: { value: 22, unit: '/min', status: 'high' },
    sat: { value: 96, unit: '%', status: 'normal' },
    temp: { value: 37.2, unit: '°C', status: 'normal' }
  },
  notes: "Patient appears anxious, diaphoretic, and is clutching his chest."
};

const AVAILABLE_TESTS: Investigation[] = [
  { id: 't1', name: 'ECG (12-Lead)', category: 'Bedside', result: 'Sinus Tachycardia. ST-segment elevation (2mm) in leads V1-V4.', isAbnormal: true, timeCost: 5 },
  { id: 't2', name: 'Troponin T (High Sens)', category: 'Lab', result: '450', reference: '<14 ng/L', isAbnormal: true, timeCost: 60 },
  { id: 't3', name: 'Chest X-Ray (Portable)', category: 'Imaging', result: 'Normal cardiac silhouette. No pulmonary edema.', isAbnormal: false, timeCost: 15 },
  { id: 't4', name: 'Full Blood Count', category: 'Lab', result: 'Hb 145 g/L, WCC 11.2, Plt 250.', reference: 'Normal Range', isAbnormal: false, timeCost: 30 },
  { id: 't5', name: 'D-Dimer', category: 'Lab', result: 'Negative (<250)', reference: '<500 ng/mL', isAbnormal: false, timeCost: 45 },
];

const SUGGESTED_QUESTIONS = [
  "Can you describe the pain?",
  "Does the pain radiate?",
  "Shortness of breath?",
  "Nausea or vomiting?",
  "History of heart disease?",
  "Any allergies?"
];

export const SimulationPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('history');
  const [timeLeft, setTimeLeft] = useState(600);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'system', text: "Session Started. 58yo Male with central chest pain.", time: '00:00' },
    { id: 2, sender: 'patient', text: "Doctor, it feels like an elephant is sitting on my chest.", time: '00:05' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderedInvestigations, setOrderedInvestigations] = useState<Investigation[]>([]);
  const [management, setManagement] = useState({ diagnosis: '', differentials: '', plan: '' });
  const [monitorCollapsed, setMonitorCollapsed] = useState(false);
  const [notes, setNotes] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === 'feedback') return;
    const timer = setInterval(() => setTimeLeft((prev) => prev <= 0 ? 0 : prev - 1), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = { id: Date.now(), sender: 'doctor', text, time: formatTime(600 - timeLeft) };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      let responseText = "I'm not sure how to answer that.";
      const lowerText = text.toLowerCase();
      if (lowerText.includes('radiate')) responseText = "Yes, it goes down my left arm.";
      else if (lowerText.includes('describe')) responseText = "It's a crushing heaviness. 9/10 pain.";
      else if (lowerText.includes('breath')) responseText = "I feel a bit winded, yes.";
      else if (lowerText.includes('nausea')) responseText = "I felt like throwing up earlier.";
      else if (lowerText.includes('history')) responseText = "I have high blood pressure.";
      else if (lowerText.includes('allerg')) responseText = "Just Penicillin, doc.";
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'patient', text: responseText, time: formatTime(600 - timeLeft) }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => { e.preventDefault(); sendMessage(inputText); };
  const handleOrderTest = (test: Investigation) => {
    if (!orderedInvestigations.find(t => t.id === test.id)) setOrderedInvestigations(prev => [...prev, test]);
    setSearchQuery('');
  };
  const getFilteredInvestigations = () => searchQuery ? AVAILABLE_TESTS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <div className="min-h-screen bg-osce-light-blue/50 flex flex-col overflow-hidden">
      <style>{`@keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      <header className="h-16 bg-white/80 backdrop-blur-md border-b px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/stations')} className="p-2 hover:bg-osce-light-blue/50 rounded-full text-osce-navy/60"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-sm font-bold text-osce-navy">Acute Chest Pain</h1>
            <div className="text-xs text-osce-navy/50 font-mono">{PATIENT_DATA.mrn}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stage !== 'feedback' && (
            <div className="hidden md:flex items-center bg-osce-light-blue/50 p-1 rounded-full">
              {['history', 'investigations', 'management'].map((s) => (
                <button key={s} onClick={() => setStage(s as Stage)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${stage === s ? 'bg-white shadow text-osce-navy' : 'text-osce-navy/50'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono font-bold text-sm ${timeLeft < 120 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-osce-light-blue'}`}>
            <Timer className="w-4 h-4" />{formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        <nav className="w-20 hidden lg:flex flex-col items-center py-8 gap-4 bg-white/50 border-r">
          {[{ id: 'history', icon: MessageSquare }, { id: 'investigations', icon: Beaker }, { id: 'management', icon: LayoutDashboard }].map((item) => (
            <button key={item.id} onClick={() => setStage(item.id as Stage)} className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stage === item.id ? 'bg-osce-navy text-white' : 'bg-white text-slate-300'}`}>
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <section className="flex-grow relative bg-osce-light-blue/30">
          {stage === 'history' && (
            <div className="h-full flex flex-col">
              <div className="flex-grow overflow-y-auto p-6 pb-40 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {msg.sender === 'system' ? (
                      <span className="text-xs text-osce-navy/50 bg-osce-light-blue/50 px-3 py-1 rounded-full">{msg.text}</span>
                    ) : (
                      <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === 'doctor' ? 'bg-osce-orange text-white rounded-tr-sm' : 'bg-white border rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-white border p-4 rounded-2xl rounded-tl-sm flex gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" /><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>}
                <div ref={chatEndRef} />
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-3xl p-3 shadow-xl border">
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => <button key={i} onClick={() => sendMessage(q)} className="whitespace-nowrap px-4 py-2 rounded-full bg-osce-light-blue/50 hover:bg-osce-orange hover:text-white text-osce-navy/70 text-xs font-semibold">{q}</button>)}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask a question..." className="flex-grow px-4 py-3 rounded-2xl bg-osce-light-blue/30 border focus:ring-2 focus:ring-osce-orange/20 outline-none" />
                  <button type="submit" disabled={!inputText.trim()} className="px-6 rounded-2xl bg-osce-orange text-white font-bold disabled:opacity-50"><ArrowRight className="w-5 h-5" /></button>
                </form>
              </div>
            </div>
          )}

          {stage === 'investigations' && (
            <div className="h-full p-6 flex flex-col">
              <div className="mb-6 relative max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-2xl shadow-lg border">
                  <Search className="ml-4 w-5 h-5 text-osce-navy/50" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search investigations..." className="w-full p-4 bg-transparent border-none focus:ring-0" />
                </div>
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border max-h-80 overflow-y-auto z-10">
                    {getFilteredInvestigations().length > 0 ? getFilteredInvestigations().map(test => (
                      <button key={test.id} onClick={() => handleOrderTest(test)} className="w-full text-left px-6 py-4 hover:bg-osce-light-blue/30 border-b last:border-0 flex justify-between items-center">
                        <div><div className="font-semibold">{test.name}</div><span className="text-xs text-osce-navy/50">{test.category} • {test.timeCost}m</span></div>
                        <Plus className="w-5 h-5 text-osce-navy/50" />
                      </button>
                    )) : <div className="p-6 text-center text-osce-navy/50">No results</div>}
                  </div>
                )}
              </div>
              <div className="flex-grow overflow-y-auto pb-20">
                {orderedInvestigations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[50%] text-slate-300"><Beaker className="w-16 h-16 mb-4" /><p>No investigations ordered yet</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orderedInvestigations.map((inv) => (
                      <div key={inv.id} className="bg-white rounded-2xl shadow border overflow-hidden">
                        <div className={`h-1.5 ${inv.isAbnormal ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-bold">{inv.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${inv.isAbnormal ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{inv.isAbnormal ? 'Abnormal' : 'Normal'}</span>
                          </div>
                          <div className="bg-osce-light-blue/30 p-3 rounded-xl text-sm">{inv.result}</div>
                          {inv.reference && <div className="mt-2 text-xs text-osce-navy/50">Ref: {inv.reference}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {orderedInvestigations.length > 0 && <div className="absolute bottom-8 right-8"><button onClick={() => setStage('management')} className="px-8 py-4 bg-osce-navy text-white rounded-full font-bold shadow-xl hover:scale-105 transition-all">Proceed to Plan <ArrowRight className="inline w-5 h-5 ml-2" /></button></div>}
            </div>
          )}

          {stage === 'management' && (
            <div className="h-full p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6 pb-20">
                <h2 className="text-2xl font-bold text-osce-navy">Clinical Management</h2>
                <div className="bg-white rounded-2xl p-6 border"><label className="text-sm font-semibold text-osce-navy/70 block mb-2">Primary Diagnosis</label><input type="text" placeholder="e.g. Acute Anterior STEMI" value={management.diagnosis} onChange={e => setManagement({ ...management, diagnosis: e.target.value })} className="w-full p-4 bg-osce-light-blue/30 border rounded-xl" /></div>
                <div className="bg-white rounded-2xl p-6 border"><label className="text-sm font-semibold text-osce-navy/70 block mb-2">Differentials</label><input type="text" placeholder="e.g. Aortic Dissection, PE" value={management.differentials} onChange={e => setManagement({ ...management, differentials: e.target.value })} className="w-full p-4 bg-osce-light-blue/30 border rounded-xl" /></div>
                <div className="bg-white rounded-2xl p-6 border"><label className="text-sm font-semibold text-osce-navy/70 block mb-2">Management Plan</label><textarea placeholder="1. Aspirin 300mg..." value={management.plan} onChange={e => setManagement({ ...management, plan: e.target.value })} className="w-full p-4 bg-osce-light-blue/30 border rounded-xl min-h-[150px] resize-none" /></div>
                <div className="flex justify-end"><button onClick={() => setStage('feedback')} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"><CheckCircle2 className="inline w-5 h-5 mr-2" />Submit Case</button></div>
              </div>
            </div>
          )}

          {stage === 'feedback' && (
            <div className="h-full p-10 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-osce-navy rounded-3xl p-10 text-white">
                  <div className="flex items-center justify-between">
                    <div><span className="text-emerald-400 text-sm font-bold uppercase">Excellent Work</span><h1 className="text-4xl font-bold mt-2">Score: 88%</h1></div>
                    <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex items-center justify-center"><span className="text-4xl font-black">88%</span></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border"><h3 className="font-bold text-emerald-700 mb-4">Strengths</h3><ul className="space-y-2 text-sm">{["Identified cardiac pain", "Ordered ECG immediately", "Good use of Troponin"].map((s, i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{s}</li>)}</ul></div>
                  <div className="bg-white p-6 rounded-2xl border"><h3 className="font-bold text-amber-600 mb-4">Improvements</h3><ul className="space-y-2 text-sm">{["Check contraindications", "O2 only if SpO2<94%", "Consider PE differential"].map((s, i) => <li key={i} className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />{s}</li>)}</ul></div>
                </div>
                <div className="flex justify-center gap-4"><button onClick={() => navigate('/stations')} className="px-8 py-3 bg-white border-2 rounded-xl font-bold">Back to Hub</button><button onClick={() => window.location.reload()} className="px-8 py-3 bg-osce-orange text-white rounded-xl font-bold">Retry</button></div>
              </div>
            </div>
          )}
        </section>

        {stage !== 'feedback' && (
          <aside className={`fixed xl:relative right-0 inset-y-0 w-72 bg-black text-white flex flex-col z-40 transition-transform ${monitorCollapsed ? 'translate-x-full xl:translate-x-0' : ''}`}>
            <div className="p-3 bg-black/80 border-b border-gray-800 flex justify-between items-center"><span className="text-xs text-emerald-500 font-mono">LIVE MONITOR</span><button onClick={() => setMonitorCollapsed(true)} className="xl:hidden text-gray-500"><Minimize2 className="w-4 h-4" /></button></div>
            <div className="h-32 bg-black border-b border-gray-800 relative overflow-hidden"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} /></div>
            <div className="flex-grow p-2 space-y-2 overflow-y-auto">
              <div className="p-3 bg-gray-900 rounded"><span className="text-emerald-600 text-[10px] uppercase">HR</span><div className="text-4xl font-mono text-emerald-500">{PATIENT_DATA.vitals.hr.value} <span className="text-sm text-emerald-700">bpm</span></div></div>
              <div className="p-3 bg-gray-900 rounded"><span className="text-blue-600 text-[10px] uppercase">BP</span><div className="text-3xl font-mono text-blue-500">{PATIENT_DATA.vitals.bp.value}</div></div>
              <div className="p-3 bg-gray-900 rounded"><span className="text-yellow-600 text-[10px] uppercase">SpO2</span><div className="text-4xl font-mono text-yellow-500">{PATIENT_DATA.vitals.sat.value}%</div></div>
              <div className="p-3 bg-gray-900 rounded"><span className="text-osce-navy/60 text-[10px] uppercase">RR</span><div className="text-3xl font-mono text-osce-navy/50">{PATIENT_DATA.vitals.rr.value}</div></div>
            </div>
            <div className="p-3 bg-black/80 border-t border-gray-800"><div className="text-sm font-bold">{PATIENT_DATA.name}</div><div className="text-xs text-osce-navy/60">{PATIENT_DATA.sex} • {PATIENT_DATA.age}Y</div></div>
          </aside>
        )}
      </main>
    </div>
  );
};
