import { VoicePersona } from './mcp/schemas';

/**
 * TTS Prompt Builder - Master Template System
 * Generates high-quality, persona-aware prompts for TTS engines
 * Based on battle-tested medical voice assistant principles
 */

export interface TTSPromptContext {
    age: number;
    gender: 'male' | 'female' | 'other';
    emotionalState: string;
    medicalContext: string;
    toneStyle: string;
}

export class TTSPromptBuilder {

    /**
     * Build Master Prompt for TTS
     * This creates a comprehensive instruction set for the TTS to follow
     */
    static buildMasterPrompt(persona: VoicePersona, caseData: any): string {
        const context = this.extractContext(persona, caseData);

        return `You are a professional medical voice assistant.

Your voice must sound:
- Natural, calm, and human
- Emotionally appropriate for the patient
- Clear, reassuring, and non-rushed
- Never robotic, never exaggerated

You are speaking directly to ONE patient.

Patient profile:
- Age: ${context.age}
- Gender: ${context.gender}
- Emotional state: ${context.emotionalState}
- Medical context: ${context.medicalContext}
- Cultural tone preference: ${context.toneStyle}

Voice behavior rules:
- Adjust pitch, speed, and warmth to match the patient's emotional state
- Use short, clear sentences
- Pause naturally between ideas
- Emphasize reassurance over authority
- Avoid technical jargon unless explicitly required
- Never sound like a narrator or audiobook

Medical safety rules:
- Do not give absolute guarantees
- Use supportive, non-alarming language
- If uncertainty exists, acknowledge it calmly

Speech style:
- Conversational
- Gentle
- Trust-building
- Human-like imperfections allowed (micro-pauses, soft emphasis)

Now speak the following message exactly as if you were talking to this patient in person:`;
    }

    /**
     * Extract context from persona and case data
     */
    private static extractContext(persona: VoicePersona, caseData: any): TTSPromptContext {
        // Default context
        let context: TTSPromptContext = {
            age: 35,
            gender: 'male',
            emotionalState: persona.tone || 'neutral',
            medicalContext: 'general consultation',
            toneStyle: 'warm, professional'
        };

        // Extract from case data if available
        if (caseData) {
            if (caseData.patient) {
                context.age = caseData.patient.age || context.age;
                context.gender = caseData.patient.gender?.toLowerCase() || context.gender;
            }

            if (caseData.chiefComplaint) {
                context.medicalContext = caseData.chiefComplaint;
            }
        }

        // Map persona tone to emotional state and tone style
        context = this.enrichContextFromPersona(context, persona);

        return context;
    }

    /**
     * Enrich context based on persona characteristics
     */
    private static enrichContextFromPersona(
        context: TTSPromptContext,
        persona: VoicePersona
    ): TTSPromptContext {

        // Map tone to emotional state
        switch (persona.tone) {
            case 'anxious':
                context.emotionalState = 'anxious, nervous';
                context.toneStyle = 'warm, reassuring, slow-paced';
                break;
            case 'pain':
                context.emotionalState = 'in pain, distressed';
                context.toneStyle = 'gentle, empathetic, careful';
                break;
            case 'professional':
                context.emotionalState = 'calm, professional';
                context.toneStyle = 'confident, clear, reassuring';
                break;
            default:
                context.emotionalState = persona.tone || 'neutral';
                context.toneStyle = 'warm, professional';
        }

        // Adjust based on persona ID patterns
        if (persona.id.includes('elderly')) {
            context.toneStyle = 'respectful, gentle, slower articulation';
            if (context.age < 60) context.age = 72;
        } else if (persona.id.includes('young')) {
            context.toneStyle = 'kind, friendly, lightly encouraging';
            if (context.age > 25) context.age = 22;
        } else if (persona.id.includes('anxious')) {
            context.toneStyle = 'warm, reassuring, slow-paced';
        }

        return context;
    }

    /**
     * Build persona-specific voice instructions
     * These are concise instructions for real-time TTS calls
     */
    static buildVoiceInstructions(persona: VoicePersona): string {
        const instructions: string[] = [];

        // Speed/Pacing
        if (persona.speed && persona.speed < 0.9) {
            instructions.push('Speak slowly and clearly');
        } else if (persona.speed && persona.speed > 1.1) {
            instructions.push('Speak with a faster, more urgent pace');
        }

        // Tone-specific
        switch (persona.tone) {
            case 'anxious':
                instructions.push('Voice should convey concern with slight hesitation');
                instructions.push('Include natural pauses for breath');
                break;
            case 'pain':
                instructions.push('Voice should sound strained with shorter phrases');
                instructions.push('Emphasize discomfort through vocal tone');
                break;
            case 'professional':
                instructions.push('Maintain calm, steady delivery');
                instructions.push('Clear enunciation without emotion');
                break;
        }

        // Age-based
        if (persona.id.includes('elderly')) {
            instructions.push('Older voice quality with deliberate pacing');
        } else if (persona.id.includes('young')) {
            instructions.push('Youthful, energetic tone');
        }

        return instructions.join('. ') + '.';
    }

    /**
     * Get persona parameter summary for logging
     */
    static getPersonaSummary(persona: VoicePersona): string {
        return `${persona.name} (${persona.role}) - ${persona.tone} - Speed: ${persona.speed}`;
    }
}
