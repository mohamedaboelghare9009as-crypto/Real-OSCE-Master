import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import { ArrowUpRight, Clock, MoreHorizontal, Calendar, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CASES } from '../constants';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data for Charts
  const performanceData = [
    { name: 'Jan', score: 65, avg: 40 },
    { name: 'Feb', score: 59, avg: 45 },
    { name: 'Mar', score: 80, avg: 50 },
    { name: 'Apr', score: 81, avg: 60 },
    { name: 'May', score: 92, avg: 65 },
    { name: 'Jun', score: 85, avg: 60 },
    { name: 'Jul', score: 95, avg: 70 },
  ];

  const goalsData = [
    { name: 'Completed', value: 75 },
    { name: 'Remaining', value: 25 },
  ];
  const COLORS = ['#10B981', '#E2E8F0']; // Emerald, Slate-200

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your rotation progress</p>
        </div>
        <div className="flex gap-3">
            <button className="p-3 bg-white rounded-full hover:shadow-md transition-all text-slate-500">
                <Clock className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white rounded-full hover:shadow-md transition-all text-slate-500">
                <Calendar className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white rounded-full hover:shadow-md transition-all text-slate-500">
                <MoreHorizontal className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* --- LEFT COLUMN (Analytics) --- */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Main Performance Chart */}
            <GlassCard className="h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Performance Analytics</h3>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 cursor-pointer">Last Month ▼</div>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff'}}
                                itemStyle={{color: '#fff'}}
                            />
                            <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            <Area type="monotone" dataKey="avg" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Bottom Row: Goals & Active List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Goals Widget */}
                <GlassCard className="relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900">Weekly Goal</h3>
                        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-center h-[180px] relative">
                        {/* Donut Chart */}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={goalsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {goalsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-900">12</span>
                            <span className="text-xs text-slate-500 uppercase font-medium">Cases Done</span>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-slate-900 font-bold text-lg">15</span>
                            <span className="text-xs text-slate-500">Target</span>
                        </div>
                        <div className="flex flex-col text-right">
                             <span className="text-emerald-500 font-bold text-lg">80%</span>
                             <span className="text-xs text-slate-500">Completed</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Reminder/Action List */}
                <GlassCard>
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Reminders</h3>
                        <ArrowUpRight className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: 'Review Cardiology S1', time: 'Today', users: 3 },
                            { title: 'Upload H&P for Case 12', time: 'Tomorrow', users: 1 },
                            { title: 'Mock OSCE with Dr. Lee', time: 'Fri, 2pm', users: 2 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-emerald-50 transition-colors cursor-pointer">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">{item.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[...Array(item.users)].map((_, u) => (
                                        <div key={u} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

            </div>

             {/* Active Listings Table Style */}
             <GlassCard noPadding className="overflow-hidden">
                <div className="p-6 flex justify-between items-center pb-2">
                    <h3 className="text-lg font-bold text-slate-900">Recent Sessions</h3>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="bg-slate-50 rounded-full px-4 py-2 text-sm focus:outline-none w-32 md:w-48" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-2xl">Case Name</th>
                                <th className="px-6 py-4">Specialty</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-tr-2xl"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_CASES.map((c, i) => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={c.patientAvatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                            <span className="font-bold text-slate-900">{c.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{c.specialty}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">9{i}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `9${i}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${i===0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {i===0 ? 'Completed' : 'Reviewed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => navigate(`/session/${c.id}`)} className="text-slate-400 hover:text-emerald-500">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

        </div>

        {/* --- RIGHT COLUMN (Widgets) --- */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="flex flex-col justify-between h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                     </div>
                     <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Cases Passed
                     </span>
                     <div>
                        <span className="text-3xl font-bold text-slate-900 block">120</span>
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">
                            +12% <ArrowUpRight className="w-3 h-3 ml-1" />
                        </div>
                     </div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-between h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-slate-500" />
                     </div>
                     <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        Avg Time
                     </span>
                     <div>
                        <span className="text-3xl font-bold text-slate-900 block">14m</span>
                         <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">
                            -2m <ArrowUpRight className="w-3 h-3 ml-1" />
                        </div>
                     </div>
                </GlassCard>
            </div>

            {/* Featured Case (The Somerset style) */}
            <div className="bg-white rounded-[2rem] p-4 shadow-soft">
                <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4 group cursor-pointer" onClick={() => navigate(`/session/${MOCK_CASES[0].id}`)}>
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" alt="Hospital" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Recommended for you
                    </div>
                </div>
                <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{MOCK_CASES[0].title}</h3>
                            <p className="text-slate-500 text-sm">{MOCK_CASES[0].specialty}</p>
                        </div>
                        <button onClick={() => navigate(`/session/${MOCK_CASES[0].id}`)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl grid grid-cols-3 divide-x divide-slate-200">
                         <div className="text-center px-2">
                            <span className="block font-bold text-slate-900">High</span>
                            <span className="text-xs text-slate-500">Yield</span>
                         </div>
                         <div className="text-center px-2">
                            <span className="block font-bold text-slate-900">15m</span>
                            <span className="text-xs text-slate-500">Time</span>
                         </div>
                         <div className="text-center px-2">
                            <span className="block font-bold text-slate-900">Diff</span>
                            <span className="text-xs text-slate-500">Med</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments (Contact Cards Style) */}
            <GlassCard>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Top Mentors</h3>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"><ArrowRight className="w-4 h-4 rotate-180" /></button>
                         <button className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600"><ArrowRight className="w-4 h-4" /></button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {[
                        { name: 'Dr. Kristian Wu', role: 'Internal Med', status: 'Available', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kristian' },
                        { name: 'Dr. Sarah M.', role: 'Surgery', status: 'In Session', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                    ].map((mentor, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <img src={mentor.img} className="w-12 h-12 rounded-full bg-slate-100" alt="" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{mentor.name}</h4>
                                    <p className="text-xs text-slate-500">{mentor.role}</p>
                                </div>
                            </div>
                            <button className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                                <Phone className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    
                    <div className="pt-4 border-t border-slate-100">
                         <div className="p-4 bg-emerald-50 rounded-2xl">
                            <p className="text-xs font-bold text-slate-900 mb-1">Upcoming Session</p>
                            <p className="text-xs text-slate-500">Dr. Sarah M. • Today, 4:00 PM</p>
                            <button className="mt-3 w-full py-2 bg-white rounded-xl text-xs font-bold text-emerald-600 shadow-sm hover:shadow-md transition-all">
                                Join Meeting
                            </button>
                         </div>
                    </div>
                </div>
            </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;