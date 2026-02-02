
import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';

const notifications = [
    {
        id: 1,
        title: 'Station Feedback Available',
        message: 'Dr. Mitchell has graded your Cardiology submission. Score: 85%',
        time: '2 hours ago',
        type: 'success',
        read: false,
    },
    {
        id: 2,
        title: 'New Module Unlocked',
        message: 'The Advanced Respiratory module is now available for practice.',
        time: '1 day ago',
        type: 'info',
        read: false,
    },
    {
        id: 3,
        title: 'Session Reminder',
        message: 'Group Practice Session starts in 30 minutes.',
        time: 'Yesterday',
        type: 'warning',
        read: true,
    }
];

export const NotificationsPage = () => {
    return (
        <div className="px-6 py-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                        <p className="text-muted-foreground">Stay updated with your progress and system alerts.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`glass-card p-4 flex gap-4 transition-all bg-card border rounded-xl shadow-sm hover:shadow-md ${!notif.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-80 border-border'
                            }`}
                    >
                        <div className="flex-shrink-0 mt-1">
                            {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-osce-blue" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {notif.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-start justify-between">
                                <h3 className={`font-semibold text-foreground ${!notif.read ? 'text-lg' : ''}`}>{notif.title}</h3>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                    <Clock className="w-3 h-3" /> {notif.time}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm">{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
