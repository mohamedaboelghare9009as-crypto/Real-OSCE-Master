import { STAGE_CONFIGS, McpResponse } from '../schemas/mcpSchema';
import { sessionService } from '../../services/sessionService';
import { McpToolsDefinition } from '../tools/toolDefinitions';

export class PolicyEngine {

    // PRE-CHECK: Validate if the user is even allowed to speak/act in this state
    async validateRequest(userId: string, caseId: string, userMessage: string, sessionId?: string): Promise<boolean> {
        // 1. Check Session State
        let session;
        if (sessionId) {
            session = await sessionService.getSession(sessionId);
        } else {
            session = await sessionService.findActiveSession(userId, caseId);
        }

        if (!session) {
            console.error(`[PolicyEngine] Validation Failed: Session not found. SessionId: ${sessionId}, UserId: ${userId}, CaseId: ${caseId}`);
            return false;
        }

        // 2. Check if stage is valid
        if (!STAGE_CONFIGS[session.currentStage]) {
            console.error(`[PolicyEngine] Validation Failed: Invalid Stage '${session.currentStage}' for Configs. Keys: ${Object.keys(STAGE_CONFIGS).join(', ')}`);
            return false;
        }

        // 3. Simple Intent check (Mock)
        return true;
    }

    // POST-CHECK: Validate Model Output
    async validateResponse(response: McpResponse, currentStage: string): Promise<McpResponse> {
        const config = STAGE_CONFIGS[currentStage];
        if (!config) throw new Error("Unknown stage config");

        // 1. Check Tool Calls
        if (response.tool_calls) {
            for (const call of response.tool_calls) {
                // Illegal Tool Usage
                if (!config.allowedTools.includes(call.name)) {
                    console.warn(`[Policy Violation] Tool ${call.name} forbidden in ${currentStage}`);
                    return {
                        content: null,
                        tool_calls: [{
                            name: 'deny_request',
                            arguments: { reason: `Action ${call.name} not allowed in ${currentStage}.` }
                        }]
                    };
                }
            }
        }

        // 2. Hallucination Check / Content Leak Check (Simple Keyword Matching)
        // If content contains "Diagnosis:" or similar forbidden words in strictly forbidden stages
        if (config.forbiddenFields.includes('diagnosis')) {
            if (response.content && /diagnosis/i.test(response.content)) {
                // Aggressive filter
                console.warn(`[Policy Violation] Potential diagnosis leak in ${currentStage}`);
                return {
                    content: "I cannot reveal the diagnosis at this stage.",
                    tool_calls: []
                };
            }
        }

        // 3. Structure Check
        // Ensure no raw JSON dumping unless it's a tool call

        return response;
    }
}
