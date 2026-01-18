import { Case } from '../models/Case';
import { MOCK_CASE, MOCK_CASE_ID, MOCK_CASE_V2 } from '../data/mockCase';
import { OsceCase, CaseMetadata, OsceCaseV2 } from '../schemas/caseSchema';

export class CaseService {

    // Get a random case from the DB matching criteria
    async getRandomCase(args: any) {
        if (args.mockMode) return MOCK_CASE;

        console.log(`[CaseService] Fetching random case for:`, args);

        const matchStage: any = {};

        // Filter by Specialty if provided
        if (args.specialty && args.specialty !== 'Random') {
            // Support both V1 and V2 locations
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

        try {
            const pipeline: any[] = [
                { $match: matchStage },
                { $sample: { size: 1 } }
            ];

            const result = await Case.aggregate(pipeline);

            if (result.length === 0) {
                // Fallback: If no match found (e.g. strict filters), try looser filters or return any random case
                console.warn("[CaseService] No case matched criteria, fetching truly random case.");
                const fallback = await Case.aggregate([{ $sample: { size: 1 } }]);
                if (fallback.length === 0) {
                    throw new Error("Case Library is empty.");
                }
                return fallback[0];
            }

            return result[0];

        } catch (e: any) {
            console.error("Case Retrieval Failed:", e);
            throw new Error(`Failed to fetch case: ${e.message}`);
        }
    }

    async getCaseById(caseId: string): Promise<OsceCase | OsceCaseV2 | null> {
        // Mock Check - Return V2 format for deterministic pipeline
        if (caseId === MOCK_CASE_ID) {
            console.log('[CaseService] Returning V2 Mock Case for deterministic pipeline');
            return MOCK_CASE_V2;
        }

        try {
            // 1. Try finding by custom V2 Case ID first (PS_MD_001)
            let result = await Case.findOne({ 'case_metadata.case_id': caseId }).lean();

            // 2. If not found, try MongoDB ObjectId
            if (!result) {
                // Only try if it looks like a valid ObjectId to avoid CastErrors
                if (caseId.match(/^[0-9a-fA-F]{24}$/)) {
                    result = await Case.findById(caseId).lean();
                }
            }

            if (result) return result as OsceCase | OsceCaseV2;
        } catch (e) {
            console.warn(`[CaseService] DB Error fetching case ${caseId}. Returning mock if debugging.`);
        }

        // Fallback for debugging if DB is purely offline and we want to force work
        // return MOCK_CASE; 
        return null;
    }

    async getAllCases(): Promise<CaseMetadata[]> {
        try {
            // Fetch metadata from V1 or case_metadata from V2
            const cases = await Case.find({}, 'metadata case_metadata').lean();
            return cases.map((c: any) => {
                if (c.case_metadata) {
                    // Map V2 to V1 Metadata
                    return {
                        id: c._id.toString(),
                        title: c.case_metadata.title,
                        specialty: c.case_metadata.specialty,
                        difficulty: c.case_metadata.difficulty,
                        description: c.case_metadata.innovation_element || "V2 Case",
                        tags: c.case_metadata.learning_objectives || []
                    } as CaseMetadata;
                }
                // V1
                return { ...c.metadata, id: c._id.toString() };
            });
        } catch (e) {
            console.warn("[CaseService] DB Error fetching cases. Returning mock list.");
            return [MOCK_CASE.metadata];
        }
    }
}

export const caseService = new CaseService();
