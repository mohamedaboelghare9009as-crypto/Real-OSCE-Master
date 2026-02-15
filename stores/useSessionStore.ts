import { create } from 'zustand';
import { Message, HistoryItem, VitalsData, LabPanel } from '../types';

interface SessionStore {
    currentPhase: 'history' | 'exam' | 'labs' | 'confirm';
    transcript: Message[];
    historyPoints: HistoryItem[];
    vitals: VitalsData;
    examResults: Record<string, string>;
    labResults: LabPanel[];
    timeRemaining: number;
    isRecording: boolean;

    // Actions
    setPhase: (phase: 'history' | 'exam' | 'labs' | 'confirm') => void;
    addMessage: (message: Message) => void;
    addHistoryPoint: (point: HistoryItem) => void;
    updateVitals: (vitals: Partial<VitalsData>) => void;
    setExamResult: (system: string, result: string) => void;
    addLabPanel: (panel: LabPanel) => void;
    setTimeRemaining: (time: number) => void;
    setRecording: (isRecording: boolean) => void;
    resetSession: (initialVitals: VitalsData) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
    currentPhase: 'history',
    transcript: [],
    historyPoints: [],
    vitals: {
        hr: 72,
        sbp: 120,
        dbp: 80,
        rr: 16,
        spo2: 98,
        temp: 37.0
    },
    examResults: {},
    labResults: [],
    timeRemaining: 900, // 15 mins
    isRecording: false,

    setPhase: (phase) => set({ currentPhase: phase }),
    addMessage: (message) => set((state) => ({ transcript: [...state.transcript, message] })),
    addHistoryPoint: (point) => set((state) => ({ historyPoints: [...state.historyPoints, point] })),
    updateVitals: (vitals) => set((state) => ({ vitals: { ...state.vitals, ...vitals } })),
    setExamResult: (system, result) => set((state) => ({
        examResults: { ...state.examResults, [system]: result }
    })),
    addLabPanel: (panel) => set((state) => ({ labResults: [...state.labResults, panel] })),
    setTimeRemaining: (time) => set({ timeRemaining: time }),
    setRecording: (isRecording) => set({ isRecording }),
    resetSession: (initialVitals) => set({
        currentPhase: 'history',
        transcript: [],
        historyPoints: [],
        vitals: initialVitals,
        examResults: {},
        labResults: [],
        timeRemaining: 900,
        isRecording: false,
    }),
}));
