import { STAGE_CONFIGS } from '../schemas/mcpSchema';
import { OsceCase, OsceCaseV2 } from '../../schemas/caseSchema';
import { sessionService } from '../../services/sessionService';
import { caseService } from '../../services/caseService';

export class ContextBuilder {

    async buildContext(caseId: string, userId: string): Promise<string> {
        // 1. Fetch Session & Case
        const session = await sessionService.findActiveSession(userId, caseId);
        if (!session) throw new Error("Session not found");

        const fullCase = await caseService.getCaseById(caseId);
        if (!fullCase) throw new Error("Case not found");

        const stage = session.currentStage;
        const config = STAGE_CONFIGS[stage];

        if (!config) throw new Error("Invalid stage configuration");

        // CHECK IF V2 CASE
        const isV2 = (fullCase as any).truth !== undefined;

        let safeData: any;
        let instructions = "";

        if (isV2) {
            const v2 = fullCase as unknown as OsceCaseV2;
            safeData = this.filterDataV2(v2, stage);
            instructions = v2.scenario.candidate_instructions; // Or derive specific patient instructions if available in truth
            // Fallback: If candidate instructions are for the candidate, we need PATIENT instructions.
            // Usually in V2, "truth" contains the patient persona.
            // Let's assume the LLM acts as the patient defined in 'truth'.
        } else {
            // V1 Logic
            const v1 = fullCase as OsceCase;
            safeData = this.filterData(v1, config.allowedFields, stage);
            instructions = "Act as the patient described in the case.";
        }

        // 3. Construct System Prompt
        return `
You are an OSCE Examiner/Patient Engine.
Current Stage: ${stage}
Allowed Actions: ${config.allowedTools.join(', ')}

CASE TRUTH (STRICTLY CONFIDENTIAL - DO NOT LEAK UNLESS VIA TOOLS):
${JSON.stringify(safeData, null, 2)}

INSTRUCTIONS:
1. You may only use the allowed tools.
2. Do not hallucinate findings.
3. If the user asks for something not in the truth, use 'deny_request'.
4. Do not reveal diagnosis unless in Management stage.
${isV2 ? `5. Base your responses STRICTLY on the 'truth' object provided above.` : ''}
`;
    }

    private filterData(fullCase: OsceCase, allowedFields: string[], stage: string): any {
        // This is a naive filter. In production, we'd map fields more precisely.
        // For now, checks if the top-level keys match or if specific sub-sections are needed.
        // Given existing case structure: history, examination, investigations...

        let filtered: any = {};

        // Helper to grab strict sections
        if (stage === 'History') filtered = { history: fullCase.history, metadata: fullCase.metadata };
        if (stage === 'Examination') filtered = { examination: fullCase.examination, metadata: fullCase.metadata };
        if (stage === 'Investigations') filtered = { investigations: fullCase.investigations, metadata: fullCase.metadata };
        if (stage === 'Management') filtered = { management: fullCase.management, metadata: fullCase.metadata };

        // Double check against forbidden (redundant but safe)
        if (stage !== 'Management') {
            delete (filtered as any).diagnosis;
            // Recursively ensure no 'diagnosis' field exists if we were more loose
        }

        return filtered;
    }

    private filterDataV2(fullCase: OsceCaseV2, stage: string): any {
        // V2 Filtering Logic
        // Always include basic demographics
        const base = {
            demographics: fullCase.truth.demographics,
            metadata: fullCase.case_metadata
        };

        if (stage === 'History') {
            return { ...base, history: fullCase.truth.history };
        }
        if (stage === 'Examination') {
            return { ...base, mental_state: fullCase.truth.mental_state_exam, physical: fullCase.truth.physical_exam };
        }
        if (stage === 'Investigations') {
            return { ...base, investigations: fullCase.truth.investigations };
        }
        if (stage === 'Management') {
            return { ...base, diagnosis: fullCase.truth.final_diagnosis, management_plan: fullCase.marking_scheme.management };
        }

        return base;
    }
}
