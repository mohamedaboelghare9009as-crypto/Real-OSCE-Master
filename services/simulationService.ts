import { HistoryPoint, ExamFinding, LabResult, Case } from '../types';

// We keep EventEmitter for compatibility, but internally we use fetch
class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, listener: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event: string, ...args: any[]) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }

    removeAllListeners() {
        this.events = {};
    }
}

class SimulationService extends EventEmitter {
    private baseUrl = 'http://localhost:3001/api';
    private currentCaseId: string | null = null;
    private currentCaseData: any = null;
    public selectedEngine: 'v2' = 'v2'; // V2 Only
    private sessionId: string | null = null;

    constructor() {
        super();
    }

    // Engine is now fixed to V2, no toggle needed

    async checkBackendHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/health`);
            if (!res.ok) return false;
            const data = await res.json();
            return data.status === 'ok';
        } catch (e) {
            console.error("Backend health check failed:", e);
            return false;
        }
    }

    async initializeCase(caseId?: string, specialty?: string): Promise<Case | null> {
        if (!(await this.checkBackendHealth())) {
            console.error("Backend is not ready/reachable.");
            // alert("Backend Server is not reachable! Please check if the server is running on port 3001.");
            return null;
        }

        try {

            // MODIFIED: Fetch 'test-session-case' from Backend (Seeded V2 Case)
            // We removed the hardcoded mock object to force integration with the new Deterministic Pipeline.
            // MODIFIED: Fetch from Backend (DB Only)
            // We removed the hardcoded mock object to force integration with the new Deterministic Pipeline.
            if (caseId) {
                console.log(`[SimulationService] Fetching case ${caseId} from Backend...`);
            }


            // MOCK CASE: Direct testing with backend mock case
            // Removed MOCK_CASE check to force DB usage
            // if (caseId === 'mock-case-001') { ... }

            let res;
            if (caseId) {
                res = await fetch(`${this.baseUrl}/cases/${caseId}`);
            } else {
                res = await fetch(`${this.baseUrl}/generate-case`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ specialty })
                });
            }

            const data = await res.json();
            // The backend returns { case, session } for /cases/:id
            const caseData = data.case || data;

            this.currentCaseId = caseData.id || caseData._id;
            this.currentCaseData = caseData;

            // Generate or use existing session ID
            this.sessionId = data.session?.id || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            return caseData;
        } catch (e) {
            console.error("Failed to init case", e);
            return null;
        }
    }

    async sendMessage(message: string, history: any[]): Promise<any> {
        if (!(await this.checkBackendHealth())) {
            console.error("Backend is not ready.");
            return "Backend offline.";
        }

        try {
            const res = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': this.sessionId || '',
                    'x-case-id': this.currentCaseId || ''
                },
                body: JSON.stringify({
                    message,
                    history,
                    engine: 'v2'
                })
            });

            if (!res.ok) {
                console.error("Chat API Error:", res.statusText);
                return { text: "I'm sorry, I'm having trouble understanding you right now." };
            }

            const data = await res.json();

            // Convert Base64 Audio to Blob for playback
            let audioBlob: Blob | null = null;
            if (data.audio) {
                try {
                    const byteCharacters = atob(data.audio);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
                } catch (e) {
                    console.error("Audio conversion failed", e);
                }
            }

            // Emit as history point for UI
            const point: HistoryPoint = {
                id: Date.now().toString(),
                category: 'symptom',
                text: data.text,
                timestamp: Date.now()
            };
            this.emit('history_point', point);

            return { text: data.text, audioBlob };

        } catch (e) {
            console.error("Send message failed", e);
            throw e;
        }
    }

    // Deprecated but kept for compatibility - now does nothing or auto-starts chat?
    startHistoryTaking() {
        // No-op or trigger initial greeting
    }

    performExam(system: string) {
        // Map frontend system IDs to backend names if they differ
        const systemMap: Record<string, string> = {
            'resp': 'Respiratory',
            'cardio': 'Cardiovascular',
            'general': 'General Appearance',
            'ext': 'Extremities'
        };
        const targetSystem = systemMap[system] || system;

        // Try to find finding in currentCaseData (both models)
        let findings: any[] = [];

        // Model 1: hiddenTruth
        if (this.currentCaseData?.hiddenTruth?.physicalFindings) {
            findings = this.currentCaseData.hiddenTruth.physicalFindings[targetSystem] || [];
        }
        // Model 2: Structured examination
        else if (this.currentCaseData?.examination?.findings) {
            findings = this.currentCaseData.examination.findings
                .filter((f: any) => f.system === targetSystem)
                .map((f: any) => f.finding);
        }

        if (findings.length > 0) {
            const mappedFindings: ExamFinding[] = findings.map((f: string, i: number) => ({
                id: `${system}-${i}`,
                system,
                finding: f,
                isPositive: true
            }));

            setTimeout(() => {
                this.emit('exam_result', mappedFindings);
            }, 1000);
        } else {
            // Return "No significant findings" or similar
            this.emit('exam_result', [{
                id: `${system}-none`,
                system,
                finding: "No significant findings identified on examination of this system.",
                isPositive: false
            }]);
        }
    }

    requestLabs() {
        // Try both models
        let labs: any[] = [];

        if (this.currentCaseData?.hiddenTruth?.labResults) {
            labs = this.currentCaseData.hiddenTruth.labResults;
        } else if (this.currentCaseData?.investigations) {
            const bedside = this.currentCaseData.investigations.bedside || [];
            const confirmatory = this.currentCaseData.investigations.confirmatory || [];
            labs = [...bedside, ...confirmatory].map(l => ({
                testName: l.name,
                value: l.result,
                flag: l.abnormal ? 'high' : 'normal',
                range: l.normalRange
            }));
        }

        if (labs.length > 0) {
            labs.forEach((lab: any, i: number) => {
                setTimeout(() => {
                    this.emit('lab_result', {
                        ...lab,
                        id: `lab-${i}`,
                        testName: lab.testName || lab.name,
                        value: lab.value || lab.result
                    });
                }, 1000 + (i * 500));
            });
        }
    }
}

export const simulation = new SimulationService();
