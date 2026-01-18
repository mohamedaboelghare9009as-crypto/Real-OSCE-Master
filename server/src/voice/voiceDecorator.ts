
import { PERSONAS } from './personas/profiles';
import { VoicePersona } from './mcp/schemas';

export class VoiceDecorator {
    /**
     * Converts raw text to SSML-enhanced text with prosody and intent
     */
    decorate(text: string, personaId: string = 'patient_default', caseData?: any): { ssml: string, voiceId: string } {
        const persona: VoicePersona = PERSONAS[personaId] || PERSONAS['patient_default'];

        // --- Intent & Emotion Parsing ---
        let processedText = text;

        // 1. Handle Breathlessness (Based on Vitals or Keywords)
        const vitals = caseData?.examination?.vitals || caseData?.vitals;
        const isShortOfBreath = (vitals?.rr > 22) || /breath|cough|wheeze/i.test(text);

        // 2. Handle Pain (Slower pace and deeper pitch)
        const inPain = /pain|hurt|agony|stabbing|crushing/i.test(text) || (personaId === 'patient_male_chest_pain');

        // 3. Natural Pauses (add space before break tags)
        processedText = processedText.replace(/,/g, ', <break time="250ms"/>');
        processedText = processedText.replace(/\.\.\./g, ' <break time="600ms"/>');
        processedText = processedText.replace(/\?/g, '? <break time="300ms"/>');

        // 4. If short of breath, add occasional pauses mid-sentence
        if (isShortOfBreath) {
            const words = processedText.split(' ');
            if (words.length > 6) {
                processedText = words.map((w, i) => (i > 0 && i % 4 === 0) ? `${w} <break time="400ms"/>` : w).join(' ');
            }
        }

        // 5. Wrap in SSML with NUMERIC values (not percentages)
        // Standard/Wavenet voices: rate 0.25-4.0, pitch -20.0 to +20.0
        let rate = 1.0; // Default
        let pitch = 0.0; // Default

        if (isShortOfBreath) {
            rate = 0.85; // Numeric, not "85%"
        } else if (inPain) {
            rate = 0.90;
            pitch = -2.0;
        }

        const ssml = `<speak><prosody rate="${rate}" pitch="${pitch}st">${processedText}</prosody></speak>`;


        return {
            ssml,
            voiceId: persona.voiceId
        };
    }

    /**
     * Determines the best persona for a case (Fallback logic)
     */
    getPersonaForCase(caseData: any): string {
        if (!caseData) return 'patient_default';

        // 1. Explicit Persona ID
        const personaId = caseData.metadata?.personaId || caseData.personaId;
        if (personaId && PERSONAS[personaId]) return personaId;

        // 2. Specialty Mapping
        const specialty = (caseData.metadata?.specialty || caseData.specialty || '').toLowerCase();

        if (specialty === 'cardiology') return 'patient_male_chest_pain';
        if (specialty === 'respiratory') return 'patient_male_chest_pain';
        if (specialty === 'psychiatry') return 'patient_female_anxious';
        if (specialty === 'pediatrics') return 'patient_young';

        // 3. Vital Mapping (Distress)
        const vitals = caseData.examination?.vitals || caseData.vitals;
        if (vitals) {
            if (vitals.hr > 110 || (vitals.bp && parseInt(vitals.bp) > 160)) return 'patient_male_chest_pain';
            if (vitals.rr > 22) return 'patient_female_anxious';
        }

        return 'patient_default';
    }
}

export const voiceDecorator = new VoiceDecorator();
