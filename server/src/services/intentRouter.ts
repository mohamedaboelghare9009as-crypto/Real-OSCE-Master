
import { IntentCode } from '../types/intents';

export enum IntentCategory {
    CLINICAL = 'CLINICAL',
    CONVERSATIONAL = 'CONVERSATIONAL',
    UNCLEAR = 'UNCLEAR',
    NURSE = 'NURSE'
}

export interface RouteResult {
    category: IntentCategory;
    originalQuery: string;
    confidence: number;
}

export class IntentRouter {
    private readonly MEDICAL_KEYWORDS = [
        'pain', 'hurt', 'ache', 'symptom', 'feel', 'feeling',
        'history', 'past', 'medical', 'family', 'social',
        'smoke', 'drink', 'alcohol', 'drug', 'medication',
        'start', 'started', 'begin', 'began', 'onset', 'happen', 'occurred',
        'long', 'duration', 'time', 'how long', 'when',
        'exam', 'examine', 'look', 'listen', 'check', 'measure',
        'breathing', 'breath', 'chest', 'heart', 'abdomen', 'stomach',
        'old', 'age', 'live', 'work', 'occupation',
        'problem', 'matter', 'brings', 'wrong', 'issue', 'reason', 'here', 'today', 'bring', 'why',
        'married', 'partner', 'husband', 'wife', 'kids', 'children', 'hobby', 'hobbies', 'fun'
    ];

    private readonly CONVERSATIONAL_KEYWORDS = [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'thank you', 'thanks', 'bye', 'goodbye', 'see you',
        'sorry', 'excuse me', 'pardon', 'name', 'who',
        'your name', 'my name is', 'how are you', 'how do you do',
        'nice to meet', 'what is your name', 'good moring', 'moring',
        'who are you', 'introduce', 'talk', 'chat'
    ];

    async route(text: string): Promise<RouteResult> {
        const t = text.toLowerCase();

        // 1. Critical Commands (highest priority)
        if (/\b(stop|pause|help)\b/.test(t)) {
            return { category: IntentCategory.CONVERSATIONAL, originalQuery: text, confidence: 1.0 };
        }
        if (/\b(nurse|sister|medical assistant)\b/.test(t)) {
            return { category: IntentCategory.NURSE, originalQuery: text, confidence: 1.0 };
        }

        // 2. Calculate scores
        const clinicalScore = this.calculateClinicalScore(t);
        const conversationalScore = this.calculateConversationalScore(t);

        console.log(`[Router] Scores - Clinical: ${clinicalScore.toFixed(2)}, Conversational: ${conversationalScore.toFixed(2)}`);

        // 3. Route based on highest score
        if (clinicalScore > conversationalScore) {
            return {
                category: IntentCategory.CLINICAL,
                originalQuery: text,
                confidence: clinicalScore
            };
        }

        if (conversationalScore > 0.5) {
            return {
                category: IntentCategory.CONVERSATIONAL,
                originalQuery: text,
                confidence: conversationalScore
            };
        }

        // 4. Fallback: if long message, assume clinical
        if (text.split(' ').length > 4) {
            return {
                category: IntentCategory.CLINICAL,
                originalQuery: text,
                confidence: 0.6
            };
        }

        return {
            category: IntentCategory.UNCLEAR,
            originalQuery: text,
            confidence: 0.3
        };
    }

    private calculateClinicalScore(text: string): number {
        const matches = this.MEDICAL_KEYWORDS.filter(keyword => text.includes(keyword));
        const baseScore = Math.min(matches.length * 0.15, 0.8); // Cap at 0.8

        // Boost score for question words
        const questionBoost = /\b(what|when|where|why|how|can|could|would|do|does|is|are)\b/.test(text) ? 0.2 : 0;

        return Math.min(baseScore + questionBoost, 1.0);
    }

    private calculateConversationalScore(text: string): number {
        // Pure greeting/farewell detection (stronger signal)
        const isPureGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(text.trim());
        const isPureFarewell = /(bye|goodbye|see you|take care)$/i.test(text.trim());

        if (isPureGreeting || isPureFarewell) {
            return 1.0;
        }

        // Check for conversational keywords
        const matches = this.CONVERSATIONAL_KEYWORDS.filter(keyword => text.includes(keyword));

        // Penalize if medical keywords also present (mixed intent)
        const hasMedicalKeywords = this.MEDICAL_KEYWORDS.some(keyword => text.includes(keyword));

        if (matches.length > 0 && !hasMedicalKeywords) {
            return 0.8;
        }

        return 0.2; // Low score for mixed or unclear
    }
}

export const intentRouter = new IntentRouter();
