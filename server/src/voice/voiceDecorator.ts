
import { PERSONAS } from './personas/profiles';
import { VoicePersona } from './mcp/schemas';

export class VoiceDecorator {
    /**
     * EXAM-REALISTIC Voice Decorator (Clarity Override v2)
     * Converts raw text into minimally-decorated speech that sounds distressed but remains INTELLIGIBLE.
     * PRINCIPLE: Educational value > Dramatic acting
     */
    decorate(text: string, personaId: string = 'patient_default', caseData?: any): { ssml: string, voiceId: string, naturalText: string } {
        const persona: VoicePersona = PERSONAS[personaId] || PERSONAS['patient_default'];

        // 1. Strip all Meta Tags (Gemini often leaves [Tone: ...] tags)
        let speech = text.replace(/\[[^\]]*\]/gi, '').trim();
        speech = speech.replace(/<speak>|<\/speak>/gi, '');

        // 2. Extract Clinical State
        const truth = caseData?.truth || {};
        const vitals = truth.physical_exam?.vitals || truth.vitals || {};
        const rr = vitals.rr || 0;
        const hr = vitals.hr || 0;
        const emotionalState = (truth.emotional_state || '').toLowerCase();

        // 3. EXAM-REALISTIC Voice Decoration (Clarity Override v2)
        // PRINCIPLE: Patient must sound distressed but REMAIN INTELLIGIBLE for educational value.

        const wordCount = speech.split(' ').length;

        // Scenario A: RESPIRATORY DISTRESS
        // Realistic: Slight breathlessness, but complete sentences
        if (rr > 22 || /breath|cough|wheeze/i.test(speech)) {
            // Only add pauses at natural sentence boundaries
            if (wordCount > 15) {
                // Long sentences: Add ONE mid-sentence pause at a comma or after 10 words
                const words = speech.split(' ');
                const midpoint = Math.floor(words.length / 2);
                speech = words.map((w, i) => (i === midpoint) ? `${w}...` : w).join(' ');
            }
            // End with a single breath pause
            speech = speech.replace(/\.$/, '...');
        }

        // Scenario B: SEVERE PAIN
        // Realistic: Strained voice, occasional "ow", but NO stuttering on every word
        else if (emotionalState.includes('pain') || emotionalState.includes('agony') || /stabbing|crushing/i.test(speech)) {
            // Add "ow" or groan ONLY once per sentence, at the end
            if (wordCount > 5) {
                speech = speech.replace(/\.$/, '... ow.');
            } else {
                speech = speech.replace(/\.$/, '.');
            }
            // NO stuttering - it breaks readability
        }

        // Scenario C: ANXIETY/PANIC
        // Realistic: Faster speech, maybe one "um" or "uh", but coherent
        else if (emotionalState.includes('anxious') || emotionalState.includes('scared') || hr > 110) {
            // Add ONE hesitation word at the start if sentence is long enough
            if (wordCount > 6) {
                speech = 'Um, ' + speech;
            }
            // Slightly rushed ending (no excessive punctuation)
            speech = speech.replace(/\.$/, '.');
        }

        // Scenario D: ELDERLY/TIRED
        // Realistic: Slower, but still clear
        else if (personaId.includes('elderly')) {
            // Add pauses at commas only
            speech = speech.replace(/,/g, '...');
        }

        // 4. Fallback: NEUTRAL (No decoration)
        else {
            // Keep speech natural - no artificial pauses
            // TTS will handle natural prosody
        }

        // Final Cleanup: Remove excessive whitespace
        const cleanNaturalText = speech.replace(/\s+/g, ' ').trim();

        return {
            ssml: `<speak>${cleanNaturalText}</speak>`, // Keep for legacy, but we use the text
            voiceId: persona.voiceId,
            naturalText: cleanNaturalText
        };
    }

    /**
     * Determines the best persona for a case (Dynamic Condition Mapping)
     */
    getPersonaForCase(caseData: any): string {
        if (!caseData || !caseData.truth) {
            console.warn('[VoiceDecorator] No case data provided, using default');
            return 'patient_default';
        }

        const truth = caseData.truth;
        const demographics = truth.demographics || {};
        const emotionalState = (truth.emotional_state || 'neutral').toLowerCase();

        const sex = (demographics.sex || 'female').toLowerCase();
        const age = demographics.age !== undefined ? demographics.age : 35;

        console.log(`[VoiceDecorator] Demographics: Age=${age}, Sex=${sex}, EmotionalState=${emotionalState}`);

        // 1. Physical Distress (The "Golden Record" from Vitals)
        const vitals = truth.physical_exam?.vitals || truth.vitals || {};
        const hr = vitals.hr || 0;
        const rr = vitals.rr || 0;

        const isInSeverePain = emotionalState.includes('pain') || emotionalState.includes('chest pain');
        const isHighlyAnxious = emotionalState.includes('anxious') || emotionalState.includes('fear') || rr > 24;

        console.log(`[VoiceDecorator] Conditions: Pain=${isInSeverePain}, Anxious=${isHighlyAnxious}, HR=${hr}, RR=${rr}`);

        // 2. Persona Match Logic
        let selectedPersona = 'patient_default';

        // MALE PATH
        if (sex === 'male') {
            if (age > 65) selectedPersona = 'patient_elderly';
            else if (isInSeverePain) selectedPersona = 'patient_male_chest_pain';
            else if (isHighlyAnxious) selectedPersona = 'patient_male_anxious';
            else if (age < 30) selectedPersona = 'patient_young';
            else selectedPersona = 'patient_male_adult';
        }

        // FEMALE PATH
        else {
            if (age > 65) selectedPersona = 'patient_female_elderly';
            else if (isInSeverePain) selectedPersona = 'patient_female_pain';
            else if (isHighlyAnxious) selectedPersona = 'patient_female_anxious';
            else if (age < 30) selectedPersona = 'patient_female_young';
            else selectedPersona = 'patient_default'; // Default Adult Female Neutral (Bella)
        }

        console.log(`[VoiceDecorator] Selected Persona: ${selectedPersona}`);
        return selectedPersona;
    }
}

export const voiceDecorator = new VoiceDecorator();
