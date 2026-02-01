import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            navigate('/auth?error=' + error, { replace: true });
            return;
        }

        if (token) {
            // Store token and redirect to dashboard
            localStorage.setItem('token', token);
            window.location.href = '/dashboard'; // Full reload to pick up new token
        } else {
            navigate('/auth?error=no_token', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA]">
            <div className="flex flex-col items-center gap-4">
                <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-slate-500">Completing sign in...</p>
            </div>
        </div>
    );
}
