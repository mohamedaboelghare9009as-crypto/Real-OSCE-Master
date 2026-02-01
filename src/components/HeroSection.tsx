
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, Plus, Volume2 } from 'lucide-react';
import { useToast } from './Toast';
import { sessionService } from '../../services/sessionService';
import { useAuth } from '../contexts/AuthContext';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

const ProgressRing = ({ percentage, size = 180, strokeWidth = 16 }: ProgressRingProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center hover:scale-105 transition-transform duration-500" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full drop-shadow-2xl">
                {/* Background circle */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.3}
                />
                {/* Progress circle */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Average Score</span>
                <span className="text-6xl font-black text-foreground tracking-tighter">{percentage}%</span>
            </div>
        </div>
    );
};

export const HeroSection = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgScore, setAvgScore] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await sessionService.getUserSessions();
                setSessions(data);

                // Calculate real average
                const totalScore = data.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
                const avg = data.length > 0 ? Math.round(totalScore / data.length) : 0;
                setAvgScore(avg);
            } catch (error) {
                console.error('Failed to load sessions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const date = new Date();
    const hour = date.getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    const handleNewSession = () => {
        addToast('success', 'Starting Session', 'Initializing new simulation environment...');
        navigate('/simulation');
    };

    const handleSessionClick = (session: any) => {
        if (session.status === 'abandoned') {
            addToast('info', 'Resuming Session', `Continuing ${session.title}...`);
            navigate(`/session/${session.caseId}`);
        } else {
            addToast('info', 'Loading Report', `Opening performance analysis for ${session.title}`);
            navigate('/reports');
        }
    };

    return (
        <div className="px-6 py-6 space-y-8">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">{greeting}, {user?.fullName || 'Doctor'}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Royal College of Medicine</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/stations')}
                        className="px-5 py-2.5 rounded-full bg-card border border-border hover:bg-muted/50 transition-all font-medium text-sm text-foreground shadow-sm"
                    >
                        Open Hub
                    </button>
                    <button
                        onClick={handleNewSession}
                        className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Session
                    </button>
                </div>
            </div>

            {/* TOP ROW: 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[320px]">

                {/* Card 1: Video Player */}
                <div
                    onClick={() => navigate('/simulation')}
                    className="lg:col-span-4 glass-card p-0 relative overflow-hidden flex flex-col justify-between group h-full border-none shadow-2xl bg-black cursor-pointer"
                >
                    <video
                        className="w-full h-full object-cover opacity-100 transition-opacity scale-105 group-hover:scale-100 duration-700 absolute inset-0 z-0"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop"
                    >
                        <source src="https://cdn.pixabay.com/video/2021/08/04/83896-583483984_large.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10" />

                    {/* Top Status Indicators */}
                    <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-white tracking-wide">LIVE FEED</span>
                        </div>
                    </div>

                    <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                            <Volume2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Column 2: Radial Progress (Center) */}
                <div
                    className="lg:col-span-4 flex items-center justify-center h-full min-h-[300px] cursor-pointer"
                    onClick={() => navigate('/analytics')}
                >
                    <ProgressRing percentage={avgScore} size={280} strokeWidth={24} />
                </div>

                {/* Card 3: Visual Image (Right) */}
                <div
                    onClick={() => navigate('/stations')}
                    className="lg:col-span-4 glass-card p-0 overflow-hidden relative group h-full border-none cursor-pointer"
                >
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
                        alt="Medical Building"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium mb-3 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Live Simulation
                        </div>
                        <p className="text-white/80 text-sm line-clamp-2">
                            Interactive 3D anatomy models available for the upcoming neurology exam.
                        </p>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: "Draws" Equivalent - Horizontal List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-foreground">Recent Sessions</h3>
                    <button
                        onClick={handleNewSession}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Session
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? <div className="text-sm text-muted-foreground p-4">Loading sessions...</div> :
                        sessions.slice(0, 6).map((session, index) => (
                            <div
                                key={session.id || index}
                                onClick={() => handleSessionClick(session)}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 min-w-[140px] group ${index === 0
                                        ? 'bg-card border-2 border-primary/20 shadow-lg shadow-primary/5 hover:-translate-y-1'
                                        : 'bg-card/40 border-border hover:bg-card hover:border-primary/30'
                                    }`}
                            >
                                <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground line-clamp-2" title={session.title}>{session.title}</span>
                                <div className="flex-grow">
                                    <div className="text-xs text-muted-foreground mb-1">{new Date(session.createdAt).toLocaleDateString()}</div>
                                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-block ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {session.status}
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-border/50">
                                    <div className="text-xs text-muted-foreground">Score</div>
                                    <div className="text-lg font-bold text-foreground">{session.score}%</div>
                                </div>
                            </div>
                        ))}
                    {!loading && sessions.length === 0 && (
                        <div className="col-span-4 text-center py-8 bg-card/10 border border-dashed border-border rounded-xl">
                            <p className="text-muted-foreground">No sessions yet. Start your first simulation!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
