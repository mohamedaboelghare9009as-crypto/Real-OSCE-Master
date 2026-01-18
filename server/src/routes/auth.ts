import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { User } from '../models/User';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';
const JWT_EXPIRES_IN = '7d';

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Create user
        const user = new User({ email, password, fullName });
        await user.save();

        // Generate JWT
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                plan: user.plan
            }
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        console.log(`[Auth] Login attempt for: ${email}`);

        if (!user) {
            console.log(`[Auth] User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log(`[Auth] User found: ${user._id}`);

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log(`[Auth] Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                plan: user.plan
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            plan: user.plan
        });
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth - Redirect to Google
router.get('/google', (req, res, next) => {
    // Store the calling origin (frontend URL) in the session
    const referrer = req.headers.referer;
    const origin = req.query.origin as string;

    // Prioritize query param, then referrer, then default
    let returnTo = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (origin) {
        returnTo = origin;
    } else if (referrer) {
        // Extract base URL from referrer (e.g., http://localhost:3003)
        try {
            const url = new URL(referrer);
            returnTo = `${url.protocol}//${url.host}`;
        } catch (e) {
            console.warn(`[Auth] Failed to parse referrer: ${referrer}`);
        }
    }

    // Save to session
    // @ts-ignore - Adding custom property to session
    req.session.returnTo = returnTo;
    console.log(`[Auth] Client starting login from: ${returnTo}`);

    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
        accessType: 'offline',
        prompt: 'consent'
    })(req, res, next);
});

// Google OAuth - Callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: any, data: any) => {
        // Retrieve dynamic redirect URL from session
        // @ts-ignore
        const clientUrl = req.session.returnTo || process.env.FRONTEND_URL || 'http://localhost:5173';

        if (err || !data) {
            console.error('Google Auth Callback Error:', err);
            return res.redirect(`${clientUrl}/#/auth?error=google_auth_failed`);
        }

        // Redirect to frontend with token
        const { token, user, isNewUser } = data;
        res.redirect(`${clientUrl}/#/auth/callback?token=${token}${isNewUser ? '&isNewUser=true' : ''}`);
    })(req, res, next);
});

export default router;
