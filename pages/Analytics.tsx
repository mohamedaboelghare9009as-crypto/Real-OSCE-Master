import React from 'react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { ArrowUpRight, Activity, Clock, Target, Brain, Stethoscope, HeartPulse, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const DATA_RADAR = [
  { subject: 'History Taking', A: 87, fullMark: 100 },
  { subject: 'Physical Exam', A: 94, fullMark: 100 },
  { subject: 'Communication', A: 92, fullMark: 100 },
  { subject: 'Clinical Reasoning', A: 88, fullMark: 100 },
  { subject: 'Diagnostic Workup', A: 91, fullMark: 100 },
  { subject: 'Management', A: 95, fullMark: 100 },
];

const DATA_LINE = [
  { day: 'Mon', score: 82 },
  { day: 'Tue', score: 85 },
  { day: 'Wed', score: 84 },
  { day: 'Thu', score: 89 },
  { day: 'Fri', score: 88 },
  { day: 'Sat', score: 92 },
  { day: 'Sun', score: 91 },
];

const DATA_SPECIALTY = [
  { name: 'Internal Med', score: 92 },
  { name: 'Surgery', score: 85 },
  { name: 'Pediatrics', score: 88 },
  { name: 'OB/GYN', score: 79 },
  { name: 'Psychiatry', score: 95 },
  { name: 'Emergency', score: 82 },
];

const DATA_TIME = [
  { name: 'History', value: 45, color: '#10B981' }, // Emerald 500
  { name: 'Physical', value: 25, color: '#3B82F6' }, // Blue 500
  { name: 'Reasoning', value: 20, color: '#F59E0B' }, // Amber 500
  { name: 'Mgmt', value: 10, color: '#6366F1' }, // Indigo 500
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Detailed Analytics</h1>
          <p className="text-slate-500">Comprehensive review of your clinical performance.</p>
        </div>
        <div className="hidden md:flex gap-3">
             <div className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 shadow-soft border border-slate-100">
                Last 30 Days
             </div>
        </div>
      </div>

      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Total Sessions', value: '42', unit: '', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Average Score', value: '89', unit: '%', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Diagnostic Acc.', value: '94', unit: '%', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Avg Time', value: '14', unit: 'min', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
            <GlassCard key={i} className="flex items-center gap-4" hoverEffect>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}<span className="text-sm font-medium text-slate-400 ml-1">{stat.unit}</span></p>
                </div>
            </GlassCard>
        ))}
      </div>

      {/* 2. Main Charts Row (Radar + Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart */}
        <GlassCard className="flex flex-col items-center min-h-[400px]">
            <div className="flex justify-between items-center w-full mb-2">
                <h3 className="text-xl font-bold text-slate-900">Competency Radar</h3>
                <button className="text-slate-400 hover:text-emerald-500"><ArrowUpRight className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={DATA_RADAR}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Sarah"
                            dataKey="A"
                            stroke="#10B981"
                            strokeWidth={3}
                            fill="#10B981"
                            fillOpacity={0.2}
                        />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 w-full justify-center">
                <div className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strongest: Management
                </div>
            </div>
        </GlassCard>

        {/* Progress Line Chart */}
        <GlassCard className="flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center w-full mb-6">
                <h3 className="text-xl font-bold text-slate-900">Score Trend</h3>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-slate-500 font-medium">Daily Avg</span>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DATA_LINE}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff', borderRadius: '12px', padding: '8px 12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                            cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10B981" 
                            strokeWidth={4}
                            dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 3, r: 6 }}
                            activeDot={{ r: 8, fill: '#10B981', stroke: '#fff', strokeWidth: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
      </div>

      {/* 3. Secondary Analytics Row (Specialty + Time) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Specialty Performance */}
          <GlassCard className="lg:col-span-2 flex flex-col min-h-[350px]">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Performance by Specialty</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA_SPECIALTY} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                        <Tooltip 
                            cursor={{fill: '#F8FAFC'}}
                            contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                             {DATA_SPECIALTY.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#10B981' : entry.score >= 80 ? '#3B82F6' : '#F59E0B'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Time Distribution */}
          <GlassCard className="flex flex-col min-h-[350px]">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Time Distribution</h3>
            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={DATA_TIME}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {DATA_TIME.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-slate-900">14m</span>
                    <span className="text-xs text-slate-500 font-medium">Avg Session</span>
                </div>
            </div>
          </GlassCard>
      </div>

      {/* 4. Recommendations */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI Insights & Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { title: 'Practice Respiratory', desc: 'Accuracy drops 15% in pulmonary cases compared to cardiac.', priority: 'High', color: 'red' },
                { title: 'Pacing Check', desc: 'You tend to interrupt the patient 20% more than the cohort average.', priority: 'Medium', color: 'orange' },
                { title: 'Antibiotics Review', desc: 'Sepsis management plans are correct but slightly delayed.', priority: 'Low', color: 'blue' }
            ].map((rec, i) => (
                <div key={i} className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                         <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                             rec.priority === 'High' ? 'bg-red-100 text-red-600' : 
                             rec.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                         }`}>
                             {rec.priority} Priority
                         </div>
                         <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1 text-lg">{rec.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{rec.desc}</p>
                </div>
            ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;