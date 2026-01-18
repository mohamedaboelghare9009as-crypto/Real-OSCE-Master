
import { IntentCode } from '../../types/intents';

export class MCPGate {
    /**
     * Checks if an intent is allowed in the current stage.
     * @param stage - The current stage of the OSCE session (e.g., 'History', 'Examination')
     * @param intent - The intent code derived from user input
     * @returns { allowed: boolean, reason: string }
     */
    check(stage: string, intent: IntentCode): { allowed: boolean, reason?: string } {
        const currentStage = stage.toLowerCase();

        console.log(`[MCP] Checking intent ${intent} in stage ${currentStage}`);

        // 1. Universal Allows (always permitted)
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) {
            return { allowed: true };
        }

        // History intents list
        const historyIntents = [
            IntentCode.ASK_CHIEF_COMPLAINT,
            IntentCode.ASK_ONSET,
            IntentCode.ASK_DURATION,
            IntentCode.ASK_CHARACTER,
            IntentCode.ASK_RADIATION,
            IntentCode.ASK_ASSOCIATED_SYMPTOMS,
            IntentCode.ASK_EXACERBATING_FACTORS,
            IntentCode.ASK_RELIEVING_FACTORS,
            IntentCode.ASK_SEVERITY,
            IntentCode.ASK_PAST_MEDICAL_HISTORY,
            IntentCode.ASK_MEDICATIONS,
            IntentCode.ASK_ALLERGIES,
            IntentCode.ASK_SOCIAL_HISTORY,
            IntentCode.ASK_FAMILY_HISTORY
        ];

        // Exam intents list
        const examIntents = [
            IntentCode.PERFORM_EXAM_GENERAL,
            IntentCode.PERFORM_EXAM_CARDIO,
            IntentCode.PERFORM_EXAM_RESP,
            IntentCode.PERFORM_EXAM_ABDO,
            IntentCode.PERFORM_EXAM_NEURO,
            IntentCode.CHECK_VITALS
        ];

        // Investigation intents list
        const investigationIntents = [
            IntentCode.REQUEST_ECG,
            IntentCode.REQUEST_LABS,
            IntentCode.REQUEST_IMAGING,
            IntentCode.REQUEST_TROPONIN
        ];

        // 2. History Stage Rules
        if (currentStage === 'history') {
            if (historyIntents.includes(intent)) {
                return { allowed: true };
            }

            if (examIntents.includes(intent)) {
                return { allowed: false, reason: "I'm not ready for the physical exam yet. Let's finish talking first." };
            }

            if (investigationIntents.includes(intent)) {
                return { allowed: false, reason: "We should finish the history before ordering tests." };
            }
        }

        // 3. Examination Stage Rules
        if (currentStage === 'examination') {
            // Allow all exam intents
            if (examIntents.includes(intent)) {
                return { allowed: true };
            }
            // Still allow history questions (doctors can ask follow-up)
            if (historyIntents.includes(intent)) {
                return { allowed: true };
            }
            // Block investigations until that stage
            if (investigationIntents.includes(intent)) {
                return { allowed: false, reason: "Let's finish the examination before ordering tests." };
            }
        }

        // 4. Investigations Stage Rules
        if (currentStage === 'investigations') {
            // Allow investigations
            if (investigationIntents.includes(intent)) {
                return { allowed: true };
            }
            // Still allow history and exam (sometimes need to re-check)
            if (historyIntents.includes(intent) || examIntents.includes(intent)) {
                return { allowed: true };
            }
        }

        // 5. Management Stage (allow all review)
        if (currentStage === 'management') {
            return { allowed: true };
        }

        // Default Allow for unhandled stages (be permissive in dev)
        console.warn(`[MCP] Allowing ${intent} in unhandled stage ${stage}`);
        return { allowed: true };
    }
}

export const mcpGate = new MCPGate();
