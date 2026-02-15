import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
    link?: string;
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [
                {
                    id: '1',
                    title: 'Welcome to OSCE Master',
                    message: 'Start your first simulation to improve your clinical skills.',
                    type: 'success',
                    read: false,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'New Case Available',
                    message: 'A new cardiology case "Chest Pain in 45M" has been added.',
                    type: 'info',
                    read: false,
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                }
            ],
            unreadCount: 2,

            addNotification: (notification) => {
                const newNotification: Notification = {
                    id: Date.now().toString(),
                    read: false,
                    createdAt: new Date().toISOString(),
                    ...notification,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: (id) => {
                set((state) => {
                    const notification = state.notifications.find(n => n.id === id);
                    if (notification && !notification.read) {
                        return {
                            notifications: state.notifications.map((n) =>
                                n.id === id ? { ...n, read: true } : n
                            ),
                            unreadCount: Math.max(0, state.unreadCount - 1),
                        };
                    }
                    return state;
                });
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                    unreadCount: 0,
                }));
            },

            clearNotifications: () => {
                set({ notifications: [], unreadCount: 0 });
            },
        }),
        {
            name: 'osce-notification-storage',
        }
    )
);
