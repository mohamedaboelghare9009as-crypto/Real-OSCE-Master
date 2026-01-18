const API_URL = import.meta.env.VITE_API_URL || '';

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    location: string;
    attendees: string[];
    htmlLink: string;
    colorId?: string;
    isAllDay: boolean;
}

export const calendarService = {
    async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const params = new URLSearchParams();
        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);

        const response = await fetch(`${API_URL}/api/calendar/events?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch calendar events');
        }

        const data = await response.json();
        return data.events;
    },

    async createEvent(event: Partial<CalendarEvent>): Promise<any> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/calendar/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create event');
        }

        return await response.json();
    }
};
