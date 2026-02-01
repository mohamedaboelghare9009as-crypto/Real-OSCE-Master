import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

export default function GoogleAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithGoogle, setToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Google Auth Error:', error);
            navigate('/auth?error=google_auth_failed');
            return;
        }

        if (token) {
            // Use the helper method if it exists, or manually handle it here
            // Since loginWithGoogle might not accept a token directly depending on implementation,
            // we'll implement a token handler in AuthContext or just do it here.
            // For now, let's manually save and reload user state.

            try {
                // Update context state directly without reload
                setToken(token);
                // Force a small delay to ensure state updates before navigation? 
                // Actually navigate should be enough if state updates. 
                // But we want to ensure we don't race with the initial load effect in AuthContext.

                const isNewUser = searchParams.get('isNewUser') === 'true';
                navigate(isNewUser ? '/plan-selection' : '/dashboard', { replace: true });
            } catch (err) {
                console.error('Error saving token:', err);
                navigate('/auth?error=save_token_failed');
            }
        } else {
            navigate('/auth');
        }
    }, [searchParams, navigate, loginWithGoogle]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Completing Sign In...</h2>
                <p className="text-gray-500 mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
}
