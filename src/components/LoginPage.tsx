import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login, register, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-osce-blue flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-osce-navy relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #EDF5FF 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Gradient Orbs */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-osce-orange/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-osce-blue/10 rounded-full blur-[120px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div>
                        <img
                            src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/LogoPrimary.png"
                            alt="OSCE Master"
                            className="h-10 brightness-0 invert"
                        />
                    </div>

                    {/* Main Message */}
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Master your clinical skills with{' '}
                            <span className="text-osce-orange">AI-powered</span>{' '}
                            simulations
                        </h1>
                        <p className="text-osce-blue/80 text-lg max-w-md">
                            Practice with realistic AI patients, get instant feedback,
                            and build the confidence you need to excel in your OSCEs.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-12">
                        <div>
                            <div className="text-3xl font-bold text-white">12,000+</div>
                            <div className="text-osce-blue/60 text-sm">Active Students</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">200+</div>
                            <div className="text-osce-blue/60 text-sm">Clinical Cases</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">94%</div>
                            <div className="text-osce-blue/60 text-sm">Pass Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <img
                            src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/LogoPrimary.png"
                            alt="OSCE Master"
                            className="h-10"
                        />
                    </div>

                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-osce-navy">
                            {mode === 'login' ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="mt-2 text-slate-600">
                            {mode === 'login'
                                ? 'Sign in to continue your clinical training'
                                : 'Start your journey to OSCE mastery'}
                        </p>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-xl font-medium text-osce-navy hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-osce-blue text-slate-500">or continue with email</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-osce-navy mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-osce-orange focus:border-transparent transition-all"
                                    placeholder="Dr. John Smith"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-osce-navy mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-osce-orange focus:border-transparent transition-all"
                                placeholder="you@medical.edu"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-osce-navy mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-osce-orange focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm text-osce-orange hover:text-osce-darkOrange font-medium">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-osce-orange hover:bg-osce-darkOrange text-white font-bold rounded-xl transition-all shadow-lg shadow-osce-orange/25 hover:shadow-osce-orange/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="text-center">
                        <p className="text-slate-600">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-osce-orange hover:text-osce-darkOrange font-semibold"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>

                    {/* Back to Landing */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => navigate('/landing')}
                            className="text-sm text-slate-500 hover:text-osce-navy transition-colors"
                        >
                            ← Back to home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
