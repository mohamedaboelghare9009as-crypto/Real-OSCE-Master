import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, ExternalLink, AlertCircle, RefreshCw, Plus, X, CalendarDays, List, Filter } from 'lucide-react';
import { calendarService, CalendarEvent } from '../services/calendarService';
import GlassCard from '../components/ui/GlassCard';

const Calendar: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [showAddEvent, setShowAddEvent] = useState(false);

    // New Event State
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        location: '',
        attendees: ''
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, view]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const { timeMin, timeMax } = getTimeRange();
            const fetchedEvents = await calendarService.getEvents(timeMin, timeMax);
            setEvents(fetchedEvents);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const attendeesList = newEvent.attendees.split(',').map(e => e.trim()).filter(e => e);

            await calendarService.createEvent({
                title: newEvent.title,
                description: newEvent.description,
                start: new Date(newEvent.start).toISOString(),
                end: new Date(newEvent.end).toISOString(),
                location: newEvent.location,
                attendees: attendeesList
            });

            setShowAddEvent(false);
            setNewEvent({ title: '', description: '', start: '', end: '', location: '', attendees: '' });
            fetchEvents(); // Refresh events
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const getTimeRange = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        let timeMin: string;
        let timeMax: string;

        if (view === 'month') {
            timeMin = new Date(year, month, 1).toISOString();
            timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        } else {
            // Week View
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            timeMin = startOfWeek.toISOString();

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            timeMax = endOfWeek.toISOString();
        }

        return { timeMin, timeMax };
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days in the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getEventsForDate = (date: Date | null) => {
        if (!date) return [];
        return events.filter(event => {
            const eventStart = new Date(event.start);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    // Helper to check if same day
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    // Render Logic
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekRange = view === 'week'
        ? `${getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDays()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : '';

    const displayDate = view === 'month' ? monthName : weekRange;
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        My Calendar
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your schedule and clinical rotations</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddEvent(true)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Event</span>
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Unable to load calendar</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        {error.includes('sign in with Google') && (
                            <p className="text-red-600 text-sm mt-2 font-medium">
                                Action Required: Please log out and sign in again with Google to grant calendar permissions.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={fetchEvents}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calendar View Controls & Grid */}
                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="flex flex-col h-full min-h-[600px]">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setView('month')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => setView('week')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Week
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                <h2 className="text-xl font-bold text-slate-900 min-w-[200px] text-center">
                                    {displayDate}
                                </h2>
                                <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                            >
                                Today
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-500">Syncing with Google Calendar...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Days Header */}
                                <div className="grid grid-cols-7 mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center font-semibold text-slate-400 text-xs uppercase tracking-wider py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month View Grid */}
                                {view === 'month' && (
                                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 flex-1">
                                        {getDaysInMonth().map((day, index) => {
                                            const dayEvents = getEventsForDate(day);
                                            const isToday = day && isSameDay(day, new Date());
                                            const isSelected = selectedDate && day && isSameDay(day, selectedDate);

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => day && setSelectedDate(day)}
                                                    disabled={!day}
                                                    className={`
                                                        min-h-[100px] p-2 text-left transition-colors relative group
                                                        ${!day ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}
                                                        ${isSelected ? 'ring-2 ring-inset ring-emerald-500 z-10' : ''}
                                                    `}
                                                >
                                                    {day && (
                                                        <div className="flex flex-col h-full">
                                                            <span className={`
                                                                w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                                                                ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-700'}
                                                            `}>
                                                                {day.getDate()}
                                                            </span>
                                                            <div className="flex-1 space-y-1 overflow-hidden">
                                                                {dayEvents.slice(0, 3).map(event => (
                                                                    <div
                                                                        key={event.id}
                                                                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${event.isAllDay
                                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                                : 'bg-blue-50 text-blue-700'
                                                                            }`}
                                                                    >
                                                                        {event.title}
                                                                    </div>
                                                                ))}
                                                                {dayEvents.length > 3 && (
                                                                    <div className="text-[10px] text-slate-400 pl-1">
                                                                        +{dayEvents.length - 3} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Week View Grid */}
                                {view === 'week' && (
                                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 flex-1">
                                        {getWeekDays().map((day, index) => {
                                            const dayEvents = getEventsForDate(day);
                                            const isToday = isSameDay(day, new Date());
                                            const isSelected = selectedDate && isSameDay(day, selectedDate);

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`
                                                        min-h-[400px] p-2 text-left transition-colors relative group bg-white
                                                        ${isSelected ? 'ring-2 ring-inset ring-emerald-500 z-10' : 'hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex flex-col items-center mb-4 pb-2 border-b border-slate-100">
                                                            <span className="text-xs text-slate-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                            <span className={`
                                                                w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold mt-1
                                                                ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-900'}
                                                            `}>
                                                                {day.getDate()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 space-y-2 overflow-y-auto">
                                                            {dayEvents.map(event => (
                                                                <div
                                                                    key={event.id}
                                                                    className={`p-2 rounded-lg border text-xs ${event.isAllDay
                                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                                                            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className="font-bold truncate">{event.title}</div>
                                                                    {!event.isAllDay && (
                                                                        <div className="text-[10px] opacity-75 mt-0.5">
                                                                            {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar Details */}
                <div className="lg:col-span-4">
                    <GlassCard className="h-full max-h-[calc(100vh-140px)] flex flex-col sticky top-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-emerald-500" />
                                {selectedDate ? formatDate(selectedDate.toISOString()) : 'Select a date'}
                            </h3>
                        </div>

                        {selectedDate && selectedEvents.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No events scheduled for this day</p>
                                <button
                                    onClick={() => setShowAddEvent(true)}
                                    className="mt-4 text-emerald-600 text-sm font-medium hover:underline"
                                >
                                    + Add Event
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                                {selectedEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-slate-900 flex-1">{event.title}</h4>
                                            {event.htmlLink && (
                                                <a
                                                    href={event.htmlLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-600">
                                            {!event.isAllDay && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-emerald-500/70" />
                                                    <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                                                </div>
                                            )}

                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-emerald-500/70" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}

                                            {event.attendees.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-emerald-500/70" />
                                                    <span>{event.attendees.length} people</span>
                                                </div>
                                            )}

                                            {event.description && (
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 pl-6 border-l-2 border-slate-200">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowAddEvent(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Add New Event</h2>
                        </div>

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Event Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g., Clinical Rotation"
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Start Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.start}
                                        onChange={e => setNewEvent({ ...newEvent, start: e.target.value })}
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">End Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.end}
                                        onChange={e => setNewEvent({ ...newEvent, end: e.target.value })}
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Location (Optional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="Add location"
                                        className="w-full h-12 rounded-xl border border-slate-200 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add details"
                                    className="w-full h-24 rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Attendees (Optional, comma separated)</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={newEvent.attendees}
                                        onChange={e => setNewEvent({ ...newEvent, attendees: e.target.value })}
                                        placeholder="email@example.com, peer@example.com"
                                        className="w-full h-12 rounded-xl border border-slate-200 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Event'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
