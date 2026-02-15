import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { User } from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get calendar events
router.get('/events', authenticateToken, async (req: any, res) => {
    try {
        const user = req.user;

        if (!user.googleAccessToken) {
            return res.status(400).json({
                error: 'No Google Calendar access. Please sign in with Google to grant calendar permissions.'
            });
        }

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        // Set credentials
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        // Handle token refresh
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                user.googleAccessToken = tokens.access_token;
                await user.save();
            }
        });

        // Create calendar API client
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Get time range from query params or default to current month
        const timeMin = req.query.timeMin || new Date(new Date().setDate(1)).toISOString();
        const timeMax = req.query.timeMax || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString();

        // Fetch events
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        // Format events for frontend
        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location || '',
            attendees: event.attendees?.map(a => a.email) || [],
            htmlLink: event.htmlLink,
            colorId: event.colorId,
            isAllDay: !event.start?.dateTime
        }));

        res.json({ events: formattedEvents });
    } catch (error: any) {
        console.error('Calendar API Error:', error);

        if (error.code === 401 || error.code === 403) {
            return res.status(401).json({
                error: 'Calendar access denied. Please re-authenticate with Google.'
            });
        }

        res.status(500).json({
            error: 'Failed to fetch calendar events',
            details: error.message
        });
    }
});

// Create calendar event
router.post('/events', authenticateToken, async (req: any, res) => {
    try {
        const user = req.user;
        const { title, description, start, end, location, attendees } = req.body;

        if (!user.googleAccessToken) {
            return res.status(400).json({
                error: 'No Google Calendar access. Please sign in with Google.'
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        // Handle token refresh
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                user.googleAccessToken = tokens.access_token;
                await user.save();
            }
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: title,
            description: description,
            start: { dateTime: start },
            end: { dateTime: end },
            location: location,
            attendees: attendees ? attendees.map((email: string) => ({ email })) : [],
            reminders: {
                useDefault: true,
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        res.status(201).json(response.data);
    } catch (error: any) {
        console.error('Create Event Error:', error);
        if (error.code === 401 || error.code === 403) {
            return res.status(401).json({
                error: 'Calendar access denied. Please re-authenticate.'
            });
        }
        res.status(500).json({
            error: 'Failed to create event',
            details: error.message
        });
    }
});

export default router;
