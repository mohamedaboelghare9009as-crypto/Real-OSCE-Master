import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2, Library, Sparkles, FileUp, ArrowRight, Search,
  Clock, ChevronRight, PlayCircle, MoreVertical, CheckCircle2,
  Heart, Brain, Wind, Activity, Baby, Flame, Trophy, Star, Filter,
  Thermometer
} from 'lucide-react';

interface Station {
  id: number;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard';
  duration: number;
  status?: 'completed' | 'in_progress' | 'new';
  score?: number;
}

const categories = ['All', 'Cardiology', 'Respiratory', 'Neurology', 'Gastroenterology', 'Pediatrics', 'Emergency'];

const stations: Station[] = [
  { id: 1, title: 'Acute Chest Pain', category: 'Cardiology', difficulty: 'Intermediate', duration: 10, status: 'completed', score: 85 },
  { id: 2, title: 'Chronic Cough', category: 'Respiratory', difficulty: 'Easy', duration: 8, status: 'completed', score: 78 },
  { id: 3, title: 'Sudden Onset Headache', category: 'Neurology', difficulty: 'Hard', duration: 10, status: 'in_progress' },
  { id: 4, title: 'Abdominal Pain in Child', category: 'Pediatrics', difficulty: 'Intermediate', duration: 12, status: 'new' },
  { id: 5, title: 'Upper GI Bleed', category: 'Gastroenterology', difficulty: 'Hard', duration: 10, status: 'new' },
  { id: 6, title: 'Febrile Convulsion', category: 'Pediatrics', difficulty: 'Intermediate', duration: 8, status: 'new' },
  { id: 7, title: 'Palpitations', category: 'Cardiology', difficulty: 'Easy', duration: 8, status: 'new' },
];

const dailyChallenge: Station = { id: 99, title: 'Status Epilepticus', category: 'Emergency', difficulty: 'Hard', duration: 12, status: 'new' };

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Cardiology': return <Heart className="w-5 h-5 text-red-500" />;
    case 'Neurology': return <Brain className="w-5 h-5 text-violet-500" />;
    case 'Respiratory': return <Wind className="w-5 h-5 text-blue-500" />;
    case 'Gastroenterology': return <Flame className="w-5 h-5 text-orange-500" />;
    case 'Pediatrics': return <Baby className="w-5 h-5 text-pink-500" />;
    case 'Emergency': return <Activity className="w-5 h-5 text-red-600" />;
    default: return <Thermometer className="w-5 h-5 text-primary" />;
  }
};

const getDifficultyColor = (diff: string) => {
  switch (diff) {
    case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'Intermediate': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const StationsSection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter(s =>
    (selectedCategory === 'All' || s.category === selectedCategory) &&
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 py-8 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Station Library</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Access over 500+ OSCE scenarios. Filter by specialty or try the daily challenge.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by diagnosis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-card/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button className="p-3 bg-card border border-border rounded-xl hover:bg-muted"><Filter className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Daily Challenge - Premium Warm Design */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-10 shadow-2xl group cursor-pointer transition-all hover:shadow-orange-500/30">
        {/* Dynamic Background - Warm Sunset Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-osce-navy via-slate-800 to-slate-900 transition-all duration-500" />

        {/* Accent Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-osce-orange/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-rose-500/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-osce-orange/20 backdrop-blur-md border border-osce-orange/40 text-osce-orange text-xs font-bold uppercase tracking-wider shadow-lg shadow-osce-orange/10">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Daily Challenge
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                +50 XP Bonus
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 backdrop-blur-md border border-rose-400/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                {dailyChallenge.difficulty}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-3 drop-shadow-lg">
                {dailyChallenge.title}
              </h2>
              <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-xl">
                Master this high-yield emergency scenario. Focus on rapid assessment and stabilization protocols.
              </p>
            </div>

            {/* Meta Chips */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-slate-400 font-medium text-sm">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Activity className="w-4 h-4 text-osce-orange" />
                </div>
                {dailyChallenge.category}
              </div>
              <div className="w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-2.5 text-slate-400 font-medium text-sm">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Clock className="w-4 h-4 text-osce-orange" />
                </div>
                {dailyChallenge.duration} minutes
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/simulation')}
            className="group/btn relative overflow-hidden px-12 py-6 bg-gradient-to-r from-osce-orange to-amber-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-osce-orange/30 hover:shadow-2xl hover:shadow-osce-orange/40 hover:-translate-y-1 hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Challenge
              <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover/btn:translate-x-2" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-osce-orange opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Custom Case', icon: Settings2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { title: 'Surprise Me', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'AI Generator', icon: FileUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Group Study', icon: Library, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((mode, idx) => (
          <button key={idx} onClick={() => mode.title === 'Surprise Me' && navigate('/simulation')} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group text-left">
            <div className={`p-3 rounded-xl ${mode.bg} ${mode.color}`}><mode.icon className="w-6 h-6" /></div>
            <div><h3 className="font-semibold text-foreground group-hover:text-primary">{mode.title}</h3><span className="text-xs text-muted-foreground">Configure</span></div>
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}>{cat}</button>
        ))}
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.map((station) => (
          <div key={station.id} onClick={() => navigate('/simulation')} className="group relative flex flex-col p-6 rounded-[1.5rem] bg-card border border-border/60 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted/50 border border-border">{getCategoryIcon(station.category)}</div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(station.difficulty)}`}>{station.difficulty}</span>
              </div>
              {station.score && <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><Trophy className="w-3.5 h-3.5" /> {station.score}%</div>}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{station.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">Simulate a realistic encounter focusing on history taking and differential diagnosis.</p>
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm text-muted-foreground"><Clock className="w-4 h-4" /> {station.duration}m {station.status === 'completed' && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Done</span>}</div>
              <button className="p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all"><ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
