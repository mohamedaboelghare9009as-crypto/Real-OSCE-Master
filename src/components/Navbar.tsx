
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Menu, X, Settings, CreditCard, LogOut, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { label: 'Overview', path: '/' },
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

        <path
            d="M50 5 C53 22 58 28 75 30 C58 32 53 38 50 55 C47 38 42 32 25 30 C42 28 47 22 50 5 Z"
            fill="url(#starGradient)"
        />
        <circle cx="32" cy="45" r="10" fill="url(#orangeGradient)" />
        <path
            d="M32 58 C15 58 5 70 5 85 L5 90 C15 90 30 90 48 90 C48 85 45 70 42 58 C40 58 35 58 32 58 Z"
            fill="url(#orangeGradient)"
        />
        <circle cx="68" cy="45" r="10" fill="url(#blueGradient)" />
        <path
            d="M68 58 C85 58 95 70 95 85 L95 90 C85 90 70 90 52 90 C52 85 55 70 58 58 C60 58 65 58 68 58 Z"
            fill="url(#blueGradient)"
        />
    </svg>
);

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    const handleSignOut = () => {
        signOut();
        navigate('/auth'); // Or wherever auth redirect is handled
        setIsProfileOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-sm transition-all duration-300">
            {/* Modern Gradient Line at Bottom Edge */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Logo and Desktop Nav */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
                        <OSCEIcon />
                        <span className="font-bold text-2xl text-foreground tracking-tight group-hover:text-primary transition-colors">OSCE Hub</span>
                    </Link>

                    {/* Desktop Nav Tabs */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`nav-tab relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(item.path)
                                    ? 'text-foreground bg-secondary/50'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                                    }`}
                            >
                                {item.label}
                                {isActive(item.path) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full mb-1.5" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/notifications')}
                            className={`relative p-2 rounded-lg hover:bg-muted/50 transition-colors group ${location.pathname === '/notifications' ? 'bg-muted/50 text-primary' : ''}`}
                        >
                            <Bell className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ${location.pathname === '/notifications' ? 'text-primary' : ''}`} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        </button>

                        {/* Enhanced Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-all duration-300 ${isProfileOpen
                                    ? 'bg-background border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                                    : 'bg-background/50 border-transparent hover:bg-background hover:border-border hover:shadow-md'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5">
                                        <img
                                            src="https://api.dicebear.com/7.x/personas/svg?seed=DrSmith&clothing=suit&hair=shortCombover&hairColor=6c4545"
                                            alt="Profile"
                                            className="w-full h-full rounded-full bg-white object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-osce-orange border-2 border-white rounded-full"></div>
                                </div>

                                <div className="hidden xl:block text-left mr-1">
                                    <div className="text-xs font-bold text-foreground">{user?.fullName || 'Doctor'}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                        {user?.plan === 'premium' ? 'Student Pro' : 'Student'} <Sparkles className="w-2 h-2 text-primary" />
                                    </div>
                                </div>

                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <div className="absolute top-full right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right ring-1 ring-black/5">
                                        <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent rounded-xl mb-2 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-sm">
                                                <img src="https://api.dicebear.com/7.x/personas/svg?seed=DrSmith&clothing=suit&hair=shortCombover&hairColor=6c4545" className="w-full h-full rounded-full" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-foreground truncate">{user?.fullName || 'User'}</div>
                                                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-osce-light-blue text-osce-navy text-[10px] font-bold">
                                                    <Shield className="w-3 h-3" /> Verified
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5">
                                            <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                                <User className="w-4 h-4" /> My Profile
                                            </button>
                                            <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                                <Settings className="w-4 h-4" /> Settings
                                            </button>
                                            <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                                <CreditCard className="w-4 h-4" /> Billing & Plan
                                                <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">PRO</span>
                                            </button>
                                        </div>

                                        <div className="h-px bg-slate-100 my-2" />

                                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600 transition-colors">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-xl animate-in slide-in-from-top-5 duration-200">
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={closeMenu}
                                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-border/50 my-2" />

                        <div className="flex items-center justify-around p-2">
                            <button
                                onClick={() => { navigate('/notifications'); closeMenu(); }}
                                className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
                            >
                                <div className="p-2 bg-muted/50 rounded-full">
                                    <Bell className="w-5 h-5" />
                                </div>
                                Notifications
                            </button>
                            <button
                                onClick={() => { navigate('/settings'); closeMenu(); }}
                                className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
                            >
                                <div className="p-2 bg-muted/50 rounded-full">
                                    <User className="w-5 h-5" />
                                </div>
                                Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
