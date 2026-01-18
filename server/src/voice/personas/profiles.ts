import { VoicePersona } from "../mcp/schemas";

/**
 * Voice Personas for OSCE Simulation
 * Using Gemini 2.5 Flash TTS voices (Aoede, Kore, Callirrhoe, etc.)
 */
export const PERSONAS: Record<string, VoicePersona> = {
    // Patient Personas
    'patient_male_chest_pain': {
        id: 'patient_male_chest_pain',
        name: 'James',
        role: 'patient',
        voiceId: 'en-US-Standard-D', // Male Standard (Better SSML support)
        tone: 'pain',
        speed: 0.95,
        pitch: -1.0
    },
    'patient_female_anxious': {
        id: 'patient_female_anxious',
        name: 'Sarah',
        role: 'patient',
        voiceId: 'en-US-Journey-F', // Female, expressive/anxious
        tone: 'anxious',
        speed: 1.0,
        pitch: 0.5
    },
    'patient_default': {
        id: 'patient_default',
        name: 'Patient',
        role: 'patient',
        voiceId: 'en-US-Journey-O', // Female, calm
        tone: 'neutral',
        speed: 1.0,
        pitch: 0.0
    },
    'patient_elderly': {
        id: 'patient_elderly',
        name: 'Mr. Thompson',
        role: 'patient',
        voiceId: 'en-US-Standard-D', // Male, standard deepest (Journey doesn't have a great "old" voice yet, Standard D is deep)
        tone: 'neutral',
        speed: 0.85,
        pitch: -2.0
    },
    'patient_young': {
        id: 'patient_young',
        name: 'Alex',
        role: 'patient',
        voiceId: 'en-US-Journey-A', // Male, young-sounding
        tone: 'neutral',
        speed: 1.05,
        pitch: 1.0
    },

    // Nurse Persona
    'nurse_professional': {
        id: 'nurse_professional',
        name: 'Nurse Williams',
        role: 'nurse',
        voiceId: 'en-US-Standard-C', // Female, professional/standard
        tone: 'professional',
        speed: 1.0,
        pitch: 0.0
    }
};
