import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

/**
 * DEV MODE: Bypass Authentication
 * Creates a test user token without requiring login
 */
router.post('/dev-login', async (req, res) => {
    try {
        console.log('[Auth] DEV MODE: Creating test user session');

        // Create a test user token
        const testUser = {
            userId: 'dev-test-user-001',
            email: 'test@osce.dev',
            fullName: 'Test Student',
            role: 'student',
            plan: 'premium'
        };

        // Generate JWT
        const token = jwt.sign(
            { userId: testUser.userId, email: testUser.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: testUser,
            message: 'DEV MODE: Authentication bypassed'
        });

    } catch (error: any) {
        console.error('Dev login error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DEV MODE: Get current dev user
 */
router.get('/dev-me', async (req, res) => {
    try {
        const testUser = {
            id: 'dev-test-user-001',
            email: 'test@osce.dev',
            fullName: 'Test Student',
            role: 'student',
            plan: 'premium'
        };

        res.json(testUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
