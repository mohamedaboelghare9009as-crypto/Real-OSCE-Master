import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseLibrary from './pages/CaseLibrary';
import Session from './pages/Session';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  // Hide main app layout for session and landing page
  const isFullscreen = location.pathname.startsWith('/session/') || location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-slate-800 font-inter selection:bg-emerald-500/30">
      {isFullscreen ? (
        <Routes>
           <Route path="/" element={<Landing />} />
           <Route path="/session/:caseId" element={
             <ProtectedRoute>
               <Session />
             </ProtectedRoute>
           } />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><CaseLibrary /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;