import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import CheckoutForm from '../components/CheckoutForm';
import { Loader, ShieldCheck, Zap, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

// Replace with your public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Payment() {
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        const fetchPaymentIntent = async () => {
            try {
                // Get current user session for auth token
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;

                if (!accessToken) {
                    setError('Please log in to make a payment');
                    return;
                }

                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                console.log('Calling:', `${supabaseUrl}/functions/v1/create-payment-intent`);

                const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': supabaseAnonKey,
                    },
                    body: JSON.stringify({
                        amount: 1999, // $19.99
                        currency: 'usd'
                    })
                });

                console.log('Response status:', response.status);

                const text = await response.text();
                console.log('Response text:', text);

                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    setError(`Invalid response: ${text.substring(0, 100)}`);
                    return;
                }

                if (!response.ok) {
                    console.error('Function response error:', data);
                    setError(`Error ${response.status}: ${data.error || data.message || response.statusText}`);
                    return;
                }

                if (data?.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else if (data?.error) {
                    setError(`Stripe error: ${data.error}`);
                } else {
                    console.log('Full response data:', data);
                    setError('No client secret in response');
                }
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(`Network error: ${err.message}`);
            }
        };

        fetchPaymentIntent();
    }, []);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#10b981',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="min-h-screen bg-[#F6F8FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">

                {/* Left Column: Product Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Stethoscope className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Pro Plan</h1>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$20</span>
                                <span className="text-slate-400">/month</span>
                            </div>

                            <ul className="space-y-4 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-emerald-400" />
                                    <span>Unlimited AI Case Simulations</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <span>Advanced Performance Analytics</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                                    <span>Access to All Specialties</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 px-4">
                        <p>Trusted by medical students worldwide</p>
                    </div>
                </div>

                {/* Right Column: Payment Form */}
                <div>
                    {error ? (
                        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-red-200">
                            <div className="flex flex-col items-center gap-3 text-red-600 p-6 text-center">
                                <div className="text-4xl">⚠️</div>
                                <p className="font-bold">Payment Setup Error</p>
                                <p className="text-sm text-slate-600">{error}</p>
                                <p className="text-xs text-slate-500 mt-2">Check browser console for details</p>
                            </div>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Loader className="w-8 h-8 animate-spin text-emerald-500" />
                                <p>Initializing secure checkout...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
