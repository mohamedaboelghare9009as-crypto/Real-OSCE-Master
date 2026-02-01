
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import { TrendingUp, ChevronRight, Check } from 'lucide-react';

// Simplified version for the Home Dashboard
export const AnalyticsSection = () => {
    const navigate = useNavigate();
    return (
        <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-5 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground">Performance Breakdown</h3>
                        <button
                            onClick={() => navigate('/reports')}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                            Full report <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        View your full analytics dashboard for details.
                    </div>
                </div>
            </div>
        </div>
    );
};
