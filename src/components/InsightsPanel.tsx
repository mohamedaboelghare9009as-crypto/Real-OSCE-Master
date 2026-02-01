
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { useToast } from './Toast';

interface InsightItem {
    id: number;
    type: 'success' | 'warning' | 'error' | 'tip';
    title: string;
    description: string;
}

const insights: InsightItem[] = [
    {
        id: 1,
        type: 'error',
        title: 'Missed key questions',
        description: 'Did not ask about family history of cardiac disease in Station 4',
    },
    {
        id: 2,
        type: 'warning',
        title: 'Incomplete examination',
        description: 'Skipped peripheral pulse assessment during cardiovascular exam',
    },
    {
        id: 3,
        type: 'success',
        title: 'Excellent communication',
        description: 'Demonstrated empathy and clear explanation of diagnosis',
    },
    {
        id: 4,
        type: 'tip',
        title: 'AI Suggestion',
        description: 'Focus on systematic approach to chest pain history taking',
    },
];

export const InsightsPanel = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleInsightClick = (insight: InsightItem) => {
        addToast('info', 'Opening Insight', `Viewing details for: ${insight.title}`);
        navigate('/reports');
    };

    return (
        <div className="px-6 py-6 pb-12">
            <div className="glass-card p-6 relative overflow-hidden bg-card rounded-xl border border-border shadow-sm">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">AI Feedback & Insights</h3>
                    </div>
                    <button
                        onClick={() => navigate('/reports')}
                        className="flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors font-medium"
                    >
                        View Full Report <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight) => (
                        <div
                            key={insight.id}
                            onClick={() => handleInsightClick(insight)}
                            className={`p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer group bg-card`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 p-1.5 rounded-full bg-background/50 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                                    {insight.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                    {insight.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                    {insight.type === 'tip' && <Lightbulb className="w-5 h-5 text-blue-500" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{insight.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
