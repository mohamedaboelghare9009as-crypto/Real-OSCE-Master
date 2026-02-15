import express from 'express';
import * as caseController from '../controllers/caseController';

const router = express.Router();

// GET /cases - Fetch list
router.get('/', caseController.getAllCases);

// GET /cases/:caseId - Fetch full masked case & session
router.get('/:caseId', caseController.getCaseById);

// GET /cases/:caseId/stage/:stageName - Fetch specific stage
router.get('/:caseId/stage/:stageName', caseController.getCaseStage);

// CREATE /cases
router.post('/', caseController.createCase);

// UPDATE /cases/:caseId
router.put('/:caseId', caseController.updateCase);

// DELETE /cases/:caseId
router.delete('/:caseId', caseController.deleteCase);

export default router;
