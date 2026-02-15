import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

export const initializePassport = () => {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
        console.warn('[Passport] Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Check .env file.');
        console.log('ClientID present:', !!clientID);
        console.log('ClientSecret present:', !!clientSecret);
        return;
    }

    passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile: Profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }

            let isNewUser = false;
            // Find or create user
            let user = await User.findOne({ email });
            const isAdmin = email === process.env.VITE_ADMIN_EMAIL;
            const targetRole = isAdmin ? 'admin' : 'Student';

            if (!user) {
                isNewUser = true;
                user = new User({
                    email,
                    password: Math.random().toString(36).slice(-16), // Random password for OAuth users
                    fullName: profile.displayName || '',
                    role: targetRole,
                    plan: 'Free',
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken
                });
                await user.save();
            } else {
                // Update tokens & Role (auto-promote if env var changes)
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken;
                if (isAdmin && user.role !== 'admin') {
                    user.role = 'admin';
                    console.log(`[Auth] Promoted ${email} to Admin`);
                }
                await user.save();
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return done(null, { user, token, isNewUser });
        } catch (error) {
            return done(error as Error);
        }
    }));

    passport.serializeUser((user: any, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: any, done) => {
        done(null, user);
    });

    console.log('[Passport] Google OAuth strategy initialized');
};

export default passport;
