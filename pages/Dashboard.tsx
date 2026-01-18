import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import { ArrowUpRight, Clock, MoreHorizontal, Calendar, CheckCircle2, ArrowRight, Plus, Trash2, Check, X, Edit2, ExternalLink, History, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { sessionService } from '../services/sessionService';
import { caseService } from '../services/caseService';
import { Case } from '../types';
import { useDashboardStore } from '../stores/useDashboardStore';

import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [analytics, setAnalytics] = React.useState<any>({ totalSessions: 0, avgScore: 0, sessions: [] });
    const [featuredCase, setFeaturedCase] = React.useState<Case | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [newReminderTitle, setNewReminderTitle] = React.useState('');
    const [showAddReminder, setShowAddReminder] = React.useState(false);
    const [editingGoal, setEditingGoal] = React.useState(false);
    const [goalInput, setGoalInput] = React.useState('');
    const [showHistory, setShowHistory] = React.useState(false);
    const [showCalendar, setShowCalendar] = React.useState(false);

    // Dashboard store for goals and reminders
    const { weeklyGoal, setWeeklyGoal, reminders, addReminder, toggleReminder, deleteReminder } = useDashboardStore();

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.history-dropdown') && !target.closest('.history-btn')) {
                setShowHistory(false);
            }
            if (!target.closest('.calendar-dropdown') && !target.closest('.calendar-btn')) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const data = await sessionService.getUserAnalytics();
                setAnalytics(data);

                // Load a featured case
                const cases = await caseService.getAllCases();
                if (cases.length > 0) setFeaturedCase(cases[0]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    // Filter sessions based on search query
    const filteredSessions = analytics.sessions.filter((s: any) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mock Data for Charts (Keep graph visuals for now but use real summary stats)
    /*
    const performanceData = [
        { name: 'Jan', score: 65, avg: 40 },
        { name: 'Feb', score: 59, avg: 45 },
        { name: 'Mar', score: 80, avg: 50 },
        { name: 'Apr', score: 81, avg: 60 },
        { name: 'May', score: 92, avg: 65 },
        { name: 'Jun', score: 85, avg: 60 },
        { name: 'Jul', score: 95, avg: 70 },
    ];
    */

    // Dynamic goals data based on store
    const completedPercentage = weeklyGoal.target > 0 ? Math.round((weeklyGoal.completed / weeklyGoal.target) * 100) : 0;
    const goalsData = [
        { name: 'Completed', value: completedPercentage },
        { name: 'Remaining', value: 100 - completedPercentage },
    ];
    const COLORS = ['#10B981', '#E2E8F0']; // Emerald, Slate-200

    const handleAddReminder = () => {
        if (newReminderTitle.trim()) {
            addReminder(newReminderTitle.trim(), 'Today');
            setNewReminderTitle('');
            setShowAddReminder(false);
        }
    };

    const handleSaveGoal = () => {
        const newTarget = parseInt(goalInput, 10);
        if (!isNaN(newTarget) && newTarget > 0) {
            setWeeklyGoal({ target: newTarget });
        }
        setEditingGoal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Hello, {user?.fullName || 'Doctor'} 👋
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500">
                            {user?.plan ? <span className="text-emerald-600 font-bold uppercase text-xs border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded mr-2">{user.plan} Plan</span> : ''}
                            Overview of your rotation progress
                        </p>
                        <button
                            onClick={() => navigate('/session/test-session-case')}
                            className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-600 transition-all flex items-center gap-1"
                        >
                            <Stethoscope className="w-3 h-3" /> Start Test Session
                        </button>
                    </div>
                </div>
                <div className="flex gap-3">
                    {/* History Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="history-btn p-3 bg-white rounded-full hover:shadow-md transition-all text-slate-500 hover:text-emerald-600"
                        >
                            <Clock className="w-5 h-5" />
                        </button>

                        {showHistory && (
                            <div className="history-dropdown absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <History className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-bold text-slate-900">Recent Sessions</h4>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {analytics.sessions.length > 0 ? (
                                        analytics.sessions.slice(0, 5).map((session: any) => (
                                            <div
                                                key={session.id}
                                                onClick={() => { navigate(`/session/${session.caseId}`); setShowHistory(false); }}
                                                className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-sm">{session.title}</p>
                                                        <p className="text-xs text-slate-500">{session.specialty}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${session.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {session.score}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-slate-400 text-sm">
                                            No recent sessions yet
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => { navigate('/analytics'); setShowHistory(false); }}
                                        className="w-full text-center text-sm text-emerald-600 font-medium hover:text-emerald-700"
                                    >
                                        View All Analytics →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Calendar Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="calendar-btn p-3 bg-white rounded-full hover:shadow-md transition-all text-slate-500 hover:text-emerald-600"
                        >
                            <Calendar className="w-5 h-5" />
                        </button>

                        {showCalendar && (
                            <div className="calendar-dropdown absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-bold text-slate-900">Calendar</h4>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-slate-500 mb-4">View and manage your study schedule</p>
                                    <a
                                        href="https://calendar.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Google Calendar
                                    </a>
                                </div>
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <div className="text-xs text-slate-400 text-center">
                                        Schedule study sessions and reminders
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


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
                                <AreaChart data={analytics.performanceData || []}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
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
                                <button onClick={() => { setEditingGoal(true); setGoalInput(weeklyGoal.target.toString()); }} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <Edit2 className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            {editingGoal && (
                                <div className="mb-4 p-3 bg-white border border-gray-100 rounded-xl">
                                    <label className="text-xs text-slate-500 mb-1 block">Set weekly target</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={goalInput}
                                            onChange={(e) => setGoalInput(e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="e.g. 10"
                                            min="1"
                                        />
                                        <button onClick={handleSaveGoal} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingGoal(false)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

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
                                    <span className="text-3xl font-bold text-slate-900">{weeklyGoal.completed}</span>
                                    <span className="text-xs text-slate-500 uppercase font-medium">Cases Done</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-900 font-bold text-lg">{weeklyGoal.target}</span>
                                    <span className="text-xs text-slate-500">Target</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-emerald-500 font-bold text-lg">{completedPercentage}%</span>
                                    <span className="text-xs text-slate-500">Completed</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Reminder/Action List */}
                        <GlassCard>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Reminders</h3>
                                <button
                                    onClick={() => setShowAddReminder(!showAddReminder)}
                                    className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {showAddReminder && (
                                <div className="mb-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={newReminderTitle}
                                        onChange={(e) => setNewReminderTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddReminder()}
                                        placeholder="Add a reminder..."
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleAddReminder}
                                        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {reminders.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">No reminders yet. Add one above!</p>
                                ) : (
                                    reminders.map((reminder) => (
                                        <div
                                            key={reminder.id}
                                            className={`flex items-center justify-between p-3 rounded-2xl group transition-colors cursor-pointer ${reminder.completed
                                                ? 'bg-emerald-50'
                                                : 'bg-white border border-gray-100 hover:bg-emerald-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1" onClick={() => toggleReminder(reminder.id)}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${reminder.completed
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-slate-300 group-hover:border-emerald-500'
                                                    }`}>
                                                    {reminder.completed && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium transition-all ${reminder.completed
                                                        ? 'text-slate-400 line-through'
                                                        : 'text-slate-900 group-hover:text-emerald-700'
                                                        }`}>
                                                        {reminder.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{reminder.time}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteReminder(reminder.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GlassCard>

                    </div>

                    {/* Active Listings Table Style */}
                    <GlassCard noPadding className="overflow-hidden">
                        <div className="p-6 flex justify-between items-center pb-2">
                            <h3 className="text-lg font-bold text-slate-900">Recent Sessions</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search sessions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white border border-gray-200 text-slate-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-32 md:w-48 transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-emerald-50/20 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-2xl">Case Name</th>
                                        <th className="px-6 py-4">Specialty</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 rounded-tr-2xl"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSessions.length > 0 ? filteredSessions.map((c: any, i: number) => (
                                        <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={c.patientAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                                    <span className="font-bold text-slate-900">{c.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{c.specialty}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{c.score}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${c.score >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${c.score}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {c.status === 'completed' ? 'Completed' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => navigate(`/session/${c.caseId}`)} className="text-slate-400 hover:text-emerald-500">
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-slate-400 italic">No recent sessions found. Start a case!</td>
                                        </tr>
                                    )}
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
                                <span className="text-3xl font-bold text-slate-900 block">{analytics.passedSessions}</span>
                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">
                                    of {analytics.totalSessions} Total
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
                                <span className="text-3xl font-bold text-slate-900 block">{analytics.avgDuration || 0}m</span>
                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">
                                    -2m <ArrowUpRight className="w-3 h-3 ml-1" />
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Featured Case (The Somerset style) */}
                    {/* Featured Case (The Somerset style) */}
                    {featuredCase ? (
                        <div className="bg-white rounded-[2rem] p-4 shadow-soft">
                            <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4 group cursor-pointer" onClick={() => navigate(`/session/${featuredCase.id}`)}>
                                <img src={featuredCase.patientAvatar || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"} alt="Hospital" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Recommended for you
                                </div>
                            </div>
                            <div className="px-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{featuredCase.title}</h3>
                                        <p className="text-slate-500 text-sm">{featuredCase.specialty}</p>
                                    </div>
                                    <button onClick={() => navigate(`/session/${featuredCase.id}`)} className="w-10 h-10 rounded-full bg-emerald-50/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Stats Bar */}
                                <div className="mt-6 p-4 bg-emerald-50/10 border border-emerald-100/50 rounded-2xl grid grid-cols-3 divide-x divide-emerald-100/50">
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
                    ) : (
                        <div className="bg-white rounded-[2rem] p-8 shadow-soft flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    )}



                </div>
            </div>
        </div>
    );
};

export default Dashboard;