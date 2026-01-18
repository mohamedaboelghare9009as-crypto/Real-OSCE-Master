import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reminder {
    id: string;
    title: string;
    time: string;
    completed: boolean;
}

export interface WeeklyGoal {
    target: number;
    completed: number;
}

interface DashboardStore {
    // Weekly Goal
    weeklyGoal: WeeklyGoal;
    setWeeklyGoal: (goal: Partial<WeeklyGoal>) => void;
    incrementCompleted: () => void;

    // Reminders
    reminders: Reminder[];
    addReminder: (title: string, time: string) => void;
    toggleReminder: (id: string) => void;
    deleteReminder: (id: string) => void;
    updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id'>>) => void;
}

export const useDashboardStore = create<DashboardStore>()(
    persist(
        (set) => ({
            // Weekly Goal State
            weeklyGoal: {
                target: 10,
                completed: 0,
            },

            setWeeklyGoal: (goal) =>
                set((state) => ({
                    weeklyGoal: { ...state.weeklyGoal, ...goal },
                })),

            incrementCompleted: () =>
                set((state) => ({
                    weeklyGoal: {
                        ...state.weeklyGoal,
                        completed: Math.min(state.weeklyGoal.completed + 1, state.weeklyGoal.target),
                    },
                })),

            // Reminders State
            reminders: [
                { id: '1', title: 'Review Cardiology basics', time: 'Today', completed: false },
                { id: '2', title: 'Practice patient history taking', time: 'Tomorrow', completed: false },
            ],

            addReminder: (title, time) =>
                set((state) => ({
                    reminders: [
                        ...state.reminders,
                        {
                            id: Date.now().toString(),
                            title,
                            time,
                            completed: false,
                        },
                    ],
                })),

            toggleReminder: (id) =>
                set((state) => ({
                    reminders: state.reminders.map((r) =>
                        r.id === id ? { ...r, completed: !r.completed } : r
                    ),
                })),

            deleteReminder: (id) =>
                set((state) => ({
                    reminders: state.reminders.filter((r) => r.id !== id),
                })),

            updateReminder: (id, updates) =>
                set((state) => ({
                    reminders: state.reminders.map((r) =>
                        r.id === id ? { ...r, ...updates } : r
                    ),
                })),
        }),
        {
            name: 'osce-dashboard-storage',
        }
    )
);
