
import { IntentCode } from '../../types/intents';
import { GateResult } from '../types';

export class ContextValidator {

    validate(currentStage: string, intent: IntentCode): GateResult {
        const stage = currentStage.toLowerCase();

        // 1. Universally Allowed
        if ([IntentCode.GREETING, IntentCode.UNKNOWN].includes(intent)) {
            return { allowed: true };
        }

        // 2. Stage Specific Rules
        switch (stage) {
            case 'history':
                return this.checkHistory(intent);
            case 'examination':
                return this.checkExamination(intent);
            case 'investigations':
                return this.checkInvestigations(intent);
            case 'management':
                return { allowed: true }; // Free review
            default:
                return { allowed: true }; // Fallback
        }
    }

    private checkHistory(intent: IntentCode): GateResult {
        if (this.isHistory(intent)) return { allowed: true };

        // Allow vitals and general appearance even in history stage (triage/initial assessment)
        if (intent === IntentCode.CHECK_VITALS || intent === IntentCode.PERFORM_EXAM_GENERAL) {
            return { allowed: true };
        }

        if (this.isExam(intent)) {
            return {
                allowed: false,
                reason: "I'm not ready for a full physical exam yet. Let's finish talking about my symptoms first, and then we can examine that."
            };
        }

        if (this.isInvestigation(intent)) {
            return { allowed: false, reason: "We should finish the history before ordering tests." };
        }

        return { allowed: true };
    }

    private checkExamination(intent: IntentCode): GateResult {
        if (this.isExam(intent)) return { allowed: true };
        if (intent === IntentCode.CHECK_VITALS) return { allowed: true };
        if (this.isHistory(intent)) return { allowed: true }; // Allow backtracking
        if (this.isInvestigation(intent)) return { allowed: false, reason: "Let's finish the examination before ordering tests." };
        return { allowed: true };
    }

    private checkInvestigations(intent: IntentCode): GateResult {
        if (this.isInvestigation(intent)) return { allowed: true };
        if (this.isHistory(intent) || this.isExam(intent)) return { allowed: true }; // Allow backtracking
        return { allowed: true };
    }

    // --- Helper predicates ---

    private isHistory(intent: IntentCode): boolean {
        return [
            IntentCode.ASK_CHIEF_COMPLAINT, IntentCode.ASK_ONSET, IntentCode.ASK_DURATION,
            IntentCode.ASK_CHARACTER, IntentCode.ASK_RADIATION, IntentCode.ASK_ASSOCIATED_SYMPTOMS,
            IntentCode.ASK_EXACERBATING_FACTORS, IntentCode.ASK_RELIEVING_FACTORS, IntentCode.ASK_SEVERITY,
            IntentCode.ASK_PAST_MEDICAL_HISTORY, IntentCode.ASK_MEDICATIONS, IntentCode.ASK_ALLERGIES,
            IntentCode.ASK_SOCIAL_HISTORY, IntentCode.ASK_FAMILY_HISTORY
        ].includes(intent);
    }

    private isExam(intent: IntentCode): boolean {
        return [
            IntentCode.PERFORM_EXAM_GENERAL, IntentCode.PERFORM_EXAM_CARDIO, IntentCode.PERFORM_EXAM_RESP,
            IntentCode.PERFORM_EXAM_ABDO, IntentCode.PERFORM_EXAM_NEURO, IntentCode.CHECK_VITALS
        ].includes(intent);
    }

    private isInvestigation(intent: IntentCode): boolean {
        return [
            IntentCode.REQUEST_ECG, IntentCode.REQUEST_LABS, IntentCode.REQUEST_IMAGING, IntentCode.REQUEST_TROPONIN
        ].includes(intent);
    }
}
