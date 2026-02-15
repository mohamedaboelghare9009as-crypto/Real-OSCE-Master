import { VoicePersona, VoiceStyle, PatientDemographics, VoiceParameters } from "../mcp/schemas";

export const CHATTERBOX_VOICES = {
    male: {
        young: 'david',
        adult: 'alex',
        middle_aged: 'charles',
        elderly: 'benjamin',
        deep: 'benjamin',
        warm: 'andy',
        tense: 'charles'
    },
    female: {
        young: 'claire',
        adult: 'bella',
        middle_aged: 'anna',
        elderly: 'claire',
        soft: 'bella',
        gentle: 'claire',
        anxious: 'bella'
    }
} as const;

export const VOICE_STYLES: Record<VoiceStyle, VoiceParameters> = {
    neutral: {
        speed: 1.0,
        pitch: 0.0,
        exaggeration: 0.5,
        pacing: 0.5,
        warmth: 0.6,
        clarity: 0.9,
        energy: 0.5
    },
    anxious: {
        speed: 1.15,
        pitch: 0.1,
        exaggeration: 0.7,
        pacing: 0.25,
        warmth: 0.7,
        clarity: 0.8,
        energy: 0.7
    },
    pain: {
        speed: 0.8,
        pitch: -0.1,
        exaggeration: 0.8,
        pacing: 0.35,
        warmth: 0.5,
        clarity: 0.85,
        energy: 0.3
    },
    professional: {
        speed: 0.95,
        pitch: 0.0,
        exaggeration: 0.2,
        pacing: 0.6,
        warmth: 0.4,
        clarity: 0.95,
        energy: 0.5
    },
    reassuring: {
        speed: 0.9,
        pitch: 0.05,
        exaggeration: 0.3,
        pacing: 0.7,
        warmth: 0.85,
        clarity: 0.9,
        energy: 0.4
    },
    urgent: {
        speed: 1.2,
        pitch: 0.1,
        exaggeration: 0.6,
        pacing: 0.2,
        warmth: 0.3,
        clarity: 0.95,
        energy: 0.9
    },
    calm: {
        speed: 0.85,
        pitch: 0.0,
        exaggeration: 0.25,
        pacing: 0.75,
        warmth: 0.8,
        clarity: 0.9,
        energy: 0.35
    },
    friendly: {
        speed: 1.05,
        pitch: 0.1,
        exaggeration: 0.5,
        pacing: 0.5,
        warmth: 0.85,
        clarity: 0.85,
        energy: 0.6
    }
};

export const DEMOGRAPHIC_VOICE_MAP: Record<string, Record<string, string>> = {
    male: {
        '0-12': 'david',
        '13-19': 'david',
        '20-35': 'alex',
        '36-55': 'charles',
        '56-75': 'benjamin',
        '76+': 'benjamin'
    },
    female: {
        '0-12': 'claire',
        '13-19': 'claire',
        '20-35': 'bella',
        '36-55': 'anna',
        '56-75': 'claire',
        '76+': 'claire'
    }
};

export function getAgeRange(age: number): string {
    if (age <= 12) return '0-12';
    if (age <= 19) return '13-19';
    if (age <= 35) return '20-35';
    if (age <= 55) return '36-55';
    if (age <= 75) return '56-75';
    return '76+';
}

export function getVoiceIdForDemographics(demographics: PatientDemographics, condition?: string): string {
    const sex = (demographics.sex || 'female').toLowerCase() as 'male' | 'female';
    const age = demographics.age || 35;
    const ageRange = getAgeRange(age);

    let voiceId = DEMOGRAPHIC_VOICE_MAP[sex]?.[ageRange] || CHATTERBOX_VOICES[sex].adult;

    if (condition) {
        const condLower = condition.toLowerCase();
        if (sex === 'male') {
            if (condLower.includes('pain') || condLower.includes('chest')) {
                voiceId = CHATTERBOX_VOICES.male.deep;
            } else if (condLower.includes('anxious') || condLower.includes('fear')) {
                voiceId = CHATTERBOX_VOICES.male.tense;
            }
        } else {
            if (condLower.includes('pain') || condLower.includes('chest')) {
                voiceId = CHATTERBOX_VOICES.female.soft;
            } else if (condLower.includes('anxious') || condLower.includes('fear')) {
                voiceId = CHATTERBOX_VOICES.female.anxious;
            }
        }
    }

    return voiceId;
}

export function getVoiceParametersForCondition(condition: string, baseStyle: VoiceStyle = 'neutral'): VoiceParameters {
    const baseParams = VOICE_STYLES[baseStyle] || VOICE_STYLES.neutral;
    const condLower = condition.toLowerCase();

    if (condLower.includes('pain') || condLower.includes('hurt') || condLower.includes('ache')) {
        return {
            ...baseParams,
            speed: Math.max(0.7, baseParams.speed - 0.15),
            pitch: baseParams.pitch - 0.15,
            energy: Math.max(0.2, baseParams.energy - 0.2),
            warmth: Math.min(0.7, baseParams.warmth + 0.1)
        };
    }

    if (condLower.includes('anxious') || condLower.includes('worry') || condLower.includes('fear')) {
        return {
            ...baseParams,
            speed: Math.min(1.2, baseParams.speed + 0.15),
            energy: Math.min(0.8, baseParams.energy + 0.2),
            pacing: Math.max(0.2, baseParams.pacing - 0.2)
        };
    }

    if (condLower.includes('shortness of breath') || condLower.includes('breath') || condLower.includes('asthma')) {
        return {
            ...baseParams,
            speed: Math.max(0.75, baseParams.speed - 0.1),
            pacing: Math.max(0.3, baseParams.pacing - 0.15),
            clarity: Math.min(0.95, baseParams.clarity + 0.05)
        };
    }

    if (condLower.includes('elderly') || condLower.includes('geriatric')) {
        return {
            ...baseParams,
            speed: Math.max(0.8, baseParams.speed - 0.1),
            pacing: Math.min(0.8, baseParams.pacing + 0.2),
            clarity: Math.min(0.95, baseParams.clarity + 0.05)
        };
    }

    if (condLower.includes('pediatric') || condLower.includes('child') || condLower.includes('infant')) {
        return {
            ...baseParams,
            speed: Math.min(1.1, baseParams.speed + 0.1),
            pitch: baseParams.pitch + 0.15,
            warmth: Math.min(0.9, baseParams.warmth + 0.1)
        };
    }

    return baseParams;
}

export const PERSONAS: Record<string, VoicePersona> = {
    patient_male_chest_pain: {
        id: 'patient_male_chest_pain',
        name: 'James',
        role: 'patient',
        voiceId: 'benjamin',
        tone: 'pain',
        speed: 0.85,
        pitch: 0.0,
        exaggeration: 0.9,
        pacing: 0.3,
        style: 'urgent'
    },
    patient_female_anxious: {
        id: 'patient_female_anxious',
        name: 'Sarah',
        role: 'patient',
        voiceId: 'bella',
        tone: 'anxious',
        speed: 1.15,
        pitch: 0.0,
        exaggeration: 0.8,
        pacing: 0.2,
        style: 'anxious'
    },
    patient_default: {
        id: 'patient_default',
        name: 'Patient',
        role: 'patient',
        voiceId: 'anna',
        tone: 'neutral',
        speed: 1.0,
        pitch: 0.0,
        exaggeration: 0.5,
        pacing: 0.5,
        style: 'neutral'
    },
    patient_male_elderly: {
        id: 'patient_male_elderly',
        name: 'Mr. Thompson',
        role: 'patient',
        voiceId: 'benjamin',
        tone: 'neutral',
        speed: 0.85,
        pitch: 0.0,
        exaggeration: 0.4,
        pacing: 0.9,
        style: 'calm'
    },
    patient_female_elderly: {
        id: 'patient_female_elderly',
        name: 'Mrs. Davis',
        role: 'patient',
        voiceId: 'claire',
        tone: 'neutral',
        speed: 0.85,
        pitch: 0.0,
        exaggeration: 0.4,
        pacing: 0.9,
        style: 'calm'
    },
    patient_male_young: {
        id: 'patient_male_young',
        name: 'Alex',
        role: 'patient',
        voiceId: 'david',
        tone: 'neutral',
        speed: 1.05,
        pitch: 0.0,
        exaggeration: 0.6,
        pacing: 0.4,
        style: 'friendly'
    },
    patient_female_young: {
        id: 'patient_female_young',
        name: 'Lily',
        role: 'patient',
        voiceId: 'claire',
        tone: 'neutral',
        speed: 1.05,
        pitch: 0.0,
        exaggeration: 0.5,
        pacing: 0.5,
        style: 'friendly'
    },
    patient_male_adult: {
        id: 'patient_male_adult',
        name: 'John',
        role: 'patient',
        voiceId: 'alex',
        tone: 'neutral',
        speed: 1.0,
        pitch: 0.0,
        exaggeration: 0.5,
        pacing: 0.5,
        style: 'neutral'
    },
    patient_male_anxious: {
        id: 'patient_male_anxious',
        name: 'David',
        role: 'patient',
        voiceId: 'charles',
        tone: 'anxious',
        speed: 1.15,
        pitch: 0.0,
        exaggeration: 0.8,
        pacing: 0.2,
        style: 'anxious'
    },
    patient_female_pain: {
        id: 'patient_female_pain',
        name: 'Rachel',
        role: 'patient',
        voiceId: 'bella',
        tone: 'pain',
        speed: 0.8,
        pitch: 0.0,
        exaggeration: 0.9,
        pacing: 0.3,
        style: 'reassuring'
    },
    nurse_professional: {
        id: 'nurse_professional',
        name: 'Nurse Williams',
        role: 'nurse',
        voiceId: 'anna',
        tone: 'professional',
        speed: 1.0,
        pitch: 0.0,
        exaggeration: 0.1,
        pacing: 0.5,
        style: 'professional'
    },
    patient_male_pediatric: {
        id: 'patient_male_pediatric',
        name: 'Tommy',
        role: 'patient',
        voiceId: 'david',
        tone: 'neutral',
        speed: 1.1,
        pitch: 0.15,
        exaggeration: 0.6,
        pacing: 0.4,
        style: 'friendly'
    },
    patient_female_pediatric: {
        id: 'patient_female_pediatric',
        name: 'Emma',
        role: 'patient',
        voiceId: 'claire',
        tone: 'neutral',
        speed: 1.1,
        pitch: 0.2,
        exaggeration: 0.6,
        pacing: 0.4,
        style: 'friendly'
    },
    patient_male_geriatric: {
        id: 'patient_male_geriatric',
        name: 'Robert',
        role: 'patient',
        voiceId: 'benjamin',
        tone: 'neutral',
        speed: 0.8,
        pitch: -0.05,
        exaggeration: 0.3,
        pacing: 0.85,
        style: 'calm'
    },
    patient_female_geriatric: {
        id: 'patient_female_geriatric',
        name: 'Margaret',
        role: 'patient',
        voiceId: 'claire',
        tone: 'neutral',
        speed: 0.8,
        pitch: 0.0,
        exaggeration: 0.3,
        pacing: 0.85,
        style: 'calm'
    },
    patient_male_respiratory_distress: {
        id: 'patient_male_respiratory_distress',
        name: 'Michael',
        role: 'patient',
        voiceId: 'benjamin',
        tone: 'pain',
        speed: 0.75,
        pitch: 0.05,
        exaggeration: 0.7,
        pacing: 0.3,
        style: 'urgent'
    },
    patient_female_respiratory_distress: {
        id: 'patient_female_respiratory_distress',
        name: 'Jennifer',
        role: 'patient',
        voiceId: 'bella',
        tone: 'pain',
        speed: 0.75,
        pitch: 0.1,
        exaggeration: 0.7,
        pacing: 0.3,
        style: 'urgent'
    }
};
