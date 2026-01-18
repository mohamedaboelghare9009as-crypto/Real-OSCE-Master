
import { VertexAI } from '@google-cloud/vertexai';
import { IntentCode } from '../../types/intents';
import { IntentResult } from '../types';

export class IntentResolver {
    private model: any;

    constructor() {
        const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT || 'osce-ai-sim';
        const location = 'us-central1'; // Strict requirement

        console.log(`[IntentResolver] Initializing Vertex AI with Project: ${project}, Location: ${location}`);

        const platform = new VertexAI({ project, location });
        // detailed valid resource name to satisfy SDK + User requirement
        const fullModelName = `projects/${project}/locations/${location}/publishers/google/models/gemini-1.5-flash`;

        this.model = platform.getGenerativeModel({
            model: fullModelName,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        });
    }

    async resolve(text: string): Promise<IntentResult> {
        const lower = text.toLowerCase().trim().replace(/[^\w\s]/g, '');

        // 1. Deterministic Heuristics (Instant & Free)
        if (this.isGreeting(lower)) return this.makeResult(IntentCode.GREETING, 1.0, text, 'heuristic');
        if (this.isYesNo(lower)) return this.makeResult(IntentCode.UNKNOWN, 0.5, text, 'heuristic');

        // Common Medical Questions (Deterministic Speed/Fallback)
        if (lower.match(/(why are you here|what brings you|how can i help|what seems to be the matter)/))
            return this.makeResult(IntentCode.ASK_CHIEF_COMPLAINT, 1.0, text, 'heuristic');

        if (lower.match(/(when did it start|how long|duration)/))
            return this.makeResult(IntentCode.ASK_DURATION, 1.0, text, 'heuristic');

        if (lower.match(/(describe|tell me more|what does it feel like|nature of)/))
            return this.makeResult(IntentCode.ASK_CHARACTER, 1.0, text, 'heuristic');

        if (lower.match(/(pain|hurt).*(move|go anywhere|radiat|spread)/))
            return this.makeResult(IntentCode.ASK_RADIATION, 1.0, text, 'heuristic');

        // Physical Exam Shortcuts
        if (lower.match(/(listen|chest|heart|lung|breath|sound)/))
            return this.makeResult(IntentCode.PERFORM_EXAM_RESP, 1.0, text, 'heuristic'); // Simple mapping for now

        if (lower.match(/(abdominal|tummy|stomach|feel)/))
            return this.makeResult(IntentCode.PERFORM_EXAM_ABDO, 1.0, text, 'heuristic');

        // General Conversation / Fallbacks
        if (lower.match(/(anything else|something else|more information)/))
            return this.makeResult(IntentCode.GREETING, 0.5, text, 'heuristic'); // Safe fallback to general info or trigger 'Unknown' cleanly if no specific map

        if (lower.match(/(thank you|thanks|ok|okay|sure|fine)/))
            return this.makeResult(IntentCode.GREETING, 0.5, text, 'heuristic'); // Just acknowledge

        // --- ICE (Ideas, Concerns, Expectations) ---
        if (lower.match(/(what do you think|your opinion|idea)/))
            return this.makeResult(IntentCode.ASK_IDEAS, 1.0, text, 'heuristic');
        if (lower.match(/(worried|concern|scared|fear)/))
            return this.makeResult(IntentCode.ASK_CONCERNS, 1.0, text, 'heuristic');
        if (lower.match(/(hoping for|expect|want me to do)/))
            return this.makeResult(IntentCode.ASK_EXPECTATIONS, 1.0, text, 'heuristic');

        // --- Psych / MSE ---
        if (lower.match(/(mood|feel|spirits)/)) // "How is your mood?"
            return this.makeResult(IntentCode.PERFORM_MSE_MOOD, 1.0, text, 'heuristic');
        if (lower.match(/(hear voices|see things|hallucinations|visions)/))
            return this.makeResult(IntentCode.PERFORM_MSE_PERCEPTION, 1.0, text, 'heuristic');
        if (lower.match(/(suicid|kill yourself|end it all|life not worth living)/)) // Risk Assessment
            return this.makeResult(IntentCode.PERFORM_MSE_THOUGHT, 1.0, text, 'heuristic'); // Use Thought Content for risk typically

        // --- Lifestyle ---
        if (lower.match(/(diet|eat|food|appetite)/))
            return this.makeResult(IntentCode.ASK_DIET, 1.0, text, 'heuristic');
        if (lower.match(/(exercise|activity|sports|gym)/))
            return this.makeResult(IntentCode.ASK_LIFESTYLE, 1.0, text, 'heuristic');

        // 2. LLM Classification (Strict Enum)
        try {
            const prompt = this.getPrompt(text);
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.candidates[0].content.parts[0].text;
            const json = JSON.parse(responseText);

            // Validate against Enum
            const intent = Object.values(IntentCode).includes(json.intent) ? json.intent : IntentCode.UNKNOWN;

            return this.makeResult(intent, 0.9, text, 'llm');

        } catch (error: any) {
            console.error("[IntentResolver] LLM Classification Failed. Query:", text);
            console.error("Error Detail:", error.message || error);
            if (error.response) console.error("API Response:", JSON.stringify(error.response, null, 2));

            return this.makeResult(IntentCode.UNKNOWN, 0, text, 'fallback');
        }
    }

    private isGreeting(text: string): boolean {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(g => text.startsWith(g));
    }

    private isYesNo(text: string): boolean {
        return ['yes', 'no', 'yeah', 'nah'].includes(text);
    }

    private makeResult(intent: IntentCode, confidence: number, text: string, source: 'heuristic' | 'llm' | 'fallback'): IntentResult {
        return { intent, confidence, originalQuery: text, source };
    }

    private getPrompt(query: string): string {
        return `
            CLASSIFY the following student query into ONE intent code.
            
            [HISTORY]
            ASK_CHIEF_COMPLAINT, ASK_ONSET, ASK_DURATION, ASK_CHARACTER, ASK_RADIATION, 
            ASK_ASSOCIATED_SYMPTOMS, ASK_EXACERBATING_FACTORS, ASK_RELIEVING_FACTORS, ASK_SEVERITY
            
            [BACKGROUND]
            ASK_PAST_MEDICAL_HISTORY, ASK_MEDICATIONS, ASK_ALLERGIES, ASK_SOCIAL_HISTORY, ASK_FAMILY_HISTORY
            
            [EXAM]
            PERFORM_EXAM_GENERAL, PERFORM_EXAM_CARDIO, PERFORM_EXAM_RESP, PERFORM_EXAM_ABDO, 
            PERFORM_EXAM_NEURO, CHECK_VITALS
            
            [TESTS]
            REQUEST_ECG, REQUEST_LABS, REQUEST_IMAGING, REQUEST_TROPONIN
            
            [OTHER]
            GREETING, UNKNOWN

            QUERY: "${query}"

            Return JSON: { "intent": "ENUM_VALUE" }
        `;
    }
}
