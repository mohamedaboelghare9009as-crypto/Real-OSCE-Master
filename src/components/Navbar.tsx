
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Menu, X, Settings, CreditCard, LogOut, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Stations', path: '/stations' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
];

const OSCEIcon = () => (
    <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-lg">
        <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#004e9a" />
                <stop offset="100%" stopColor="#003366" />
            </linearGradient>
        </defs>
        <path d="M50 5 C53 22 58 28 75 30 C58 32 53 38 50 55 C47 38 42 32 25 30 C42 28 47 22 50 5 Z" fill="url(#starGradient)" />
        <circle cx="32" cy="45" r="10" fill="url(#orangeGradient)" />
        <path d="M32 58 C15 58 5 70 5 85 L5 90 C15 90 30 90 48 90 C48 85 45 70 42 58 C40 58 35 58 32 58 Z" fill="url(#orangeGradient)" />
        <circle cx="68" cy="45" r="10" fill="url(#blueGradient)" />
        <path d="M68 58 C85 58 95 70 95 85 L95 90 C85 90 70 90 52 90 C52 85 55 70 58 58 C60 58 65 58 68 58 Z" fill="url(#blueGradient)" />
    </svg>
);

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    const handleSignOut = () => {
        signOut();
        navigate('/auth');
        setIsProfileOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-slate-50 to-transparent pb-2">
            {/* Floating navbar container */}
            <div className="mx-4 mt-3">
                <nav className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-osce-navy/8 border border-slate-200/60 overflow-hidden">
                    {/* Gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-osce-orange via-osce-darkOrange to-osce-orange" />

                    <div className="flex items-center justify-between px-5 py-3">
                        {/* Left: Logo + Nav */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link to="/dashboard" className="flex items-center gap-3 group" onClick={closeMenu}>
                                <div className="relative">
                                    <OSCEIcon />
                                    <div className="absolute -inset-2 bg-osce-orange/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-xl text-osce-navy tracking-tight group-hover:text-osce-orange transition-colors">OSCE Hub</span>
                                    <span className="text-[10px] font-semibold text-osce-blue/50 uppercase tracking-widest -mt-0.5">Clinical Excellence</span>
                                </div>
                            </Link>

                            {/* Desktop Nav - Modern pill style */}
                            <div className="hidden lg:flex items-center bg-slate-100/80 rounded-xl p-1 gap-0.5">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive(item.path)
                                            ? 'text-white bg-osce-navy shadow-lg shadow-osce-navy/20'
                                            : 'text-slate-600 hover:text-osce-navy hover:bg-white'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* New Session CTA */}
                            <button
                                onClick={() => navigate('/simulation')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-osce-orange to-osce-darkOrange text-white font-bold text-sm rounded-xl shadow-lg shadow-osce-orange/25 hover:shadow-osce-orange/40 hover:scale-[1.02] active:scale-100 transition-all group"
                            >
                                <Zap className="w-4 h-4 group-hover:animate-pulse" />
                                <span>New Session</span>
                            </button>

                            {/* Notifications */}
                            <button
                                onClick={() => navigate('/notifications')}
                                className={`hidden md:flex relative p-2.5 rounded-xl transition-all ${location.pathname === '/notifications'
                                    ? 'bg-osce-light-blue text-osce-navy'
                                    : 'text-slate-500 hover:text-osce-navy hover:bg-slate-100'
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-osce-orange rounded-full ring-2 ring-white" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => navigate('/settings')}
                                    className={`flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isProfileOpen
                                        ? 'bg-osce-light-blue/50 border-osce-blue/20 shadow-md'
                                        : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-osce-orange to-osce-darkOrange p-0.5 shadow-sm">
                                            <img
                                                src="https://api.dicebear.com/7.x/personas/svg?seed=DrSmith&clothing=suit&hair=shortCombover&hairColor=6c4545"
                                                alt="Profile"
                                                className="w-full h-full rounded-[10px] bg-white object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    </div>

                                    <div className="hidden xl:block text-left">
                                        <div className="text-sm font-bold text-osce-navy leading-tight">{user?.fullName || 'Doctor'}</div>
                                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                            {user?.plan === 'premium' && <span className="px-1 py-0.5 bg-osce-orange/10 text-osce-orange rounded text-[9px] font-bold">PRO</span>}
                                            Student
                                        </div>
                                    </div>

                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                                            {/* Profile Header */}
                                            <div className="p-3 bg-gradient-to-br from-osce-light-blue/60 to-white rounded-xl mb-2 flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-osce-orange to-osce-darkOrange p-0.5 shadow-md">
                                                    <img src="https://api.dicebear.com/7.x/personas/svg?seed=DrSmith&clothing=suit&hair=shortCombover&hairColor=6c4545" className="w-full h-full rounded-[10px] bg-white" />
                                                </div>
                                                <div className="overflow-hidden flex-1">
                                                    <div className="font-bold text-osce-navy truncate">{user?.fullName || 'User'}</div>
                                                    <div className="text-xs text-slate-500 truncate">{user?.email || 'user@email.com'}</div>
                                                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-osce-navy text-white text-[10px] font-bold">
                                                        <Shield className="w-2.5 h-2.5" /> Verified
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="space-y-0.5">
                                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-osce-navy transition-colors">
                                                    <User className="w-4 h-4" /> My Profile
                                                </button>
                                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-osce-navy transition-colors">
                                                    <Settings className="w-4 h-4" /> Settings
                                                </button>
                                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-osce-navy transition-colors">
                                                    <CreditCard className="w-4 h-4" /> Billing & Plan
                                                    <span className="ml-auto text-[10px] font-bold bg-osce-orange text-white px-2 py-0.5 rounded-full">PRO</span>
                                                </button>
                                            </div>

                                            <div className="h-px bg-slate-100 my-2" />

                                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                className="lg:hidden p-2.5 text-osce-navy hover:bg-slate-100 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mx-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={closeMenu}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive(item.path)
                                    ? 'bg-osce-navy text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-osce-navy'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="pt-3 border-t border-slate-100">
                            <button
                                onClick={() => { navigate('/simulation'); closeMenu(); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-osce-orange to-osce-darkOrange text-white font-bold text-sm rounded-xl"
                            >
                                <Zap className="w-4 h-4" /> Start New Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
