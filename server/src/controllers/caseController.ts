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

export const getRandomCase = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?._id || (req.user as any)?.id || 'test-user-1';

        // 1. Get Random Case ID
        const rawCase = await caseEngineService.getRandomCase(req.body);
        if (!rawCase) throw new Error("No cases found matching criteria");

        const caseId = rawCase._id || rawCase.id || rawCase.case_metadata?.case_id;

        // 2. Wrap with Session (Reuse existing getCaseById logic)
        const result = await caseEngineService.getCaseWithSession(caseId.toString(), userId);

        // 3. V2 Mapping (Copied from getCaseById for consistency)
        const c = result.case as any;
        if (c.case_metadata && c.truth) {
            const v1Case = {
                id: c._id || c.case_metadata?.case_id || caseId,
                title: c.case_metadata?.title || "Unknown Case",
                specialty: c.case_metadata?.specialty || "General",
                difficulty: c.case_metadata?.difficulty || "Medium",
                description: c.case_metadata?.objective || c.case_metadata?.innovation_element || "V2 Case",
                chiefComplaint: c.truth?.history?.chief_complaint || "Undisclosed",
                vitals: c.truth?.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37 },
                patientName: c.truth?.demographics?.name || "Patient",
                patientAvatar: c.case_metadata?.patient_avatar || "",
                systemInstruction: c.scenario?.candidate_instructions || "",
                history: {
                    chiefComplaint: c.truth?.history?.chief_complaint || "Undisclosed",
                    description: c.truth?.history?.description || "Please elicit the history.",
                    hpi: typeof c.truth?.history === 'string' ? c.truth.history : JSON.stringify(c.truth?.history || {}),
                    pmh: c.truth?.past_medical_history || "",
                    medications: c.truth?.medications || "",
                    allergies: c.truth?.allergies || "",
                    socialHistory: typeof c.truth?.social_history === 'string' ? c.truth.social_history : JSON.stringify(c.truth?.social_history || ""),
                    familyHistory: c.truth?.family_history || "",
                    reviewOfSystems: ""
                },
                examination: {
                    generalAppearance: c.truth?.physical_exam?.general || "Patient appears comfortable.",
                    findings: [],
                    vitals: c.truth?.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37.0 }
                },
                investigations: { bedside: [], confirmatory: [] },
                management: { steps: [], diagnosis: c.truth?.final_diagnosis || "" },
                markingScheme: { checklist: [] },
                tags: c.case_metadata?.learning_objectives || []
            };
            result.case = v1Case;
        }

        res.json(result);
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

        if (!result || !result.case) {
            throw new Error("Case initialization failed");
        }

        // V2 MAPPING ADAPTER
        const c = result.case as any;
        if (c.case_metadata || c.truth) {
            console.log(`[CaseController] Adapting V2 Case ${caseId} to V1 for Frontend`);

            const demographics = c.truth?.demographics || {};
            const history = c.truth?.history || {};

            // Map V2 -> V1 (Ensure no undefined crashes)
            const v1Case = {
                id: c._id || (c as any).id || c.case_metadata?.case_id || caseId,
                title: c.case_metadata?.title || "Untitled Simulation",
                specialty: c.case_metadata?.specialty || "General",
                difficulty: c.case_metadata?.difficulty || "Medium",
                description: c.case_metadata?.objective || c.case_metadata?.innovation_element || "Clinical Case",
                chiefComplaint: history.chief_complaint || "Undisclosed",
                vitals: c.truth?.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37 },
                patientName: demographics.name || "Patient",
                patientAvatar: c.case_metadata?.patient_avatar || "",
                systemInstruction: c.scenario?.candidate_instructions || "",
                history: {
                    chiefComplaint: history.chief_complaint || "Undisclosed",
                    description: history.description || "Please elicit the history.",
                    hpi: typeof history === 'string' ? history : JSON.stringify(history || {}),
                    pmh: c.truth?.past_medical_history || "",
                    medications: c.truth?.medications || "",
                    allergies: c.truth?.allergies || "",
                    socialHistory: typeof c.truth?.social_history === 'string' ? c.truth.social_history : JSON.stringify(c.truth?.social_history || ""),
                    familyHistory: c.truth?.family_history || "", // Map to canonical name
                    reviewOfSystems: ""
                },
                examination: {
                    generalAppearance: c.truth?.physical_exam?.general || "Patient appears comfortable.",
                    findings: [],
                    vitals: c.truth?.physical_exam?.vitals || { hr: 70, bp: "120/80", rr: 16, spo2: 98, temp: 37.0 }
                },
                investigations: { bedside: [], confirmatory: [] },
                management: { steps: [], diagnosis: c.truth?.final_diagnosis || "" },
                markingScheme: { checklist: [] },
                tags: c.case_metadata?.learning_objectives || []
            };

            result.case = v1Case;
        }

        // Ensure session ID is exposed clearly
        const safeSession = {
            id: (result.session as any)._id || (result.session as any).id || `session-${Date.now()}`,
            currentStage: result.session.currentStage || 'History',
            completedStages: result.session.completedStages || []
        };

        res.json({
            case: result.case,
            session: safeSession
        });
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
