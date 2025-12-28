import React, { useState, useMemo } from 'react';
import { MOCK_CASES } from '../constants';
import GlassCard from '../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, Search, ArrowRight, Sparkles, Shuffle, 
  FileText, Upload, X, User, Activity, Brain, Stethoscope, 
  Settings2, UserCircle, HeartPulse, Globe, Frown
} from 'lucide-react';

type ToolModal = 'custom' | 'lecture' | null;

const CaseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ToolModal>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Filter Logic
  const filteredCases = useMemo(() => {
    return MOCK_CASES.filter((c) => {
      const query = searchQuery.toLowerCase();
      
      // Match Search Text (Title, Description, Tags, or Chief Complaint)
      const matchesSearch = 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.chiefComplaint.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query));

      // Match Specialty
      const matchesSpecialty = selectedSpecialty === 'All' || c.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  // Unique Specialties for Dropdown
  const specialties = ['All', ...Array.from(new Set(MOCK_CASES.map(c => c.specialty)))];

  // Mock handlers
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActiveModal(null);
      // In a real app, this would navigate to the new case
      navigate(`/session/${MOCK_CASES[0].id}`); 
    }, 2000);
  };

  return (
    <div className="space-y-10 relative">
      
      {/* --- Area 1, 2, 3: Generation Tools --- */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900">Create & Practice</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 2. Custom Case Generator */}
          <GlassCard 
            hoverEffect 
            onClick={() => setActiveModal('custom')}
            className="group relative overflow-hidden min-h-[160px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Settings2 className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Custom Case</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Design specific patient personas, symptoms, and vitals for targeted practice.
            </p>
            <div className="flex items-center text-sm font-bold text-emerald-600 gap-1 group-hover:gap-2 transition-all">
                Build Now <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          {/* 3. Random Case */}
          <GlassCard 
            hoverEffect 
            onClick={handleGenerate}
            className="group relative overflow-hidden min-h-[160px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Activity className="w-24 h-24 text-orange-500" />
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <Shuffle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Surprise Me</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Test your reflexes with a completely random scenario from our USMLE database.
            </p>
             <div className="flex items-center text-sm font-bold text-orange-600 gap-1 group-hover:gap-2 transition-all">
                Start Random <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

          {/* 4. Lecture Converter */}
          <GlassCard 
            hoverEffect 
            onClick={() => setActiveModal('lecture')}
            className="group relative overflow-hidden min-h-[160px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <FileText className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Lecture Converter</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Paste notes or upload slides to instantly generate simulation cases.
            </p>
             <div className="flex items-center text-sm font-bold text-blue-600 gap-1 group-hover:gap-2 transition-all">
                Convert Content <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>

        </div>
      </section>

      {/* --- Area 1: Case Library (Existing) --- */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-slate-400" />
                <h2 className="text-2xl font-bold text-slate-900">Case Library</h2>
                <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredCases.length}</span>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search cases, tags..." 
                        className="w-full h-12 bg-white rounded-full pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-soft transition-all"
                    />
                </div>
                
                <div className="relative">
                    <select 
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="h-12 pl-6 pr-10 appearance-none bg-white rounded-full text-slate-500 hover:text-emerald-600 hover:shadow-md transition-all shadow-soft text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                        {specialties.map(s => (
                            <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        {filteredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCases.map((c) => (
                <GlassCard key={c.id} noPadding hoverEffect onClick={() => navigate(`/session/${c.id}`)} className="flex flex-col h-full group overflow-hidden">
                    <div className="relative h-56 overflow-hidden">
                    <img src={c.patientAvatar} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-lg">
                        {c.specialty}
                    </div>
                    <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white mb-1 shadow-black/20 drop-shadow-md">{c.title}</h3>
                    </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                        c.difficulty === 'Novice' ? 'bg-emerald-500' : 
                        c.difficulty === 'Intermediate' ? 'bg-orange-400' : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{c.difficulty} Level</span>
                    </div>
                    
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{c.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                         {c.tags.slice(0, 2).map(tag => (
                             <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium">
                                 #{tag}
                             </span>
                         ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+24</div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    </div>
                </GlassCard>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border border-slate-100">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Frown className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No cases found</h3>
                <p className="text-slate-500 text-center max-w-md">
                    We couldn't find any cases matching "{searchQuery}" in {selectedSpecialty === 'All' ? 'any specialty' : selectedSpecialty}.
                </p>
                <button 
                    onClick={() => {setSearchQuery(''); setSelectedSpecialty('All');}}
                    className="mt-6 px-6 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </section>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <button 
                    onClick={() => setActiveModal(null)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Custom Builder Content */}
                {activeModal === 'custom' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Custom Case Builder</h2>
                                <p className="text-slate-500">Define patient demographics, vitals, and clinical scenario.</p>
                            </div>
                        </div>

                        {/* Section 1: Demographics */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <UserCircle className="w-4 h-4" /> Patient Demographics
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Age</label>
                                    <input type="number" placeholder="45" className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Gender</label>
                                    <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Non-binary</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Emotional State</label>
                                    <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                        <option>Cooperative</option>
                                        <option>Anxious</option>
                                        <option>Hostile</option>
                                        <option>Confused</option>
                                        <option>Stoic</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Clinical Context */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Clinical Context
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Specialty</label>
                                    <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                        <option>Internal Medicine</option>
                                        <option>Surgery</option>
                                        <option>Pediatrics</option>
                                        <option>Psychiatry</option>
                                        <option>Emergency Med</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                                    <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                        <option>Novice (Clear Presentation)</option>
                                        <option>Intermediate (Standard)</option>
                                        <option>Expert (Complex/Vague)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Clinical Focus</label>
                                    <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                        <option>Diagnostic Reasoning</option>
                                        <option>Management Plan</option>
                                        <option>Communication Skills</option>
                                        <option>History Taking</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Language</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select className="w-full h-12 rounded-xl border border-slate-200 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                            <option>English</option>
                                            <option>Spanish (Simulated)</option>
                                            <option>French (Simulated)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Section 3: Vitals & Scenario */}
                         <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <HeartPulse className="w-4 h-4" /> Vitals & Scenario
                            </h3>
                             <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Vitals Preset</label>
                                <select className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50">
                                    <option>Stable (Normal Range)</option>
                                    <option>Tachycardic / Hypertensive (Stress)</option>
                                    <option>Hypotensive / Shock</option>
                                    <option>Respiratory Distress</option>
                                    <option>Febrile / Septic</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Chief Complaint / Scenario Details</label>
                                <textarea 
                                    className="w-full h-24 rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 resize-none"
                                    placeholder="E.g. A 45-year-old male with sudden onset chest pain radiating to the left arm. History of smoking..."
                                ></textarea>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                           {isGenerating ? (
                               <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Generating Simulation...
                               </>
                           ) : (
                               <>
                                <Sparkles className="w-5 h-5" /> Generate Simulation
                               </>
                           )}
                        </button>
                    </div>
                )}

                {/* Lecture Converter Content */}
                {activeModal === 'lecture' && (
                    <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Lecture to Case</h2>
                                <p className="text-slate-500">Transform your study notes into interactive patients.</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Upload PDF or PPT</h3>
                            <p className="text-slate-500 text-sm mt-1">Drag and drop your lecture slides here</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500 font-medium">Or paste text</span>
                            </div>
                        </div>

                        <textarea 
                            className="w-full h-32 rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50 resize-none"
                            placeholder="Paste your lecture notes, summaries, or guidelines here..."
                        ></textarea>

                        <button 
                             onClick={handleGenerate}
                             className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                               <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Analyzing...
                               </>
                           ) : (
                               <>
                                <FileText className="w-5 h-5" /> Convert & Start
                               </>
                           )}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Loading Overlay (Global) */}
      {isGenerating && !activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-slate-900">Initializing Patient...</h3>
                <p className="text-slate-500">Configuring vitals and personality</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default CaseLibrary;