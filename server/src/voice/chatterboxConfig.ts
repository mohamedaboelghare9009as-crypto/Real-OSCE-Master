
/**
 * Chatterbox Turbo Voice Configuration
 * 
 * Chatterbox Turbo via DeepInfra uses OpenAI-compatible API.
 * Key points:
 * - Model: ResembleAI/chatterbox-turbo
 * - Voice parameter is passed directly to the API
 * - Valid voices need to be explicitly set and preserved
 */

export const CHATTERBOX_VALID_VOICES = [
    'andy',      // Male - warm, steady
    'bella',     // Female - gentle, clear
    'alex',      // Male - adult
    'anna',      // Female - middle-aged
    'benjamin',  // Male - elderly/deep
    'charles',   // Male - tense/middle-aged
    'claire',    // Female - young/elderly
    'david'      // Male - young
] as const;

export type ChatterboxVoice = typeof CHATTERBOX_VALID_VOICES[number];

export interface ChatterboxVoiceConfig {
    id: ChatterboxVoice;
    name: string;
    sex: 'male' | 'female';
    ageGroup: 'child' | 'young' | 'adult' | 'middle-aged' | 'elderly';
    characteristics: string[];
    bestFor: string[];
}

export const CHATTERBOX_VOICE_DETAILS: Record<ChatterboxVoice, ChatterboxVoiceConfig> = {
    andy: {
        id: 'andy',
        name: 'Andy',
        sex: 'male',
        ageGroup: 'adult',
        characteristics: ['warm', 'steady', 'professional'],
        bestFor: ['neutral', 'professional', 'reassuring']
    },
    bella: {
        id: 'bella',
        name: 'Bella',
        sex: 'female',
        ageGroup: 'adult',
        characteristics: ['gentle', 'clear', 'calm'],
        bestFor: ['neutral', 'anxious', 'pain', 'friendly']
    },
    alex: {
        id: 'alex',
        name: 'Alex',
        sex: 'male',
        ageGroup: 'adult',
        characteristics: ['clear', 'steady', 'authoritative'],
        bestFor: ['professional', 'neutral', 'adult male']
    },
    anna: {
        id: 'anna',
        name: 'Anna',
        sex: 'female',
        ageGroup: 'middle-aged',
        characteristics: ['mature', 'steady', 'professional'],
        bestFor: ['professional', 'neutral', 'middle-aged female']
    },
    benjamin: {
        id: 'benjamin',
        name: 'Benjamin',
        sex: 'male',
        ageGroup: 'elderly',
        characteristics: ['deep', 'wise', 'slow', 'elderly'],
        bestFor: ['elderly', 'pain', 'serious conditions']
    },
    charles: {
        id: 'charles',
        name: 'Charles',
        sex: 'male',
        ageGroup: 'middle-aged',
        characteristics: ['tense', 'authoritative', 'stressed'],
        bestFor: ['anxious', 'urgent', 'chest pain', 'professional stress']
    },
    claire: {
        id: 'claire',
        name: 'Claire',
        sex: 'female',
        ageGroup: 'young',
        characteristics: ['youthful', 'gentle', 'soft'],
        bestFor: ['young female', 'pediatric', 'elderly female', 'gentle']
    },
    david: {
        id: 'david',
        name: 'David',
        sex: 'male',
        ageGroup: 'young',
        characteristics: ['youthful', 'energetic', 'friendly'],
        bestFor: ['young male', 'pediatric', 'friendly', 'energetic']
    }
};

/**
 * Voice mapping by demographics and conditions
 */
export const VOICE_SELECTION_MATRIX: Record<string, Record<string, ChatterboxVoice>> = {
    male: {
        'pediatric': 'david',
        'young': 'david',
        'adult': 'alex',
        'adult_warm': 'andy',
        'adult_anxious': 'charles',
        'adult_pain': 'benjamin',
        'middle-aged': 'charles',
        'elderly': 'benjamin',
        'elderly_pain': 'benjamin',
        'default': 'alex'
    },
    female: {
        'pediatric': 'claire',
        'young': 'claire',
        'adult': 'bella',
        'adult_anxious': 'bella',
        'adult_pain': 'bella',
        'middle-aged': 'anna',
        'elderly': 'claire',
        'elderly_gentle': 'claire',
        'default': 'bella'
    }
};

export interface PatientProfile {
    age: number;
    sex: 'male' | 'female';
    conditions?: string[];
    emotionalState?: string;
}

export function getChatterboxVoice(profile: PatientProfile): ChatterboxVoice {
    const { age, sex, conditions = [], emotionalState = 'neutral' } = profile;
    const condLower = conditions.map(c => c.toLowerCase()).join(' ');
    const emotionalLower = emotionalState.toLowerCase();
    
    // Determine age category
    let ageKey: string;
    if (age < 13) {
        ageKey = 'pediatric';
    } else if (age < 25) {
        ageKey = 'young';
    } else if (age < 45) {
        ageKey = 'adult';
    } else if (age < 65) {
        ageKey = 'middle-aged';
    } else {
        ageKey = 'elderly';
    }
    
    // Check for condition-specific overrides
    const sexKey = sex.toLowerCase() as 'male' | 'female';
    
    // Pain conditions - use deeper voices
    if (condLower.includes('pain') || condLower.includes('chest') || condLower.includes('hurt')) {
        if (sexKey === 'male') {
            return VOICE_SELECTION_MATRIX[sexKey]['adult_pain'] || 'benjamin';
        } else {
            return VOICE_SELECTION_MATRIX[sexKey]['adult_pain'] || 'bella';
        }
    }
    
    // Anxiety - use tense/anxious voices
    if (condLower.includes('anxious') || condLower.includes('anxiety') || emotionalLower.includes('anxious')) {
        if (sexKey === 'male') {
            return VOICE_SELECTION_MATRIX[sexKey]['adult_anxious'] || 'charles';
        } else {
            return VOICE_SELECTION_MATRIX[sexKey]['adult_anxious'] || 'bella';
        }
    }
    
    // Respiratory - use voices that work well with breathing sounds
    if (condLower.includes('breath') || condLower.includes('asthma') || condLower.includes('respiratory')) {
        if (sexKey === 'male') {
            return 'benjamin'; // Deep voice works well with [gasp] tags
        } else {
            return 'bella';
        }
    }
    
    // Elderly with pain
    if (ageKey === 'elderly' && (condLower.includes('pain') || condLower.includes('discomfort'))) {
        return VOICE_SELECTION_MATRIX[sexKey]['elderly_pain'] || 
               (sexKey === 'male' ? 'benjamin' : 'claire');
    }
    
    // Default by age
    return VOICE_SELECTION_MATRIX[sexKey][ageKey] || 
           VOICE_SELECTION_MATRIX[sexKey]['default'] ||
           (sexKey === 'male' ? 'alex' : 'bella');
}

/**
 * Validates that a voice ID is valid for Chatterbox Turbo
 */
export function isValidChatterboxVoice(voiceId: string): voiceId is ChatterboxVoice {
    return CHATTERBOX_VALID_VOICES.includes(voiceId as ChatterboxVoice);
}

/**
 * Gets voice details for logging/debugging
 */
export function getVoiceDetails(voiceId: ChatterboxVoice): ChatterboxVoiceConfig {
    return CHATTERBOX_VOICE_DETAILS[voiceId];
}

/**
 * Debug function to log voice selection
 */
export function logVoiceSelection(profile: PatientProfile, selectedVoice: ChatterboxVoice): void {
    const details = getVoiceDetails(selectedVoice);
    console.log(`[VoiceSelection] Patient: ${profile.age}yo ${profile.sex}`);
    console.log(`[VoiceSelection] Conditions: ${profile.conditions?.join(', ') || 'None'}`);
    console.log(`[VoiceSelection] Emotional State: ${profile.emotionalState || 'Neutral'}`);
    console.log(`[VoiceSelection] Selected Voice: ${selectedVoice} (${details.name})`);
    console.log(`[VoiceSelection] Voice Sex: ${details.sex} | Age Group: ${details.ageGroup}`);
    console.log(`[VoiceSelection] Characteristics: ${details.characteristics.join(', ')}`);
}
