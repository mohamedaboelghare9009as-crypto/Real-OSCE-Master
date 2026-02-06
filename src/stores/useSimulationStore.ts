import { create } from 'zustand';
import { ExamFinding, Investigation } from '../../services/simulationData';

export type Phase = 'History' | 'Examination' | 'Investigation' | 'Management' | 'Feedback';

export interface DDxItem {
    id: string;
    text: string;
    rank: number;
}

export interface SimulationState {
    currentPhase: Phase;
    unlockedPhases: Phase[];

    // DDx State
    currentDDx: DDxItem[];
    ddxVersions: Record<string, DDxItem[]>; // Keyed by phase name e.g., 'Post-History'
    isDDxLocked: boolean;

    // Data State
    transcript: { sender: 'doctor' | 'patient' | 'system', text: string, time: string }[];
    performedExams: ExamFinding[];
    orderedInvestigations: Investigation[];
    finalDiagnosis: string | null;
    managementPlan: {
        meds: string;
        nonPharma: string;
        followUp: string;
    };

    // Actions
    setPhase: (phase: Phase) => void;
    unlockPhase: (phase: Phase) => void;
    addDDxItem: (text: string) => void;
    updateDDxOrder: (items: DDxItem[]) => void;
    saveDDxVersion: (label: string) => void;
    performExam: (exam: ExamFinding) => void;
    orderInvestigation: (test: Investigation) => void;
    setFinalDiagnosis: (diagnosis: string) => void;
    updateManagement: (field: string, value: string) => void;
    addTranscriptMessage: (sender: 'doctor' | 'patient' | 'system', text: string) => void;
    completeSimulation: () => void;
}

const PHASES_ORDER: Phase[] = ['History', 'Examination', 'Investigation', 'Management', 'Feedback'];

export const useSimulationStore = create<SimulationState>((set, get) => ({
    currentPhase: 'History',
    unlockedPhases: ['History'],

    currentDDx: [],
    ddxVersions: {},
    isDDxLocked: false,

    transcript: [{ sender: 'system', text: 'Session Started', time: '00:00' }],
    performedExams: [],
    orderedInvestigations: [],
    finalDiagnosis: null,
    managementPlan: { meds: '', nonPharma: '', followUp: '' },

    setPhase: (phase) => {
        const { unlockedPhases } = get();
        if (unlockedPhases.includes(phase)) {
            set({ currentPhase: phase });
        }
    },

    unlockPhase: (phase) => {
        set((state) => {
            if (!state.unlockedPhases.includes(phase)) {
                return { unlockedPhases: [...state.unlockedPhases, phase] };
            }
            return state;
        });
    },

    addDDxItem: (text) => {
        set((state) => ({
            currentDDx: [
                ...state.currentDDx,
                { id: Date.now().toString(), text, rank: state.currentDDx.length + 1 }
            ]
        }));
    },

    updateDDxOrder: (items) => {
        set({ currentDDx: items.map((item, index) => ({ ...item, rank: index + 1 })) });
    },

    saveDDxVersion: (label) => {
        const { currentDDx } = get();
        set((state) => ({
            ddxVersions: { ...state.ddxVersions, [label]: [...currentDDx] }
        }));
    },

    performExam: (exam) => {
        set((state) => {
            if (state.performedExams.find(e => e.id === exam.id)) return state;
            return { performedExams: [...state.performedExams, exam] };
        });
    },

    orderInvestigation: (test) => {
        set((state) => {
            if (state.orderedInvestigations.find(t => t.id === test.id)) return state;
            return { orderedInvestigations: [...state.orderedInvestigations, test] };
        });
    },

    setFinalDiagnosis: (diagnosis) => set({ finalDiagnosis: diagnosis }),

    updateManagement: (field, value) => {
        set((state) => ({
            managementPlan: { ...state.managementPlan, [field]: value }
        }));
    },

    addTranscriptMessage: (sender, text) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        set((state) => ({
            transcript: [...state.transcript, { sender, text, time }]
        }));
    },

    completeSimulation: () => {
        set((state) => {
            const nextUnlocked: Phase[] = state.unlockedPhases.includes('Feedback')
                ? state.unlockedPhases
                : [...state.unlockedPhases, 'Feedback'];
            return {
                ...state,
                currentPhase: 'Feedback',
                unlockedPhases: nextUnlocked
            };
        });
    }
}));
