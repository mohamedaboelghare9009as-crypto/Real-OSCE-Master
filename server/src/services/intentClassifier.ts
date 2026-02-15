import { VertexAI } from '@google-cloud/vertexai';
import { IntentCode, IntentResult } from '../types/intents';
import path from 'path';

export class IntentClassifier {
    private vertexAI: VertexAI;
    private model: any;
    private initialized: boolean = false;

    constructor() {
        const project = 'osce-ai-sim';
        const location = 'us-central1';
        const keyPath = path.join(process.cwd(), 'osce-ai-sim-d5b457979ae1.json');

        console.log(`[IntentClassifier] Initializing with Vertex AI (Project: ${project}, Location: ${location})`);

        this.vertexAI = new VertexAI({
            project: project,
            location: location,
            keyFilename: keyPath
        });
    }

    private async ensureInitialized() {
        if (this.initialized) return;

        try {
            this.model = this.vertexAI.getGenerativeModel({
                model: 'gemini-2.0-flash-001',
                generationConfig: { temperature: 0.0 }
            });
            this.initialized = true;
            console.log(`[IntentClassifier] Ready (Vertex AI / gemini-2.0-flash-001)`);
        } catch (e: any) {
            console.error("[IntentClassifier] Init Failed:", e.message);
        }
    }

    async classify(text: string): Promise<IntentResult> {
        const prompt = `
            Task: Classify user input into a specific medical OSCE intent.
            Return ONLY the IntentCode string.
            
            VALID INTENT CODES:
            - GREETING
            - ASK_CHIEF_COMPLAINT
            - ASK_ONSET
            - ASK_DURATION
            - ASK_CHARACTER
            - ASK_RADIATION
            - ASK_ASSOCIATED_SYMPTOMS
            - ASK_EXACERBATING_FACTORS
            - ASK_RELIEVING_FACTORS
            - ASK_SEVERITY
            - ASK_PAST_MEDICAL_HISTORY
            - ASK_MEDICATIONS
            - ASK_ALLERGIES
            - ASK_SOCIAL_HISTORY
            - ASK_FAMILY_HISTORY
            - ASK_DEMOGRAPHICS
            - PERFORM_EXAM_GENERAL
            - PERFORM_EXAM_CARDIO
            - PERFORM_EXAM_RESP
            - PERFORM_EXAM_ABDO
            - REQUEST_ECG
            - REQUEST_LABS
            - ASK_IDEAS
            - ASK_CONCERNS
            - ASK_EXPECTATIONS
            - CLINICAL_INTENT (Use if medical but none of above fit)
            - CONVERSATIONAL_INTENT (Use for small talk)
            - UNCLEAR_INTENT (Use if gibberish)
            - NURSE_COMMAND (Use if the student addresses the nurse, e.g., "Nurse, please...")
            
            INPUT: "${text}"
            OUTPUT_LABEL:
        `;

        try {
            await this.ensureInitialized();

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

            if (responseText) {
                return this.parseResponse(responseText, text);
            }
        } catch (error: any) {
            console.warn("[IntentClassifier] AI Classification Failed, using fallback:", error.message);
        }

        return this.fallbackClassify(text);
    }

    private parseResponse(responseText: string, originalText: string): IntentResult {
        const cleanText = responseText.replace(/['"`]/g, '').trim().toUpperCase();
        const isValid = Object.values(IntentCode).includes(cleanText as IntentCode);

        if (isValid) {
            return { intent: cleanText as IntentCode, confidence: 1.0, originalQuery: originalText };
        }
        return this.fallbackClassify(originalText);
    }

    private fallbackClassify(text: string): IntentResult {
        const t = text.toLowerCase();

        // 1. Explicit Overrides for Common Failures
        if (/\b(hello|hi|hey|good|morning|evening|afternoon|thanks|thank|bye|how are you|how is it going)\b/.test(t)) {
            return { intent: IntentCode.CONVERSATIONAL_INTENT, confidence: 0.9, originalQuery: text };
        }
        if (/\b(name|who are you|introduce)\b/.test(t)) {
            return { intent: IntentCode.CONVERSATIONAL_INTENT, confidence: 0.9, originalQuery: text };
        }
        if (/\b(count)\b/.test(t)) {
            return { intent: IntentCode.CLINICAL_INTENT, confidence: 0.8, originalQuery: text };
        }
        if (/\b(nurse|sister|medical assistant)\b/.test(t)) {
            return { intent: IntentCode.NURSE_COMMAND, confidence: 0.9, originalQuery: text };
        }

        const map: [RegExp, IntentCode][] = [
            [/\b(start|begin|onset|happen|occur|since|during)/, IntentCode.ASK_ONSET],
            [/\b(long|duration|time|periods)/, IntentCode.ASK_DURATION],
            [/\b(describe|feel|like|nature|character)/, IntentCode.ASK_CHARACTER],
            [/\b(radiat|move|spread|go|travel)/, IntentCode.ASK_RADIATION],
            [/\b(why.*here|what.*bring|brings|matter|wrong|issue|help.*today|here.*today|reason|problem)/, IntentCode.ASK_CHIEF_COMPLAINT],
            [/\b(bad|score|scale|sever|metric)/, IntentCode.ASK_SEVERITY],
            [/\b(worse|aggrav|trigger|harder)/, IntentCode.ASK_EXACERBATING_FACTORS],
            [/\b(better|reliev|eas|help|improv)/, IntentCode.ASK_RELIEVING_FACTORS],
            [/\b(else|other|symptom)/, IntentCode.ASK_ASSOCIATED_SYMPTOMS],
            [/\b(medication|pill|drug|tablet|prescri|take)/, IntentCode.ASK_MEDICATIONS],
            [/\b(allerg|reaction)/, IntentCode.ASK_ALLERGIES],
            [/\b(condition|illness|disease|history|past|operation|surger)/, IntentCode.ASK_PAST_MEDICAL_HISTORY],
            [/\b(family|parent|mom|dad|sister|brother)/, IntentCode.ASK_FAMILY_HISTORY],
            [/\b(married|single|partner|relationship|spouse|smoke|drink|alcohol|work|job|home|live)/, IntentCode.ASK_SOCIAL_HISTORY],
            [/\b(diet|eat|food|appetite)/, IntentCode.ASK_DIET],
            [/\b(exercise|gym|sport|activ)/, IntentCode.ASK_LIFESTYLE],
            [/\b(old|age|birthday|years|from|where.*from|origin|nationality)/, IntentCode.ASK_DEMOGRAPHICS],
            [/\b(ecg|ekg|trace|heart)/, IntentCode.REQUEST_ECG],
            [/\b(lab|blood test|blood count|trop|hemoglobin|cbc|bmp)/, IntentCode.REQUEST_LABS],
            [/\b(xray|scan|mri|ct|imag)/, IntentCode.REQUEST_IMAGING],
            [/\b(pain|hurt|symptom|feel|history|exam|check|test|scan|blood|pill|med|listen|heart|lung|breath|sound|look|see)/, IntentCode.CLINICAL_INTENT],
        ];

        for (const [regex, intent] of map) {
            if (regex.test(t)) return { intent, confidence: 0.8, originalQuery: text };
        }

        return { intent: IntentCode.UNCLEAR_INTENT, confidence: 0, originalQuery: text };
    }
}
export const intentClassifier = new IntentClassifier();
