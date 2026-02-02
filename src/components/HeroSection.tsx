import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from './Toast';
import { sessionService } from '../../services/sessionService';
import { useAuth } from '../contexts/AuthContext';

// Import avatar images
// Import avatar images
import MaleDrStanding from '../assets/avatars/male_dr_standing.jpg';
import FemaleDrStanding from '../assets/avatars/female_dr_standing.jpg';
import FemaleDrWaving from '../assets/avatars/female_dr_waving.jpg';

// Import system images
import CardiovascularImg from '../assets/systems/cardiovascular.png';
import NeurologyImg from '../assets/systems/neurology.png';
import RespiratoryImg from '../assets/systems/respiratory.png';
import EndocrineImg from '../assets/systems/endocrine.png';
import GIImg from '../assets/systems/gi.jpg';
import RenalImg from '../assets/systems/renal.jpg';
import OphthalmologyImg from '../assets/systems/ophthalmology.png';
import ENTImg from '../assets/systems/ent.jpg';
import MusculoskeletalImg from '../assets/systems/musculoskeletal.png';
import ReproductiveImg from '../assets/systems/reproductive.jpg';

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

// Medical systems data with images and colors
const MEDICAL_SYSTEMS = [
    { id: 'cardiovascular', name: 'Cardiovascular', image: CardiovascularImg, color: 'text-rose-500', bg: 'from-rose-500/20', cases: 24, avgScore: 85 },
    { id: 'neurology', name: 'Neurology', image: NeurologyImg, color: 'text-violet-500', bg: 'from-violet-500/20', cases: 18, avgScore: 78 },
    { id: 'respiratory', name: 'Respiratory', image: RespiratoryImg, color: 'text-cyan-500', bg: 'from-cyan-500/20', cases: 21, avgScore: 82 },
    { id: 'endocrine', name: 'Endocrine', image: EndocrineImg, color: 'text-amber-500', bg: 'from-amber-500/20', cases: 15, avgScore: 80 },
    { id: 'gi', name: 'GI & Lymphatic', image: GIImg, color: 'text-emerald-500', bg: 'from-emerald-500/20', cases: 32, avgScore: 88 },
    { id: 'renal', name: 'Renal', image: RenalImg, color: 'text-orange-500', bg: 'from-orange-500/20', cases: 19, avgScore: 76 },
    { id: 'ophthalmology', name: 'Ophthalmology', image: OphthalmologyImg, color: 'text-blue-500', bg: 'from-blue-500/20', cases: 12, avgScore: 84 },
    { id: 'ent', name: 'ENT', image: ENTImg, color: 'text-pink-500', bg: 'from-pink-500/20', cases: 16, avgScore: 79 },
    { id: 'musculoskeletal', name: 'Musculoskeletal', image: MusculoskeletalImg, color: 'text-slate-500', bg: 'from-slate-500/20', cases: 28, avgScore: 86 },
    { id: 'reproductive', name: 'Reproductive', image: ReproductiveImg, color: 'text-red-500', bg: 'from-red-500/20', cases: 14, avgScore: 81 },
];

// Available doctor avatars
// Available doctor avatars
const DOCTOR_AVATARS = [
    {
        id: 'male_dr',
        name: 'Dr. Michael',
        poses: [
            { id: 'standing', src: MaleDrStanding, label: 'Standing' }
        ]
    },
    {
        id: 'female_dr',
        name: 'Dr. Sarah',
        poses: [
            { id: 'waving', src: FemaleDrWaving, label: 'Greeting' },
            { id: 'standing', src: FemaleDrStanding, label: 'Standing' }
        ]
    }
];

export const HeroSection = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgScore, setAvgScore] = useState(0);
    const [currentSystemIndex, setCurrentSystemIndex] = useState(0);
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

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

    // Auto-rotate through systems
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSystemIndex((prev) => (prev + 1) % MEDICAL_SYSTEMS.length);
        }, 5000); // Slower rotation
        return () => clearInterval(interval);
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

    const currentSystem = MEDICAL_SYSTEMS[currentSystemIndex];
    const currentAvatar = DOCTOR_AVATARS[selectedAvatarIndex];

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
            </div>

            {/* TOP ROW: 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[320px]">

                {/* Card 1 (LEFT): Doctor Avatar */}
                {/* Card 1 (LEFT): Doctor Avatar */}
                <div
                    onClick={() => navigate('/settings')}
                    className="lg:col-span-4 glass-card p-0 overflow-hidden relative group h-full border-none cursor-pointer bg-gradient-to-br from-osce-light-blue/30 to-white shadow-2xl"
                >
                    {/* Main Character Display - Full Cover */}
                    <div className="absolute inset-0">
                        <img
                            src={currentAvatar.poses[0].src}
                            alt={currentAvatar.name}
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-osce-navy/90 via-transparent to-transparent" />

                    {/* Navigation Arrows for Character Selection */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAvatarIndex((prev) => prev === 0 ? DOCTOR_AVATARS.length - 1 : prev - 1);
                        }}
                        className="absolute left-0 inset-y-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-osce-navy hover:scale-110 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAvatarIndex((prev) => (prev + 1) % DOCTOR_AVATARS.length);
                        }}
                        className="absolute right-0 inset-y-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-osce-navy hover:scale-110 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </button>

                    {/* Bottom content */}
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-osce-orange/20 backdrop-blur-md text-white text-xs font-medium mb-3 border border-osce-orange/30">
                            <Activity className="w-3 h-3" />
                            Your Avatar
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-white font-bold text-2xl tracking-tight">{user?.fullName || currentAvatar.name}</p>
                                <p className="text-white/70 text-sm">Tap to customize</p>
                            </div>
                            {/* Pose Indicator (Visual Only) */}
                            {currentAvatar.poses.length > 1 && (
                                <div className="flex gap-1 mb-1">
                                    {currentAvatar.poses.map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                    ))}
                                </div>
                            )}
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

                {/* Card 3 (RIGHT): Medical Systems with Analytics */}
                <div
                    onClick={() => navigate('/stations')}
                    className="lg:col-span-4 glass-card p-0 relative overflow-hidden flex flex-col group h-full border-none shadow-2xl cursor-pointer bg-white"
                >
                    {/* System image - Full Cover */}
                    <div className="absolute inset-0">
                        <img
                            src={currentSystem.image}
                            alt={currentSystem.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Navigation - Minimalist Hover controls */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSystemIndex((prev) => prev === 0 ? MEDICAL_SYSTEMS.length - 1 : prev - 1);
                        }}
                        className="absolute left-0 inset-y-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-slate-500 hover:text-osce-navy hover:scale-110 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSystemIndex((prev) => (prev + 1) % MEDICAL_SYSTEMS.length);
                        }}
                        className="absolute right-0 inset-y-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-slate-500 hover:text-osce-navy hover:scale-110 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </button>

                    {/* Progress Indicator - Slim Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-20">
                        <div
                            className={`h-full transition-all duration-500 rounded-r-full ${currentSystem.color.replace('text-', 'bg-')}`}
                            style={{ width: `${((currentSystemIndex + 1) / MEDICAL_SYSTEMS.length) * 100}%` }}
                        />
                    </div>

                    {/* Bottom Info - Clear Background for Readability */}
                    <div className="absolute bottom-0 left-0 right-0 z-10">
                        <div className="bg-gradient-to-t from-white/95 via-white/80 to-transparent p-5 pt-12">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className={`text-xl font-black tracking-tight ${currentSystem.color} drop-shadow-sm`}>
                                        {currentSystem.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Cases</div>
                                        <div className="text-lg font-bold text-slate-700">{currentSystem.cases}</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                                        <div className={`text-lg font-bold ${currentSystem.color}`}>{currentSystem.avgScore}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: Recent Sessions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-foreground">Recent Sessions</h3>
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
                                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-block ${session.status === 'completed' ? 'bg-osce-light-blue text-osce-navy' : 'bg-amber-100 text-amber-700'
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
