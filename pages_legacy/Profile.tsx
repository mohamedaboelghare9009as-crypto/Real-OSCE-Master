import React, { useState } from 'react';
import GlassCard from '../components_legacy/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Shield, Activity, Zap, Download, LogOut,
    Settings, Bell, Smartphone, Key, CheckCircle2, XCircle, Crown,
    X, Loader2, Mail, Moon, Volume2, Laptop, FileText, Check,
    Trash2, Globe, ChevronRight, RefreshCw, FileDown, Mic
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type ActionType = 'settings' | 'billing' | 'devices' | 'password' | 'export' | 'notifications' | null;

const Profile: React.FC = () => {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();
    const [activeAction, setActiveAction] = useState<ActionType>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // --- Form States ---
    const [settings, setSettings] = useState({
        language: 'English',
        voiceSpeed: 'Normal',
        darkMode: false,
        autoSave: true
    });

    const [notifications, setNotifications] = useState({
        emailSession: true,
        emailWeekly: true,
        emailMarketing: false,
        pushStreak: true,
        pushGoals: true
    });

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [exportOptions, setExportOptions] = useState({
        range: '30',
        format: 'pdf'
    });

    // Mock Data
    const [devices, setDevices] = useState([
        { id: 1, name: 'iPhone 15 Pro', type: 'Mobile', location: 'San Francisco, CA', lastUsed: 'Active Now', current: true },
        { id: 2, name: 'MacBook Pro M3', type: 'Desktop', location: 'Cairo, Egypt', lastUsed: '1hr ago', current: false },
    ]);

    if (!user) return null;

    // Safe Accessors
    const userRole = profile?.role || 'Student';
    const userPlan = user?.plan || 'Free'; // Use real plan from AuthContext
    const userStats = {
        sessionsUsed: profile?.sessions_used || 0,
        sessionsLimit: profile?.sessions_limit || 100, // Default limit
        streak: profile?.streak || 0,
        avgScore: profile?.avg_score || 0
    };
    const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // --- Helpers ---
    const handleSimulateAction = (msg: string = "Changes saved successfully", duration: number = 1500) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setSuccessMsg(msg);
            setTimeout(() => {
                setSuccessMsg(null);
                setActiveAction(null);
                setPasswordForm({ current: '', new: '', confirm: '' });
            }, 1000);
        }, duration);
    };

    const removeDevice = (id: number) => {
        setDevices(prev => prev.filter(d => d.id !== id));
    };

    // --- Renderers ---

    const renderToggle = (label: string, checked: boolean, onChange: (val: boolean) => void) => (
        <div className="flex items-center justify-between py-3">
            <span className="font-medium text-slate-700">{label}</span>
            <div
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
                <motion.div
                    layout
                    className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm"
                    initial={false}
                    animate={{ left: checked ? 24 : 4 }}
                />
            </div>
        </div>
    );

    const renderModalContent = () => {
        switch (activeAction) {
            case 'settings':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">App Preferences</h3>
                                <p className="text-sm text-slate-500">Customize your workspace</p>
                            </div>
                            <Settings className="w-6 h-6 text-slate-400" />
                        </div>

                        {/* General Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Language</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                        >
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Voice Speed</label>
                                    <div className="relative">
                                        <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={settings.voiceSpeed}
                                            onChange={(e) => setSettings({ ...settings, voiceSpeed: e.target.value })}
                                            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                        >
                                            <option>Slow</option>
                                            <option>Normal</option>
                                            <option>Fast</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                {renderToggle("Dark Mode", settings.darkMode, (v) => setSettings({ ...settings, darkMode: v }))}
                                <div className="h-px bg-slate-200 w-full" />
                                {renderToggle("Auto-save Notes", settings.autoSave, (v) => setSettings({ ...settings, autoSave: v }))}
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={() => setSettings({ language: 'English', voiceSpeed: 'Normal', darkMode: false, autoSave: true })}
                                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => handleSimulateAction("Preferences updated")}
                                className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                );

            case 'billing':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Manage Plan</h3>
                                <p className="text-sm text-slate-500">Subscription & Invoices</p>
                            </div>
                            <CreditCard className="w-6 h-6 text-blue-500" />
                        </div>

                        {/* Current Plan Card */}
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Crown className="w-24 h-24 text-blue-600" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wider">Current Plan</p>
                                        <h4 className="text-2xl font-bold text-slate-900">{userPlan} Tier <span className="text-base font-normal text-slate-500">/ $29 mo</span></h4>
                                    </div>
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm border border-blue-100">Annual -20%</span>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-6">
                                    <div className="flex justify-between">
                                        <span>Renews</span>
                                        <span className="font-bold text-slate-900">Mar 15, 2026</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Usage</span>
                                        <span className="font-bold text-slate-900">{userStats.sessionsUsed} / {userStats.sessionsLimit} sessions</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                                        Update Card
                                    </button>
                                    <button className="flex-1 py-2 bg-transparent text-slate-400 hover:text-red-500 text-sm font-medium transition-colors">
                                        Cancel Plan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Options */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upgrade Options</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-3 rounded-xl border-2 border-slate-100 flex items-center justify-between opacity-50 cursor-not-allowed">
                                    <div>
                                        <p className="font-bold text-slate-900">Team Plan</p>
                                        <p className="text-xs text-slate-500">5 seats • Admin Dashboard</p>
                                    </div>
                                    <span className="font-bold text-slate-900">$99/mo</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            View Invoices <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                );

            case 'devices':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Active Devices</h3>
                                <p className="text-sm text-slate-500">Manage session security</p>
                            </div>
                            <Smartphone className="w-6 h-6 text-purple-500" />
                        </div>

                        <div className="space-y-3">
                            {devices.map(device => (
                                <div key={device.id} className={`p-4 rounded-2xl border ${device.current ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'} flex items-center justify-between group`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${device.current ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {device.type === 'Mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900">{device.name}</p>
                                                {device.current && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 rounded font-bold">YOU</span>}
                                            </div>
                                            <p className="text-xs text-slate-500">{device.location} • {device.lastUsed}</p>
                                        </div>
                                    </div>
                                    {!device.current && (
                                        <button
                                            onClick={() => removeDevice(device.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {devices.length === 0 && (
                                <div className="text-center py-8 text-slate-400">No active devices</div>
                            )}
                        </div>

                        <button
                            onClick={() => handleSimulateAction("All other devices logged out")}
                            className="w-full py-3 border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogOut className="w-4 h-4" /> Log Out All Devices</>}
                        </button>
                    </div>
                );

            case 'password':
                // Password Validation Logic
                const hasLength = passwordForm.new.length >= 8;
                const hasUpper = /[A-Z]/.test(passwordForm.new);
                const hasSymbol = /[0-9!@#$%^&*]/.test(passwordForm.new);
                const strength = [hasLength, hasUpper, hasSymbol].filter(Boolean).length;
                const strengthColor = strength === 0 ? 'bg-slate-200' : strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : 'bg-emerald-500';
                const strengthLabel = strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong';

                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Change Password</h3>
                                <p className="text-sm text-slate-500">Secure your account</p>
                            </div>
                            <Key className="w-6 h-6 text-orange-500" />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                {/* Strength Meter */}
                                {passwordForm.new && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${strengthColor}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(strength / 3) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{strengthLabel}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            {/* Requirements */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Requirements</p>
                                <div className={`flex items-center gap-2 text-sm ${hasLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {hasLength ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                    8+ characters
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${hasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {hasUpper ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                    Uppercase letter
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${hasSymbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {hasSymbol ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                    Number or symbol
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSimulateAction("Password updated successfully")}
                            disabled={strength < 3 || passwordForm.new !== passwordForm.confirm || !passwordForm.current}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Change Password"}
                        </button>
                    </div>
                );

            case 'export':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Export Data</h3>
                                <p className="text-sm text-slate-500">Download your history</p>
                            </div>
                            <Download className="w-6 h-6 text-emerald-500" />
                        </div>

                        <div className="space-y-6">
                            {/* Range Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase">Time Range</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['all', '30', 'custom'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setExportOptions({ ...exportOptions, range: opt })}
                                            className={`py-2 rounded-xl text-sm font-bold border ${exportOptions.range === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            {opt === 'all' ? 'All Time' : opt === '30' ? 'Last 30 Days' : 'Custom'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase">Format</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'pdf', label: 'PDF Reports', icon: FileText, desc: 'Best for printing and sharing' },
                                        { id: 'csv', label: 'CSV Analytics', icon: Activity, desc: 'Raw data for spreadsheet analysis' },
                                        { id: 'json', label: 'Full JSON', icon: RefreshCw, desc: 'Complete machine-readable backup' },
                                    ].map((fmt) => (
                                        <div
                                            key={fmt.id}
                                            onClick={() => setExportOptions({ ...exportOptions, format: fmt.id })}
                                            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${exportOptions.format === fmt.id ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className={`p-2 rounded-lg mr-3 ${exportOptions.format === fmt.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <fmt.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold text-sm ${exportOptions.format === fmt.id ? 'text-emerald-900' : 'text-slate-900'}`}>{fmt.label}</p>
                                                <p className="text-xs text-slate-500">{fmt.desc}</p>
                                            </div>
                                            {exportOptions.format === fmt.id && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSimulateAction("Export started. Check your email.")}
                            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileDown className="w-5 h-5" /> Generate Export</>}
                        </button>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
                                <p className="text-sm text-slate-500">Manage communication channels</p>
                            </div>
                            <Bell className="w-6 h-6 text-pink-500" />
                        </div>

                        <div className="space-y-6">
                            {/* Email Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-2">
                                    <Mail className="w-4 h-4" /> Email
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    {renderToggle("Session Summaries", notifications.emailSession, (v) => setNotifications({ ...notifications, emailSession: v }))}
                                    <div className="h-px bg-slate-200 w-full" />
                                    {renderToggle("Weekly Digest", notifications.emailWeekly, (v) => setNotifications({ ...notifications, emailWeekly: v }))}
                                    <div className="h-px bg-slate-200 w-full" />
                                    {renderToggle("Product Updates", notifications.emailMarketing, (v) => setNotifications({ ...notifications, emailMarketing: v }))}
                                </div>
                            </div>

                            {/* Push Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-2">
                                    <Smartphone className="w-4 h-4" /> Push Notifications
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    {renderToggle("Streak Reminders", notifications.pushStreak, (v) => setNotifications({ ...notifications, pushStreak: v }))}
                                    <div className="h-px bg-slate-200 w-full" />
                                    {renderToggle("Goal Achievements", notifications.pushGoals, (v) => setNotifications({ ...notifications, pushGoals: v }))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                                Test Email
                            </button>
                            <button onClick={() => handleSimulateAction("Notification preferences saved")} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Preferences"}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const quickActions = [
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
        { id: 'billing', label: 'Billing', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'devices', label: 'Devices', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'password', label: 'Password', icon: Key, color: 'text-orange-600', bg: 'bg-orange-100' },
        { id: 'export', label: 'Export Data', icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-100' },
    ];

    const planFeatures = [
        { name: "Unlimited Sessions", included: true },
        { name: "Voice Interaction Mode", included: true },
        { name: "Custom Case Generator", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Admin Dashboard", included: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-8 pb-12"
        >

            {/* 1. Hero Profile Card */}
            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

                    {/* Avatar Section */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="absolute -bottom-2 -right-2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-md flex items-center gap-1"
                        >
                            <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {userPlan} Plan
                        </motion.div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{userName}</h1>
                            <p className="text-slate-500 font-medium">{userRole} • Medical School</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button onClick={() => setActiveAction('billing')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 hover:scale-105 transition-all">
                                Manage Plan
                            </button>
                            <button onClick={() => setActiveAction('settings')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all">
                                Edit Profile
                            </button>
                            <button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Mini Usage Summary (Right Side on Desktop) */}
                    <div className="hidden md:block w-64 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Usage Limit</span>
                            <span className="text-xs font-bold text-emerald-600">{userStats.sessionsUsed} / {userStats.sessionsLimit}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "25%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-blue-500"
                            ></motion.div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">Plan renews on Mar 15, 2026</p>
                    </div>

                </div>
            </GlassCard>

            {/* 2. Usage Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Sessions Used", value: userStats.sessionsUsed, sub: "All time", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Average Score", value: `${userStats.avgScore}%`, sub: "High Pass", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Current Streak", value: `${userStats.streak} Days`, sub: "Keep it up!", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="flex items-center gap-4 group" hoverEffect>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.sub}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 3. Plan Status & Features */}
                <GlassCard className="md:col-span-1 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Current Plan</h3>
                            <p className="text-xs text-slate-500">{userPlan} Tier ($29/mo)</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {planFeatures.map((feat, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className={`text-sm font-medium ${feat.included ? 'text-slate-700' : 'text-slate-400'}`}>{feat.name}</span>
                                {feat.included ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-slate-300" />
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setActiveAction('billing')} className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-all border border-slate-200">
                        Compare Plans
                    </button>
                </GlassCard>

                {/* 4. Quick Actions Grid */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {quickActions.map((action, i) => (
                            <GlassCard
                                key={i}
                                hoverEffect
                                noPadding
                                onClick={() => setActiveAction(action.id as ActionType)}
                                className="flex flex-col items-center justify-center p-6 text-center cursor-pointer group border border-transparent hover:border-slate-100 transition-all duration-200"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Export Data Promo */}
                    <div className="mt-6 p-1 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Need your data?</h4>
                                <p className="text-xs text-slate-500">Download your full session history and PDF reports.</p>
                            </div>
                            <button onClick={() => setActiveAction('export')} className="px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-100">
                                Export All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modals */}
            <AnimatePresence>
                {activeAction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-center items-end sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => setActiveAction(null)}
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl md:rounded-[2rem] rounded-t-[2rem] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header Handle for Mobile */}
                            <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setActiveAction(null)}>
                                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => setActiveAction(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors hidden md:block"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Content Switch */}
                                {successMsg ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-soft">
                                            <Check className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{successMsg}</h3>
                                        <p className="text-slate-500">Your preferences have been updated.</p>
                                    </div>
                                ) : (
                                    renderModalContent()
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default Profile;