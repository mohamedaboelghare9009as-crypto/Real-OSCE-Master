
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StationsSection } from './components/StationsSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { InsightsPanel } from './components/InsightsPanel';
import { AnalyticsPage } from './components/AnalyticsPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SimulationPage } from './components/SimulationPage';
import { FeedbackReportPage } from './components/feedback/FeedbackReportPage';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './landing/LandingPage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';

// Legacy Wrappers to handle auth logic if needed
const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <HashRouter>
                    <Routes>
                        {/* Main Layout Routes */}
                        {/* Main Layout Routes */}
                        <Route path="/" element={<LandingPage />} />

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <HeroSection />
                                        <AnalyticsSection />
                                        <InsightsPanel />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        <Route path="/stations" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <StationsSection />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <AnalyticsPage />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        <Route path="/reports" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <ReportsPage />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <SettingsPage />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#F6F8FA]">
                                    <Navbar />
                                    <main className="container mx-auto max-w-[1400px]">
                                        <NotificationsPage />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        } />

                        {/* Simulation Routes */}
                        <Route path="/simulation" element={
                            <ProtectedRoute>
                                <SimulationPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/session/:caseId" element={
                            <ProtectedRoute>
                                <SimulationPage />
                            </ProtectedRoute>
                        } />

                        {/* Temporary Route for Feedback Development */}
                        <Route path="/feedback-demo" element={
                            <ProtectedRoute>
                                <Navbar />
                                <FeedbackReportPage />
                            </ProtectedRoute>
                        } />

                        {/* Landing Page Route */}
                        {/* Landing Page Route - Kept for backward compatibility if needed, or remove if redundant */}
                        <Route path="/landing" element={<Navigate to="/" replace />} />

                        {/* Login Page Route */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* OAuth Callback Route */}
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Auth Redirects / Fallbacks */}
                        {/* Assuming Admin/Auth are handled by standard redirects if logic triggers, 
                but we don't have explicit pages for them in new UI. 
                Using legacy Auth page if user navigates manually?
            */}
                        <Route path="/auth" element={<Navigate to="/login" replace />} /> {/* Redirect to new login page */}

                    </Routes>
                </HashRouter>
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;
