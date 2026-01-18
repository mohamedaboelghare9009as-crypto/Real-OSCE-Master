
import { IntentCode } from '../types/intents';
import { OsceCaseV2 } from '../schemas/caseSchema';

export class CaseFactResolver {

    resolve(intent: IntentCode, caseData: OsceCaseV2): string {
        const history = caseData.truth.history;
        const truth = caseData.truth;

        console.log(`[CaseFactResolver] Resolving intent: ${intent}`);

        // ===== HISTORY INTENTS =====
        switch (intent) {
            case IntentCode.GREETING:
                return "Hello doctor.";

            case IntentCode.ASK_CHIEF_COMPLAINT:
                return history.chief_complaint || "I'm not feeling well.";

            case IntentCode.ASK_ONSET:
                return history.onset || "It started recently.";

            case IntentCode.ASK_DURATION:
                return history.duration || "It's been a while now.";

            case IntentCode.ASK_CHARACTER:
                return history.character || history.description || "It's hard to describe.";

            case IntentCode.ASK_RADIATION:
                return history.radiation || "It doesn't go anywhere.";

            case IntentCode.ASK_ASSOCIATED_SYMPTOMS:
                if (Array.isArray(history.associated_symptoms) && history.associated_symptoms.length > 0) {
                    return "I also have " + history.associated_symptoms.join(", ") + ".";
                }
                return "No other symptoms.";

            case IntentCode.ASK_EXACERBATING_FACTORS:
                return history.exacerbating_factors || "Nothing makes it worse.";

            case IntentCode.ASK_RELIEVING_FACTORS:
                return history.relieving_factors || "Nothing really helps.";

            case IntentCode.ASK_SEVERITY:
                return history.severity || "It's quite bad.";

            // ===== PAST HISTORY =====
            case IntentCode.ASK_PAST_MEDICAL_HISTORY:
                return truth.past_medical_history || "I'm generally healthy.";

            case IntentCode.ASK_MEDICATIONS:
                return truth.medications || "I don't take any medication.";

            case IntentCode.ASK_ALLERGIES:
                return truth.allergies || "No allergies.";

            case IntentCode.ASK_SOCIAL_HISTORY:
                const soc = truth.social_history;
                if (typeof soc === 'string') return soc;
                if (typeof soc === 'object') {
                    return Object.entries(soc as object).map(([k, v]) => `${k}: ${v}`).join('. ');
                }
                return "I live at home, don't smoke.";

            case IntentCode.ASK_FAMILY_HISTORY:
                return truth.family_history || "No relevant family history.";

            // ===== PHYSICAL EXAMINATION =====
            case IntentCode.PERFORM_EXAM_GENERAL:
                return truth.physical_exam?.general || "Patient appears comfortable.";

            case IntentCode.PERFORM_EXAM_CARDIO:
                return truth.physical_exam?.cardiovascular || "Heart sounds normal. No murmurs.";

            case IntentCode.PERFORM_EXAM_RESP:
                return truth.physical_exam?.respiratory || "Breath sounds clear bilaterally.";

            case IntentCode.PERFORM_EXAM_ABDO:
                return truth.physical_exam?.abdomen || "Abdomen soft, non-tender.";

            case IntentCode.PERFORM_EXAM_NEURO:
                return truth.physical_exam?.neurological || "Neurological examination normal.";

            case IntentCode.CHECK_VITALS:
                const demo = truth.demographics;
                // Build vitals string from case data if available
                return `Vitals reviewed. Patient is a ${demo?.age || 'middle-aged'} year old ${demo?.sex || 'patient'}.`;

            // ===== INVESTIGATIONS =====
            case IntentCode.REQUEST_ECG:
                return truth.investigations?.bedside?.ECG || "ECG appears normal.";

            case IntentCode.REQUEST_TROPONIN:
                return truth.investigations?.bedside?.Troponin || "Troponin levels normal.";

            case IntentCode.REQUEST_LABS:
                // Combine all lab findings
                const labs = truth.investigations?.confirmatory;
                if (labs && typeof labs === 'object') {
                    return Object.entries(labs).map(([test, result]) => `${test}: ${result}`).join('. ');
                }
                return "Laboratory results pending.";

            case IntentCode.REQUEST_IMAGING:
                const cxr = truth.investigations?.confirmatory?.CXR;
                const echo = truth.investigations?.confirmatory?.Echo;
                if (cxr) return cxr;
                if (echo) return echo;
                return "Imaging results pending.";

            // ===== FALLBACK =====
            case IntentCode.UNKNOWN:
            default:
                return "I'm sorry, I don't understand what you mean. Could you ask another way?";
        }
    }
}

export const caseFactResolver = new CaseFactResolver();
