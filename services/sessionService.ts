export interface CompetencyScores {
    history: number;
    physical: number;
    diagnosis: number;
    management: number;
    communication: number;
}

export interface SessionResult {
    caseId: string;
    caseTitle: string;
    score: number;
    feedback: string;
    transcript: any[];
    status: 'completed' | 'abandoned';
    competencyScores?: CompetencyScores;
    durationSeconds?: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const getCurrentUserId = async (): Promise<string | null> => {
    const token = localStorage.getItem('token') || 'dev-token'; // Fallback to dev-token
    if (!token) return null;

    if (token === 'dev-token') {
        return 'dev-user-id';
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            return user.id;
        }
    } catch (e) {
        console.error('Error getting current user:', e);
    }
    return null;
};

export const sessionService = {
    async saveSession(result: SessionResult) {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('User not logged in');

        const response = await fetch(`${API_URL}/api/sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: userId,
                case_id: result.caseId,
                case_title: result.caseTitle,
                score: result.score,
                feedback: result.feedback,
                transcript: result.transcript,
                status: result.status,
                competency_scores: result.competencyScores || {},
                duration_seconds: result.durationSeconds || 0
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to save session');
        }
    },

    async getUserSessions() {
        const userId = await getCurrentUserId();
        if (!userId) return [];

        const response = await fetch(`${API_URL}/api/sessions/user/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();

        return data.map((s: any) => ({
            id: s._id || s.id,
            caseId: s.case_id,
            title: s.case_title,
            specialty: 'General',
            patientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback',
            score: s.score,
            status: s.status,
            createdAt: s.created_at,
            competencyScores: s.competency_scores,
            durationSeconds: s.duration_seconds
        }));
    },

    async getUserAnalytics(timeRange: 'today' | 'yesterday' | 'this_month' | 'last_month' | 'all' = 'all') {
        const allSessions = await this.getUserSessions();

        // Filter sessions by time range
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const sessions = allSessions.filter((s: any) => {
            const date = new Date(s.createdAt);
            switch (timeRange) {
                case 'today':
                    return date >= startOfToday;
                case 'yesterday':
                    const startOfYesterday = new Date(startOfToday);
                    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
                    return date >= startOfYesterday && date < startOfToday;
                case 'this_month':
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    return date >= startOfMonth;
                case 'last_month':
                    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                    return date >= startOfLastMonth && date <= endOfLastMonth;
                default:
                    return true;
            }
        });

        const totalSessions = sessions.length;

        // 1. Basic Stats
        const passedSessions = sessions.filter((s: any) => s.score >= 70).length;
        const avgScore = totalSessions > 0
            ? Math.round(sessions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / totalSessions)
            : 0;
        const totalDuration = sessions.reduce((acc: number, s: any) => acc + (s.durationSeconds || 0), 0);
        const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions / 60) : 0; // in minutes

        // 2. Performance Trend (Last 6 Sessions or Days - simplified to sessions for now)
        // If no sessions, provide empty structure with 0s
        const performanceData = sessions.length > 0
            ? sessions.slice(0, 7).reverse().map((s: any) => ({
                name: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: s.score,
                avg: avgScore // Compare vs overall average
            }))
            : [{ name: 'No Data', score: 0, avg: 0 }];

        // 3. Competency Radar
        const competencies = { history: 0, physical: 0, diagnosis: 0, management: 0, communication: 0 };
        let compCount = 0;

        sessions.forEach((s: any) => {
            if (s.competencyScores) {
                competencies.history += s.competencyScores.history || 0;
                competencies.physical += s.competencyScores.physical || 0;
                competencies.diagnosis += s.competencyScores.diagnosis || 0;
                competencies.management += s.competencyScores.management || 0;
                competencies.communication += s.competencyScores.communication || 0;
                compCount++;
            }
        });

        const radarData = [
            { subject: 'History', A: compCount ? Math.round(competencies.history / compCount) : 0, fullMark: 100 },
            { subject: 'Physical', A: compCount ? Math.round(competencies.physical / compCount) : 0, fullMark: 100 },
            { subject: 'Communication', A: compCount ? Math.round(competencies.communication / compCount) : 0, fullMark: 100 },
            { subject: 'Diagnosis', A: compCount ? Math.round(competencies.diagnosis / compCount) : 0, fullMark: 100 },
            { subject: 'Management', A: compCount ? Math.round(competencies.management / compCount) : 0, fullMark: 100 },
        ];

        // 4. Specialty Performance
        const specialtyMap: Record<string, { total: number, count: number }> = {};
        sessions.forEach((s: any) => {
            const spec = s.specialty || 'General';
            if (!specialtyMap[spec]) specialtyMap[spec] = { total: 0, count: 0 };
            specialtyMap[spec].total += s.score;
            specialtyMap[spec].count += 1;
        });

        const specialtyData = Object.keys(specialtyMap).map(key => ({
            name: key,
            score: Math.round(specialtyMap[key].total / specialtyMap[key].count)
        }));

        if (specialtyData.length === 0) specialtyData.push({ name: 'No Data', score: 0 });

        return {
            totalSessions,
            passedSessions,
            avgScore,
            avgDuration,
            sessions: sessions.slice(0, 10), // Recent list
            performanceData,
            radarData,
            specialtyData
        };
    }
};
