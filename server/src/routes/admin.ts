import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret-key';

// Middleware to verify admin access
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };

        // Check if user is admin (by email or role)
        const adminEmail = process.env.VITE_ADMIN_EMAIL;
        if (adminEmail && decoded.email !== adminEmail) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error: any) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all users from MongoDB
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const userList = users.map(u => ({
            id: u._id,
            email: u.email,
            role: u.role || 'user',
            status: 'active',
            joined: new Date(u.createdAt).toLocaleDateString()
        }));

        res.json({ users: userList });
    } catch (e: any) {
        console.error('List users error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
