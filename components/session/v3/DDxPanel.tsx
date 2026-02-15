import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Search,
  Filter,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Lightbulb,
  TrendingUp,
  MoreHorizontal,
  Sparkles,
  Keyboard
} from 'lucide-react';
import DiagnosisCard, { DDxItem, DiagnosisStatus, Evidence } from './DiagnosisCard';
import ConfidenceMeter from './ConfidenceMeter';

// Color palette constants
const COLORS = {
  primary: '#0474b8',      // Nightingale Blue
  supported: '#28a745',    // Green
  uncertain: '#ffc107',    // Amber
  contradicted: '#dc3545', // Red
  working: '#0474b8'       // Same as primary
};

type FilterType = 'all' | 'supported' | 'active' | 'working';

interface KeyboardShortcut {
  key: string;
  description: string;
}

const SHORTCUTS: KeyboardShortcut[] = [
  { key: 'Ctrl/Cmd + D', description: 'Focus diagnosis input' },
  { key: 'Ctrl/Cmd + F', description: 'Focus search' },
  { key: 'Escape', description: 'Clear search/filter' },
  { key: 'Ctrl/Cmd + 1-4', description: 'Quick filter (All/Supported/Active/Working)' },
];

// Helper to generate mock evidence for demonstration
const generateMockEvidence = (diagnosis: string): Evidence[] => {
  const evidencePool = [
    { text: 'Fever present', type: 'supporting' as const },
    { text: 'Normal WBC', type: 'contradicting' as const },
    { text: 'Chest pain', type: 'supporting' as const },
    { text: 'Normal ECG', type: 'contradicting' as const },
    { text: 'History of smoking', type: 'neutral' as const },
    { text: 'Elevated troponin', type: 'supporting' as const },
  ];
  
  const count = Math.floor(Math.random() * 3) + 1;
  return evidencePool
    .slice(0, count)
    .map((e, i) => ({ ...e, id: `${Date.now()}-${i}`, source: 'Clinical findings' }));
};

const DDxPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [diagnoses, setDiagnoses] = useState<DDxItem[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus input: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Focus search: Ctrl/Cmd + F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Clear search/filter: Escape
      if (e.key === 'Escape') {
        setSearchQuery('');
        setFilter('all');
      }
      
      // Quick filters: Ctrl/Cmd + 1-4
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const filters: FilterType[] = ['all', 'supported', 'active', 'working'];
        const index = parseInt(e.key) - 1;
        if (filters[index]) {
          setFilter(filters[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = diagnoses.length;
    const supported = diagnoses.filter(d => d.status === 'supported').length;
    const contradicted = diagnoses.filter(d => d.status === 'contradicted').length;
    const working = diagnoses.filter(d => d.status === 'working').length;
    const uncertain = diagnoses.filter(d => d.status === 'uncertain').length;
    const avgConfidence = total > 0 
      ? Math.round(diagnoses.reduce((acc, d) => acc + d.confidence, 0) / total)
      : 0;
    
    return { total, supported, contradicted, working, uncertain, avgConfidence };
  }, [diagnoses]);

  // Filtered diagnoses
  const filteredDiagnoses = useMemo(() => {
    let result = diagnoses;
    
    // Apply status filter
    switch (filter) {
      case 'supported':
        result = result.filter(d => d.status === 'supported');
        break;
      case 'active':
        result = result.filter(d => d.status !== 'contradicted');
        break;
      case 'working':
        result = result.filter(d => d.status === 'working');
        break;
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.diagnosis.toLowerCase().includes(query) ||
        d.evidence.some(e => e.text.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [diagnoses, filter, searchQuery]);

  // Actions
  const addDiagnosis = useCallback(() => {
    if (!input.trim()) return;
    
    const newDx: DDxItem = {
      id: `ddx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      diagnosis: input.trim(),
      status: 'uncertain',
      confidence: 50,
      evidence: generateMockEvidence(input.trim()),
      timestamp: Date.now()
    };
    
    setDiagnoses(prev => [...prev, newDx]);
    setInput('');
  }, [input]);

  const removeDiagnosis = useCallback((id: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateStatus = useCallback((id: string, status: DiagnosisStatus) => {
    setDiagnoses(prev => prev.map(d => {
      if (d.id === id) {
        // Adjust confidence based on status
        let newConfidence = d.confidence;
        switch (status) {
          case 'supported':
            newConfidence = Math.max(d.confidence, 75);
            break;
          case 'contradicted':
            newConfidence = Math.min(d.confidence, 25);
            break;
          case 'working':
            newConfidence = Math.max(d.confidence, 60);
            break;
          case 'uncertain':
            newConfidence = 50;
            break;
        }
        return { ...d, status, confidence: newConfidence };
      }
      return d;
    }));
  }, []);

  const updateConfidence = useCallback((id: string, confidence: number) => {
    setDiagnoses(prev => prev.map(d => 
      d.id === id ? { ...d, confidence } : d
    ));
  }, []);

  const handleReorder = useCallback((newOrder: DDxItem[]) => {
    setDiagnoses(newOrder);
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all diagnoses?')) {
      setDiagnoses([]);
    }
  }, []);

  // Suggestions based on common patterns
  const suggestions = useMemo(() => [
    'Acute Coronary Syndrome',
    'Pulmonary Embolism',
    'Pneumonia',
    'Heart Failure',
    'COPD Exacerbation',
    'Acute Kidney Injury',
    'Sepsis',
    'Stroke',
  ].filter(s => !diagnoses.some(d => d.diagnosis.toLowerCase() === s.toLowerCase())), [diagnoses]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    const newDx: DDxItem = {
      id: `ddx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      diagnosis: suggestion,
      status: 'uncertain',
      confidence: 50,
      evidence: generateMockEvidence(suggestion),
      timestamp: Date.now()
    };
    setDiagnoses(prev => [...prev, newDx]);
  }, []);

  return (
    <div 
      className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg"
      role="region"
      aria-label="Differential Diagnosis Panel"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0474b8] to-[#058ad9] text-white hover:opacity-95 transition-opacity"
        aria-expanded={isOpen}
        aria-controls="ddx-content"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              Differential Diagnosis
              {stats.total > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.total}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-white/80 mt-0.5">
              Track and prioritize your diagnostic hypotheses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShortcuts(!showShortcuts);
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <Keyboard size={16} />
          </button>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-slate-200 overflow-hidden"
          >
            <div className="p-3 grid grid-cols-2 gap-2 text-xs">
              {SHORTCUTS.map((shortcut, i) => (
                <div key={i} className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-sm">
                    {shortcut.key}
                  </kbd>
                  <span className="text-slate-600">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ddx-content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Stats Overview */}
              {stats.total > 0 && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-700">{stats.total}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{stats.supported}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0474b8]">{stats.working}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Working</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-700">{stats.avgConfidence}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Avg Conf</div>
                  </div>
                </div>
              )}

              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search diagnoses..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0474b8] focus:ring-2 focus:ring-[#0474b8]/20 transition-all"
                    aria-label="Search diagnoses"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded"
                    >
                      <X size={12} className="text-slate-400" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                    aria-label="Filter diagnoses"
                  >
                    <Filter size={14} />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    {(['all', 'supported', 'active', 'working'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                          filter === f ? 'bg-[#0474b8]/10 text-[#0474b8] font-medium' : 'text-slate-600'
                        }`}
                      >
                        {f === 'all' && 'Show All'}
                        {f === 'supported' && 'Supported Only'}
                        {f === 'active' && 'Active Only'}
                        {f === 'working' && 'Working Diagnoses'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(['all', 'supported', 'active', 'working'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${filter === f
                        ? 'bg-[#0474b8] text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }
                    `}
                    aria-pressed={filter === f}
                  >
                    {f === 'all' && `All (${stats.total})`}
                    {f === 'supported' && `Supported (${stats.supported})`}
                    {f === 'active' && `Active (${stats.total - stats.contradicted})`}
                    {f === 'working' && `Working (${stats.working})`}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    placeholder="Add diagnosis hypothesis..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0474b8] focus:ring-4 focus:ring-[#0474b8]/10 transition-all"
                    aria-label="Add new diagnosis"
                  />
                  
                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {isInputFocused && input.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20"
                      >
                        <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Suggestions
                        </div>
                        {suggestions
                          .filter(s => s.toLowerCase().includes(input.toLowerCase()))
                          .slice(0, 4)
                          .map((suggestion, i) => (
                            <button
                              key={suggestion}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <Sparkles size={12} className="text-[#0474b8]" />
                              {suggestion}
                            </button>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={addDiagnosis}
                  disabled={!input.trim()}
                  className="px-4 py-3 bg-[#0474b8] hover:bg-[#0369a9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  aria-label="Add diagnosis"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>

              {/* Diagnoses List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredDiagnoses.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      {searchQuery || filter !== 'all' ? (
                        <>
                          <Search size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">No diagnoses match your filters</p>
                          <button
                            onClick={() => { setSearchQuery(''); setFilter('all'); }}
                            className="mt-2 text-xs text-[#0474b8] hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          <Lightbulb size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">No diagnoses tracked yet</p>
                          <p className="text-xs text-slate-400 mt-1">Start by adding your first hypothesis</p>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={filteredDiagnoses}
                      onReorder={handleReorder}
                      className="space-y-2"
                    >
                      {filteredDiagnoses.map((item, index) => (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          dragListener={false}
                        >
                          {({ dragControls }) => (
                            <DiagnosisCard
                              item={item}
                              index={index}
                              onStatusChange={updateStatus}
                              onRemove={removeDiagnosis}
                              dragHandleProps={{ onPointerDown: (e: any) => dragControls.start(e) }}
                            />
                          )}
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              {stats.total > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {stats.supported > 0 
                        ? `${stats.supported} supported diagnosis${stats.supported !== 1 ? 'es' : ''}`
                        : 'Prioritize your hypotheses by dragging'
                      }
                    </span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DDxPanel;
