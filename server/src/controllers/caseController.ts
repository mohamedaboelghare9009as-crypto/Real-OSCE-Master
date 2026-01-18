import { Request, Response } from 'express';
import { caseEngineService } from '../services/caseEngineService';
import { MOCK_CASE, MOCK_CASE_ID } from '../data/mockCase';
import { sessionService } from '../services/sessionService';

export const getAllCases = async (req: Request, res: Response) => {
    try {
        const cases = await caseEngineService.getAllCases();
        res.json(cases);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCaseById = async (req: Request, res: Response) => {
    try {
        const { caseId } = req.params;

        // MOCK CASE & V2 MAPPING LOGIC
        if (caseId === MOCK_CASE_ID) {
            // ... mock case logic ...
            console.log('[CaseController] Serving MOCK CASE for testing');
            const mockUserId = (req.user as any)?.id || 'mock-user-demo';
            const session = await sessionService.createSession(mockUserId, caseId);

            return res.json({
                case: {
                    id: MOCK_CASE.metadata.id,
                    title: MOCK_CASE.metadata.title,
                    specialty: MOCK_CASE.metadata.specialty,
                    difficulty: MOCK_CASE.metadata.difficulty,
                    description: MOCK_CASE.metadata.description,
                    chiefComplaint: MOCK_CASE.history.chiefComplaint,
                    vitals: MOCK_CASE.examination.vitals,
                    patientName: 'John Smith',
                    patientAvatar: '',
                    systemInstruction: MOCK_CASE.history.description || "You are a patient.",
                    history: MOCK_CASE.history,
                    examination: MOCK_CASE.examination,
                    investigations: MOCK_CASE.investigations,
                    tags: MOCK_CASE.metadata.tags
                },
                session: {
                    id: (session as any)._id || (session as any).id || 'mock-session-fallback',
                    currentStage: session.currentStage,
                    completedStages: session.completedStages
                }
            });
        }

        const userId = (req.user as any)?._id || (req.user as any)?.id || 'test-user-1';

        // Use getCaseWithSession which likely calls caseService.getCaseById internally or we should handle mapping here if getCaseWithSession relies on caseService.
        // Actually caseEngineService.getCaseWithSession is what is called. Let's check that service if possible, or just hack it here first. 
        // Wait, the original code used caseEngineService. Let me check if I can modify that or if I should modify the result here.
        // It's cleaner to modify the result here if caseEngineService just returns { case, session }.

        const result = await caseEngineService.getCaseWithSession(caseId, userId);

        // V2 MAPPING ADAPTER
        const c = result.case as any;
        if (c.case_metadata && c.truth) {
            console.log(`[CaseController] Adapting V2 Case ${caseId} to V1 for Frontend`);

            // Map V2 -> V1
            const v1Case = {
                id: c._id || c.case_metadata.case_id,
                title: c.case_metadata.title,
                specialty: c.case_metadata.specialty,
                difficulty: c.case_metadata.difficulty,
                description: c.case_metadata.objective || c.case_metadata.innovation_element,
                chiefComplaint: c.truth.history.chief_complaint,
                vitals: c.truth.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37 }, // Fallback if missing
                patientName: "Patient (V2)", // or derive from demographics
                patientAvatar: "",
                // CRITIAL: System Instruction for the frontend "systemInstruction" field which usually goes to the LLM? 
                // Actually the backend constructs the prompt. This might be used for display or fallback.
                systemInstruction: c.scenario.candidate_instructions,
                history: {
                    chiefComplaint: c.truth.history.chief_complaint,
                    description: "Please elicit the history.",
                    hpi: JSON.stringify(c.truth.history),
                    // Missing fields required by HistorySection interface
                    pmh: c.truth.past_medical_history || "",
                    medications: c.truth.medications || "",
                    allergies: c.truth.allergies || "",
                    socialHistory: typeof c.truth.social_history === 'string' ? c.truth.social_history : JSON.stringify(c.truth.social_history || ""),
                    familyHistory: c.truth.family_history || "",
                    reviewOfSystems: ""
                },
                examination: {
                    generalAppearance: c.truth.physical_exam?.general || "Patient appears comfortable.",
                    findings: [],
                    vitals: c.truth.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37.0 }
                },
                investigations: {
                    bedside: [],
                    confirmatory: []
                },
                management: {
                    steps: [],
                    diagnosis: c.truth.final_diagnosis || ""
                },
                markingScheme: {
                    checklist: []
                },
                tags: c.case_metadata.learning_objectives
            };

            result.case = v1Case;
        }

        res.json(result);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

export const getCaseStage = async (req: Request, res: Response) => {
    try {
        const { caseId, stageName } = req.params;
        const userId = (req.user as any)?._id || (req.user as any)?.id || 'test-user-1';

        // Use the advance logic to allow progression
        const result = await caseEngineService.advanceAndGetStage(caseId, userId, stageName);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// --- CRUD Endpoints ---

export const createCase = async (req: Request, res: Response) => {
    try {
        const newCase = await caseEngineService.createCase(req.body);
        res.status(201).json(newCase);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCase = async (req: Request, res: Response) => {
    try {
        const { caseId } = req.params;
        const updated = await caseEngineService.updateCase(caseId, req.body);
        if (!updated) return res.status(404).json({ error: 'Case not found' });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCase = async (req: Request, res: Response) => {
    try {
        const { caseId } = req.params;
        const success = await caseEngineService.deleteCase(caseId);
        if (!success) return res.status(404).json({ error: 'Case not found' });
        res.json({ message: 'Case deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
