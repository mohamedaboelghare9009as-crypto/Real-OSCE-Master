import { LucideIcon, CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';

// --- Types ---

export type Grade = 'Pass' | 'Borderline' | 'Fail';

export interface StationInfo {
    id: string;
    title: string;
    scenario: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeAllowed: number; // minutes
    timeTaken: number; // minutes
}

export interface ScoreBreakdown {
    total: number;
    obtained: number;
    percentage: number;
}

export interface ChecklistItem {
    id: string;
    text: string;
    category?: string;
    status: 'Done' | 'Missed' | 'Partial';
    score: number; // 0 or 1 usually
    maxScore: number;
    isCritical: boolean; // Automatic fail or heavy penalty if missed
    feedback?: string;
}

export interface ExamFindingItem extends ChecklistItem {
    system: string;
    correctlyIdentified: boolean;
}

export interface InvestigationItem {
    id: string;
    name: string;
    type: 'Bedside' | 'Lab' | 'Imaging';
    status: 'Ordered' | 'Missed' | 'Not Indicated';
    appropriateness: 'Correct' | 'Harmful' | 'Unnecessary'; // "Harmful" = penalty (e.g. CT Head for tension headache)
    cost?: number; // Optional 'gamified' element if we want cost factor later
}

export interface DDxItem {
    diagnosis: string;
    isCorrect: boolean;
    isLifeThreatening: boolean; // e.g. MI, PE
    rank: number; // Order in list
    preData: boolean; // Added before investigations?
}

export interface ManagementItem extends ChecklistItem {
    category: 'Pharm' | 'Non-Pharm' | 'Disposition' | 'Education';
}

export interface StationFeedback {
    station: StationInfo;
    result: {
        score: number;
        grade: Grade;
        outcomeSummary: string;
        criticalFail: boolean; // e.g. Dangerous action
    };
    domains: {
        history: {
            items: ChecklistItem[];
            score: ScoreBreakdown;
        };
        examination: {
            items: ExamFindingItem[];
            score: ScoreBreakdown;
        };
        investigations: {
            items: InvestigationItem[];
            score: ScoreBreakdown;
        };
        ddx: {
            items: DDxItem[];
            score: ScoreBreakdown;
        };
        management: {
            items: ManagementItem[];
            score: ScoreBreakdown;
        };
    };
    globalCriticalErrors: string[]; // e.g. "Did not wash hands", "Rude to patient"
    examinerComments: {
        strengths: string[];
        weaknesses: string[];
    };
    modelAnswer: {
        summary: string;
        keyPoints: string[];
    };
}

// --- Mock Data ---

export const MOCK_FEEDBACK: StationFeedback = {
    station: {
        id: 'chest-pain-001',
        title: 'Acute Chest Pain - Mr. Johnson',
        scenario: '65M presents with central crushing chest pain.',
        difficulty: 'Medium',
        timeAllowed: 10,
        timeTaken: 8.5,
    },
    result: {
        score: 72,
        grade: 'Pass',
        outcomeSummary: 'Safe and competent performance. Ideally would have ruled out aortic dissection earlier.',
        criticalFail: false,
    },
    globalCriticalErrors: [], // Empty means safe
    domains: {
        history: {
            score: { total: 10, obtained: 8, percentage: 80 },
            items: [
                { id: 'h1', text: 'Elicited location (Central)', status: 'Done', score: 1, maxScore: 1, isCritical: true },
                { id: 'h2', text: 'Character (Crushing/Heavy)', status: 'Done', score: 1, maxScore: 1, isCritical: false },
                { id: 'h3', text: 'Radiation (Left arm/jaw)', status: 'Done', score: 1, maxScore: 1, isCritical: false },
                { id: 'h4', text: 'Associated Sx (Sweating, nausea)', status: 'Done', score: 1, maxScore: 1, isCritical: false },
                { id: 'h5', text: 'Risk Factors (Smoking, HTN, DM)', status: 'Done', score: 1, maxScore: 1, isCritical: true },
                { id: 'h6', text: 'Family History of IHD', status: 'Missed', score: 0, maxScore: 1, isCritical: false, feedback: 'Important for risk stratification.' },
                { id: 'h7', text: 'Contraindications to thrombolysis', status: 'Partial', score: 0.5, maxScore: 1, isCritical: true, feedback: 'Asked about surgery but missed bleeding history.' },
            ],
        },
        examination: {
            score: { total: 5, obtained: 4, percentage: 80 },
            items: [
                { id: 'e1', text: 'General Appearance (Diaphoretic)', system: 'General', status: 'Done', score: 1, maxScore: 1, isCritical: true, correctlyIdentified: true },
                { id: 'e2', text: 'Pulse (Rate, Rhythm, Volume)', system: 'CVS', status: 'Done', score: 1, maxScore: 1, isCritical: true, correctlyIdentified: true },
                { id: 'e3', text: 'BP in both arms', system: 'CVS', status: 'Missed', score: 0, maxScore: 1, isCritical: true, correctlyIdentified: false, feedback: 'Essential to rule out Dissection.' },
                { id: 'e4', text: 'Heart Sounds (Murmurs)', system: 'CVS', status: 'Done', score: 1, maxScore: 1, isCritical: false, correctlyIdentified: true },
                { id: 'e5', text: 'Lung Bases (Crepitations)', system: 'Resp', status: 'Done', score: 1, maxScore: 1, isCritical: false, correctlyIdentified: true },
            ],
        },
        investigations: {
            score: { total: 5, obtained: 5, percentage: 100 },
            items: [
                { id: 'i1', name: 'ECG (12-lead)', type: 'Bedside', status: 'Ordered', appropriateness: 'Correct', cost: 50 },
                { id: 'i2', name: 'Troponin T', type: 'Lab', status: 'Ordered', appropriateness: 'Correct', cost: 80 },
                { id: 'i3', name: 'CXR', type: 'Imaging', status: 'Ordered', appropriateness: 'Correct', cost: 120 },
                { id: 'i4', name: 'D-Dimer', type: 'Lab', status: 'Not Indicated', appropriateness: 'Unnecessary', cost: 60 },
            ],
        },
        ddx: {
            score: { total: 5, obtained: 3, percentage: 60 },
            items: [
                { diagnosis: 'ACS (STEMI/NSTEMI)', isCorrect: true, isLifeThreatening: true, rank: 1, preData: true },
                { diagnosis: 'Aortic Dissection', isCorrect: true, isLifeThreatening: true, rank: 2, preData: false },
                { diagnosis: 'Gastroesophageal Reflux', isCorrect: false, isLifeThreatening: false, rank: 3, preData: true },
            ],
        },
        management: {
            score: { total: 5, obtained: 4, percentage: 80 },
            items: [
                { id: 'm1', text: 'Oxygen (if sats < 94%)', category: 'Pharm', status: 'Done', score: 1, maxScore: 1, isCritical: false },
                { id: 'm2', text: 'Aspirin 300mg', category: 'Pharm', status: 'Done', score: 1, maxScore: 1, isCritical: true },
                { id: 'm3', text: 'Nitrates (GTN)', category: 'Pharm', status: 'Done', score: 1, maxScore: 1, isCritical: false },
                { id: 'm4', text: 'Morphine + Antiemetic', category: 'Pharm', status: 'Missed', score: 0, maxScore: 1, isCritical: false, feedback: 'Patient was in severe pain.' },
                { id: 'm5', text: 'Refer to Cardiology', category: 'Disposition', status: 'Done', score: 1, maxScore: 1, isCritical: true },
            ],
        },
    },
    examinerComments: {
        strengths: [
            'Excellent structure to history taking.',
            'Correctly identified the high-risk nature of the presentation.',
            'Prompt ECG ordering.',
        ],
        weaknesses: [
            'Forgot to check BP in both arms - crucial for chest pain to exclude dissection.',
            'Did not offer sufficient analgesia despite patient distress.',
        ],
    },
    modelAnswer: {
        summary: 'This patient presented with classic features of an inferior myocardial infarction. The priority was to identify the STEMI on ECG and initiate ACS protocol immediately while considering differentials like dissection.',
        keyPoints: [
            'Always check BP in both arms in chest pain.',
            'Pain relief is not just humane, it reduces sympathetic drive.',
            'Time is muscle - rapid ECG is the single most important investigation.',
        ],
    },
};
