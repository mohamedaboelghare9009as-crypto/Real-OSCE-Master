import { Case } from '../models/Case';
import { MOCK_CASE, MOCK_CASE_ID, MOCK_CASE_V2 } from '../data/mockCase';
import { OsceCase, CaseMetadata, OsceCaseV2 } from '../schemas/caseSchema';
import { caseCacheService } from './caseCacheService';

export class CaseService {

    // Get a random case from the DB matching criteria
    async getRandomCase(args: any) {
        console.log(`[CaseService] Requesting random case. Mock Mode: ${!!args.mockMode}`);

        // If not in strict mock mode, try DB first
        if (!args.mockMode) {
            try {
                const matchStage: any = {};

                // Filter by Specialty if provided
                if (args.specialty && args.specialty !== 'Random') {
                    matchStage['$or'] = [
                        { 'metadata.specialty': args.specialty },
                        { 'case_metadata.specialty': args.specialty }
                    ];
                }

                // Filter by Difficulty if provided
                if (args.difficulty && args.difficulty !== 'Random') {
                    matchStage['$or'] = [
                        { 'metadata.difficulty': args.difficulty },
                        { 'case_metadata.difficulty': args.difficulty }
                    ];
                }

                const pipeline: any[] = [
                    { $match: matchStage },
                    { $sample: { size: 1 } }
                ];

                const result = await Case.aggregate(pipeline);

                if (result.length > 0) {
                    console.log(`[CaseService] Found case in DB: ${result[0]._id}`);
                    return this.ensureV2Format(result[0]);
                }

                console.warn("[CaseService] No case matched criteria in DB, trying truly random fallback.");
                const fallback = await Case.aggregate([{ $sample: { size: 1 } }]);
                if (fallback.length > 0) return this.ensureV2Format(fallback[0]);

            } catch (e: any) {
                console.error("[CaseService] DB Error in getRandomCase:", e.message);
                // Fall through to mock logic
            }
        }

        // --- MOCK FALLBACK ---
        console.log('[CaseService] Returning MOCK_CASE as fallback');
        return MOCK_CASE_V2;
    }

    async getCaseById(caseId: string, sessionId?: string): Promise<OsceCase | OsceCaseV2 | null> {
        // Mock Check - Return V2 format for deterministic pipeline
        if (caseId === MOCK_CASE_ID || caseId === 'default-case' || caseId === 'test-session-case') {
            console.log('[CaseService] Returning V2 Mock Case for deterministic pipeline');
            return MOCK_CASE_V2;
        }

        // ===== CACHE LAYER =====
        const cachedCase = caseCacheService.get(caseId, sessionId);
        if (cachedCase) {
            console.log(`[CaseService] Returning cached case: ${caseId}`);
            return cachedCase;
        }

        // ===== DATABASE LAYER =====
        try {
            // 1. Try finding by custom V2 Case ID first (PS_MD_001)
            let result = await Case.findOne({ 'case_metadata.case_id': caseId }).lean();

            // 2. If not found, try MongoDB ObjectId
            if (!result && caseId.match(/^[0-9a-fA-F]{24}$/)) {
                result = await Case.findById(caseId).lean();
            }

            if (result) {
                const caseData = this.ensureV2Format(result);
                caseCacheService.set(caseId, caseData, sessionId);
                console.log(`[CaseService] Case ${caseId} fetched from DB and cached (Adapted to V2 if needed)`);
                return caseData;
            }
        } catch (e: any) {
            console.warn(`[CaseService] DB Error fetching case ${caseId}:`, e.message);
        }

        return null;
    }

    async getAllCases(): Promise<CaseMetadata[]> {
        try {
            const cases = await Case.find({}, 'metadata case_metadata').lean();
            if (cases.length > 0) {
                return cases.map((c: any) => {
                    if (c.case_metadata) {
                        return {
                            id: c._id.toString(),
                            title: c.case_metadata.title,
                            specialty: c.case_metadata.specialty,
                            difficulty: c.case_metadata.difficulty,
                            description: c.case_metadata.innovation_element || "V2 Case",
                            tags: c.case_metadata.learning_objectives || []
                        } as CaseMetadata;
                    }
                    return { ...c.metadata, id: c._id.toString() };
                });
            }
        } catch (e: any) {
            console.warn("[CaseService] DB Error in getAllCases:", e.message);
        }

        // Mock Fallback
        return [MOCK_CASE.metadata];
    }

    /**
     * COMPATIBILITY LAYER: Converts V1 schema to V2 on-the-fly
     */
    private ensureV2Format(data: any): OsceCaseV2 {
        if (data.truth) return data as OsceCaseV2;

        console.log(`[CaseService] Adapting V1 case "${data.metadata?.title || 'Unknown'}" to V2 format`);

        // Map V1 to V2
        return {
            case_metadata: {
                case_id: (data._id || data.id || 'unknown').toString(),
                title: data.metadata?.title || "Untitled Case",
                specialty: data.metadata?.specialty || "General",
                difficulty: data.metadata?.difficulty || "Medium",
                expected_duration_minutes: 15,
                innovation_element: data.metadata?.description || "",
                learning_objectives: data.metadata?.tags || []
            },
            scenario: {
                station_type: "History & Examination",
                candidate_instructions: data.history?.description || "Perform a full history.",
                osce_stages: ["History", "Examination", "Investigations"]
            },
            truth: {
                demographics: {
                    age: data.history?.age || 45,
                    sex: data.history?.sex ||
                        (data.history?.description?.toLowerCase().includes('male') || data.history?.description?.toLowerCase().includes('man') ? 'Male' :
                            (data.history?.description?.toLowerCase().includes('female') || data.history?.description?.toLowerCase().includes('woman') ? 'Female' :
                                (data.metadata?.description?.toLowerCase().includes('male') || data.metadata?.description?.toLowerCase().includes('man') ? 'Male' : 'Female'))),
                    occupation: data.history?.occupation || "Unknown"
                },
                voice_persona: {
                    flow: 1.0,
                    frequency: 0.0,
                    tone: (data.truth?.emotional_state || "Normal") as any
                },
                final_diagnosis: data.management?.diagnosis || "Unknown",
                history: {
                    chief_complaint: data.history?.chiefComplaint || "",
                    onset: "Gradual",
                    duration: "A few days",
                    associated_symptoms: [],
                    risk_factors: [],
                    description: data.history?.hpi || "", // Add history_of_present_illness content to description for fallback
                },
                past_medical_history: data.history?.pmh || "",
                medications: data.history?.medications || "",
                allergies: data.history?.allergies || "",
                social_history: data.history?.socialHistory || "",
                family_history: data.history?.familyHistory || "",
                physical_exam: {
                    general: data.examination?.generalAppearance || "",
                    vitals: data.examination?.vitals || {}
                },
                investigations: {
                    bedside: data.investigations?.bedside || [],
                    confirmatory: data.investigations?.confirmatory || []
                }
            },
            ddx_map: {},
            marking_scheme: data.marking_scheme || data.markingScheme || {}
        };
    }
}

export const caseService = new CaseService();
