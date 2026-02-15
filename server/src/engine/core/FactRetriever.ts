
import { IntentCode } from '../../types/intents';
import { OsceCaseV2 } from '../../schemas/caseSchema';
import { FactResult } from '../types';

export class FactRetriever {

    retrieve(intent: IntentCode, caseData: OsceCaseV2): FactResult {
        const result = this.resolvePath(intent, caseData);
        if (result) {
            return { fact: result.text, sourcePath: result.path, found: true };
        }
        return { fact: "I'm not sure.", found: false };
    }

    private resolvePath(intent: IntentCode, c: OsceCaseV2): { text: string, path: string } | null {
        const history = c.truth.history;
        const demographics = c.truth.demographics;

        switch (intent) {
            // --- HISTORY ---
            case IntentCode.ASK_CHIEF_COMPLAINT:
                return { text: history.chief_complaint, path: 'truth.history.chief_complaint' };
            case IntentCode.ASK_ONSET:
                return { text: history.onset, path: 'truth.history.onset' };
            case IntentCode.ASK_DURATION:
                return { text: history.duration, path: 'truth.history.duration' };
            case IntentCode.ASK_CHARACTER:
                return { text: history.character || "I can't really describe it.", path: 'truth.history.character' };
            case IntentCode.ASK_RADIATION:
                return { text: history.radiation || "It stays in one place.", path: 'truth.history.radiation' };
            case IntentCode.ASK_ASSOCIATED_SYMPTOMS:
                return { text: this.formatList(history.associated_symptoms), path: 'truth.history.associated_symptoms' };
            case IntentCode.ASK_EXACERBATING_FACTORS:
                return { text: history.exacerbating_factors || "Nothing makes it worse.", path: 'truth.history.exacerbating_factors' };
            case IntentCode.ASK_RELIEVING_FACTORS:
                return { text: history.relieving_factors || "Nothing really helps.", path: 'truth.history.relieving_factors' };
            case IntentCode.ASK_SEVERITY:
                return { text: history.severity || "It's quite bad.", path: 'truth.history.severity' };

            // --- BACKGROUND ---
            case IntentCode.ASK_PAST_MEDICAL_HISTORY:
                return { text: c.truth.past_medical_history || "No major medical history.", path: 'truth.past_medical_history' };
            case IntentCode.ASK_MEDICATIONS:
                return { text: c.truth.medications || "I'm not taking any medications.", path: 'truth.medications' };
            case IntentCode.ASK_ALLERGIES:
                return { text: c.truth.allergies || "No allergies.", path: 'truth.allergies' };
            case IntentCode.ASK_SOCIAL_HISTORY:
                return { text: this.formatSocial(c.truth.social_history), path: 'truth.social_history' };
            case IntentCode.ASK_FAMILY_HISTORY:
                return { text: c.truth.family_history || "Everyone in my family is healthy.", path: 'truth.family_history' };

            // --- EXAM (Requires simple description or blocking) ---
            // In a real V3 engine, these would return exam findings objects, but for chat we return text descriptions.
            case IntentCode.PERFORM_EXAM_GENERAL:
                return { text: c.truth.physical_exam?.general || "Patient appears comfortable.", path: 'truth.physical_exam.general' };
            case IntentCode.PERFORM_EXAM_CARDIO:
                return { text: c.truth.physical_exam?.cardiovascular || "Normal heart sounds.", path: 'truth.physical_exam.cardiovascular' };
            case IntentCode.PERFORM_EXAM_RESP:
                return { text: c.truth.physical_exam?.respiratory || "Clear breath sounds.", path: 'truth.physical_exam.respiratory' };
            case IntentCode.PERFORM_EXAM_ABDO:
                return { text: c.truth.physical_exam?.abdomen || "Soft, non-tender.", path: 'truth.physical_exam.abdomen' };
            case IntentCode.PERFORM_EXAM_NEURO:
                return { text: c.truth.physical_exam?.neurological || "Grossly intact.", path: 'truth.physical_exam.neurological' };
            case IntentCode.CHECK_VITALS:
                // Currently V2 case schema puts vitals in mixed exam or similar. 
                // We'll return a generic "Vitals are displayed" or look for specific field if added.
                return { text: "Vitals are: HR 80, BP 120/80.", path: 'truth.physical_exam.vitals' };

            // --- INVESTIGATIONS ---
            case IntentCode.REQUEST_ECG:
                return { text: "ECG shows normal sinus rhythm.", path: 'truth.investigations.bedside.ecg' };

            case IntentCode.ASK_DEMOGRAPHICS:
                return { text: `I am ${demographics.age} years old.`, path: 'truth.demographics.age' };

            // --- GREETING ---
            case IntentCode.GREETING:
                return { text: "Hello doctor.", path: 'truth.demographics' };

            // --- LIFESTYLE / DIET ---
            case IntentCode.ASK_DIET:
                return { text: this.formatSocial(c.truth.social_history) || "I eat normally.", path: 'truth.social_history.diet' };
            case IntentCode.ASK_LIFESTYLE:
                return { text: this.formatSocial(c.truth.social_history) || "I try to stay active.", path: 'truth.social_history.lifestyle' };

            // --- ICE ---
            case IntentCode.ASK_IDEAS:
                return { text: "I'm not sure, maybe it's just stress? But it feels deeper.", path: 'truth.ice.ideas' };
            case IntentCode.ASK_CONCERNS:
                return { text: "I'm worried I can't do my job anymore.", path: 'truth.ice.concerns' };
            case IntentCode.ASK_EXPECTATIONS:
                return { text: "I just want to feel like myself again.", path: 'truth.ice.expectations' };

            // --- PSYCH / MSE (Strictly mapped to truth.mental_state_exam) ---
            case IntentCode.PERFORM_MSE_MOOD:
                return { text: c.truth.mental_state_exam?.mood || "I feel empty.", path: 'truth.mental_state_exam.mood' };
            case IntentCode.PERFORM_MSE_PERCEPTION:
                return { text: c.truth.mental_state_exam?.perception || "No, I don't see or hear things that aren't there.", path: 'truth.mental_state_exam.perception' };
            case IntentCode.PERFORM_MSE_THOUGHT:
                // Critical Risk Check
                const risk = c.truth.mental_state_exam?.thought_content || "";
                // If risk factors exist in history, mention them too
                const riskFactors = c.truth.history?.risk_factors ? `(${c.truth.history.risk_factors.join(', ')})` : "";
                return { text: `${risk}. ${riskFactors}`, path: 'truth.mental_state_exam.thought_content' };
            case IntentCode.PERFORM_MSE_COGNITION:
                return { text: c.truth.mental_state_exam?.cognition || "I can focus okay.", path: 'truth.mental_state_exam.cognition' };
            case IntentCode.PERFORM_MSE_INSIGHT:
                return { text: c.truth.mental_state_exam?.insight || "I know I need help.", path: 'truth.mental_state_exam.insight' };

            default:
                return null;
        }
    }

    private formatList(items: string[] | string): string {
        if (!items) return "None.";
        if (typeof items === 'string') return items;
        return items.join(", ");
    }

    private formatSocial(social: any): string {
        if (!social) return "Nothing significant.";
        if (typeof social === 'string') return social;
        return Object.entries(social).map(([k, v]) => `${k}: ${v}`).join(". ");
    }
}
