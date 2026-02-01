
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    Printer,
    Share2,
    Search,
    MoreVertical,
    CheckCircle2,
    FileBarChart,
    Loader2,
    PieChart,
    Clock,
    Cloud,
    ChevronRight,
    FileCheck,
    TrendingUp,
    Files,
    HardDrive,
    Sparkles
} from 'lucide-react';
import { useToast } from './Toast';
import { sessionService } from '../../services/sessionService';

const reportTypes = [
    { id: 'Performance', icon: TrendingUp, desc: 'Scores & Trends', color: 'bg-blue-500' },
    { id: 'Attendance', icon: Clock, desc: 'Session Logs', color: 'bg-emerald-500' },
    { id: 'Competency', icon: CheckCircle2, desc: 'Skill Matrix', color: 'bg-violet-500' },
    { id: 'Transcript', icon: FileText, desc: 'Full History', color: 'bg-amber-500' },
];

export const ReportsPage = () => {
    const { addToast } = useToast();
    const [selectedType, setSelectedType] = useState('Performance');
    const [searchQuery, setSearchQuery] = useState('');
    const [reportFormat, setReportFormat] = useState('PDF');
    const [isGenerating, setIsGenerating] = useState(false);

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Map sessions to report items
        sessionService.getUserSessions().then(sessions => {
            const mappedDocs = sessions.map((s: any) => ({
                id: s.id,
                name: `Session Report: ${s.title}`,
                date: new Date(s.createdAt).toLocaleDateString(),
                type: 'PDF',
                size: '1.2 MB', // Mock
                status: s.status === 'completed' ? 'Ready' : 'Pending',
                score: s.score
            }));
            setReports(mappedDocs);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const filteredReports = reports.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenerateReport = () => {
        setIsGenerating(true);
        addToast('info', 'Generating Report', `Compiling ${selectedType} data into ${reportFormat} format...`);

        setTimeout(() => {
            setIsGenerating(false);
            addToast('success', 'Report Ready', `${selectedType} report has been created successfully.`);
        }, 2000);
    };

    const handleDownload = (fileName: string) => {
        addToast('success', 'Download Started', `Downloading ${fileName}...`);
    };

    return (
        <div className="px-6 py-8 animate-in fade-in duration-700 space-y-8 pb-20">

            {/* Header & Stats */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Reports Center</h1>
                        <p className="text-muted-foreground">Generate comprehensive reports on your clinical progress and station history.</p>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group transition-all"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        {isGenerating ? 'Generating...' : 'Generate New Report'}
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-4 flex items-center gap-4 border border-white/40 bg-card rounded-xl shadow-sm">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                            <Files className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-foreground">{reports.length}</div>
                            <div className="text-xs text-muted-foreground font-medium">Reports Generated</div>
                        </div>
                    </div>
                    {/* ... Other stats .. */}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Generator Controls (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 space-y-6 border border-white/40 bg-card rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Configuration
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Report Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {reportTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`relative p-3 rounded-xl text-left transition-all border overflow-hidden group ${selectedType === type.id
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-card border-border hover:border-primary/30'
                                                }`}
                                        >
                                            <type.icon className={`w-5 h-5 mb-2 transition-colors ${selectedType === type.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                            <div className={`font-semibold text-sm ${selectedType === type.id ? 'text-primary' : 'text-foreground'}`}>{type.id}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Other inputs (Format, Time) */}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Reports & Preview (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Recent List */}
                    <div className="glass-card p-6 border border-white/40 bg-card rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Recent Files</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 w-48 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {loading ? <div>Loading...</div> : filteredReports.map((report) => (
                                <div key={report.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{report.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                                                {report.status === 'Ready' && (
                                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                                        <CheckCircle2 className="w-3 h-3" /> Ready
                                                    </span>
                                                )}
                                                <span className="font-mono text-primary">Score: {report.score}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDownload(report.name)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!loading && filteredReports.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">No reports match your search.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
