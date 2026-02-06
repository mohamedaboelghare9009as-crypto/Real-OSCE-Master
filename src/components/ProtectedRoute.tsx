
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-background">Loading...</div>;
    }

    // If we shouldn't rely on Auth for now because it's mocked or disabled in source,
    // we follow the legacy pattern where it was commented out. 
    // BUT the instructions said "Preserve auth guards still work (if present)".
    // Since legacy had them commented out, "work if present" implies "if enabled".
    // I will uncomment/implement the standard logic so it IS present and functional if Mock User is removed.

    if (!user) {
        // Redirect to auth page (if we had one active) or just show Nothing/Login.
        // Legacy redirected to /auth.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
