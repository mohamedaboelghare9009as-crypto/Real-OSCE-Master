import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const isNewUser = searchParams.get('isNewUser');

        if (error) {
            console.error('OAuth Error:', error);
            navigate('/login?error=' + encodeURIComponent(error));
            return;
        }

        if (token) {
            // Store the token and redirect to dashboard
            setToken(token);

            // Optional: Show welcome message for new users
            if (isNewUser === 'true') {
                console.log('Welcome! New user registered via Google OAuth');
            }

            navigate('/');
        } else {
            // No token received, redirect to login
            navigate('/login?error=no_token');
        }
    }, [searchParams, setToken, navigate]);

    return (
        <div className="min-h-screen bg-osce-blue flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6">
                    <svg className="animate-spin w-full h-full text-osce-orange" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-osce-navy mb-2">
                    Completing Sign In...
                </h2>
                <p className="text-slate-600">
                    Please wait while we verify your credentials.
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
