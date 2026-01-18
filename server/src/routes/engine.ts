import express from 'express';
import { mcpLayer } from '../mcp';

const router = express.Router();

router.post('/interact', async (req, res) => {
    try {
        const { userId, caseId, message, sessionId } = req.body;
        // User ID fallback
        const uid = userId || 'test-user-1';

        const response = await mcpLayer.processUserRequest(uid, caseId, message, sessionId);
        res.json(response);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/tools', (req, res) => {
    res.json(mcpLayer.getToolDefinitions());
});

export default router;
