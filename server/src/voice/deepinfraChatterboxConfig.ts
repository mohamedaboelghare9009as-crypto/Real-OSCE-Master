/**
 * DeepInfra Chatterbox Turbo Voice Configuration
 * Complete voice mapping with all available preset voices
 */

// Local PatientProfile interface to avoid circular dependency
export interface PatientProfile {
    age: number;
    sex: 'male' | 'female';
    language?: string;
}

export interface DeepInfraVoice {
    voiceId: string;
    name: string;
    sex: 'male' | 'female';
    ageGroup: 'child' | 'young' | 'adult' | 'middle-aged' | 'elderly';
    language: 'english' | 'chinese' | 'japanese' | 'french' | 'other';
    characteristics: string[];
    exaggeration: number;
    temperature: number;
}

export const DEEPINFRA_VOICES: Record<string, DeepInfraVoice> = {
    // ============================================
    // CUSTOM VOICES (Strictly Limited to these 3)
    // ============================================
    'Tarkos': {
        voiceId: 'wdki0osc9z5j77snyw08',
        name: 'Tarkos',
        sex: 'male',
        ageGroup: 'adult',
        language: 'english',
        characteristics: ['custom', 'male', 'unique'],
        exaggeration: 0.15,
        temperature: 0.7
    },
    'Steve': {
        voiceId: 'ztwqaauovmrne4zmhocy',
        name: 'Steve',
        sex: 'male',
        ageGroup: 'adult',
        language: 'english',
        characteristics: ['custom', 'male', 'clear'],
        exaggeration: 0.15,
        temperature: 0.7
    },
    'Britney': {
        voiceId: 's81gfv15gmkv7ads8yzo',
        name: 'Britney',
        sex: 'female',
        ageGroup: 'young',
        language: 'english',
        characteristics: ['custom', 'female', 'bright'],
        exaggeration: 0.2,
        temperature: 0.75
    }
};

// Get voices by criteria
export function getVoicesBySex(sex: 'male' | 'female'): DeepInfraVoice[] {
    return Object.values(DEEPINFRA_VOICES).filter(v => v.sex === sex);
}

export function getVoicesByAgeGroup(ageGroup: string): DeepInfraVoice[] {
    return Object.values(DEEPINFRA_VOICES).filter(v => v.ageGroup === ageGroup);
}

export function getVoicesByLanguage(language: string): DeepInfraVoice[] {
    return Object.values(DEEPINFRA_VOICES).filter(v => v.language === language);
}

export function getVoiceById(voiceId: string): DeepInfraVoice | undefined {
    return DEEPINFRA_VOICES[voiceId];
}

export function isValidVoiceId(voiceId: string): boolean {
    if (voiceId in DEEPINFRA_VOICES) return true;
    // Support DeepInfra custom voice IDs (UUID-like alphanumeric strings)
    // Custom IDs are usually hexadecimal or alphanumeric and at least 20 chars
    return voiceId in DEEPINFRA_VOICES || /^[a-zA-Z0-9]{20,}$/.test(voiceId);
}

// Get all available voice IDs
export function getAllVoiceIds(): string[] {
    return Object.keys(DEEPINFRA_VOICES);
}

// Get voice count
export function getVoiceCount(): number {
    return Object.keys(DEEPINFRA_VOICES).length;
}

// Voice selection helper for patient demographics
export interface PatientDemographics {
    age: number;
    sex: 'male' | 'female';
    language?: string;
}

export interface VoiceSelectionOptions {
    condition?: string;
    emotionalState?: string;
    preferExaggerated?: boolean;
}

export function selectVoiceForPatient(
    profile: PatientProfile,
    options: VoiceSelectionOptions = {}
): DeepInfraVoice {
    const { age, sex, language = 'english' } = profile;
    const { condition = 'neutral', emotionalState = 'neutral', preferExaggerated = false } = options;

    console.log(`[VoiceSelection] Input: ${age}yo ${sex}, condition: ${condition}, emotion: ${emotionalState}`);

    // Determine age group
    let ageGroup: 'child' | 'young' | 'adult' | 'middle-aged' | 'elderly';
    if (age < 13) {
        ageGroup = 'child';
    } else if (age < 25) {
        ageGroup = 'young';
    } else if (age < 45) {
        ageGroup = 'adult';
    } else if (age < 65) {
        ageGroup = 'middle-aged';
    } else {
        ageGroup = 'elderly';
    }

    console.log(`[VoiceSelection] Age group: ${ageGroup}`);

    // Normalize sex for matching
    const normalizedSex = sex.toLowerCase();

    // Get candidate voices from the custom set
    // Be more inclusive since we only have 3 custom voices
    let candidates = Object.values(DEEPINFRA_VOICES).filter(v =>
        v.sex === normalizedSex &&
        v.language === language &&
        (
            v.ageGroup === ageGroup ||
            (ageGroup === 'child' && v.ageGroup === 'young') ||
            (ageGroup === 'adult' && v.ageGroup === 'young') // Britney (young) can do adult
        )
    );

    console.log(`[VoiceSelection] Found ${candidates.length} candidates matching age/sex/language`);

    // Fallback to any voice of correct sex if no age match
    if (candidates.length === 0) {
        console.log(`[VoiceSelection] No age match, falling back to any ${sex} voice`);
        candidates = Object.values(DEEPINFRA_VOICES).filter(v => v.sex === sex && v.language === language);
    }

    // Fallback to Britney if no match found (or if sex is female and no specific match)
    if (candidates.length === 0) {
        return DEEPINFRA_VOICES['Britney'];
    }

    // Sort by appropriateness for condition
    candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Custom Logic for Tarkos vs Steve
        if (a.name === 'Tarkos') {
            // Tarkos is better for older, rougher, or pain
            if (age > 50) scoreA += 20;
            if (condition.toLowerCase().includes('pain') || condition.toLowerCase().includes('chest')) scoreA += 10;
        }
        if (b.name === 'Tarkos') {
            if (age > 50) scoreB += 20;
            if (condition.toLowerCase().includes('pain') || condition.toLowerCase().includes('chest')) scoreB += 10;
        }

        if (a.name === 'Steve') {
            // Steve is better for younger, clear, anxiety
            if (age <= 50) scoreA += 20;
            if (condition.toLowerCase().includes('anxiety') || condition.toLowerCase().includes('nervous')) scoreA += 10;
        }
        if (b.name === 'Steve') {
            if (age <= 50) scoreB += 20;
            if (condition.toLowerCase().includes('anxiety') || condition.toLowerCase().includes('nervous')) scoreB += 10;
        }

        return scoreB - scoreA;
    });

    const selectedVoice = candidates[0] || DEEPINFRA_VOICES['Britney'];
    console.log(`[VoiceSelection] Selected: ${selectedVoice.voiceId} (${selectedVoice.name}) from ${candidates.length} candidates`);

    return selectedVoice;
}

// Get adjusted parameters based on condition
export function getAdjustedParameters(
    voice: DeepInfraVoice,
    condition: string,
    emotionalState: string
): {
    exaggeration: number;
    temperature: number;
    cfg: number;
    top_p: number;
    min_p: number;
    repetition_penalty: number;
    top_k: number;
} {
    let exaggeration = voice.exaggeration;
    let temperature = voice.temperature;
    let cfg = 0.5; // Default CFG
    let top_p = 0.95;
    let min_p = 0;
    let repetition_penalty = 1.2;
    let top_k = 1000;

    const condLower = condition.toLowerCase();
    const emotionLower = emotionalState.toLowerCase();

    // --- HIGH INTENSITY STATES ---

    // Pain / Agony
    if (condLower.includes('pain') || condLower.includes('hurt') || condLower.includes('ache') || condLower.includes('agony')) {
        // Higher temperature for variability (wincing), higher exaggeration for distress
        exaggeration = Math.min(0.5, exaggeration + 0.2);
        temperature = Math.min(0.95, temperature + 0.15);
        // More focused (less random words), but variable pitch/tone
        top_p = 0.9;
    }

    // Anxiety / Panic / Fear
    else if (condLower.includes('anxi') || condLower.includes('panic') || emotionLower.includes('fear') || emotionLower.includes('scared')) {
        // Stuttering/fast pace often comes from high temp
        exaggeration = Math.min(0.6, exaggeration + 0.25);
        temperature = Math.min(1.0, temperature + 0.2);
        // More erratic choice of phonemes
        top_p = 0.98;
        repetition_penalty = 1.1; // Allow some repetition (stuttering)
    }

    // Anger / Frustration
    else if (emotionLower.includes('angr') || emotionLower.includes('mad') || emotionLower.includes('frustrat')) {
        exaggeration = Math.min(0.5, exaggeration + 0.15);
        temperature = 0.8; // Controlled but intense
        repetition_penalty = 1.3; // Very precise, no stumbling
    }

    // --- LOW INTENSITY STATES ---

    // Depression / Sadness
    else if (emotionLower.includes('sad') || emotionLower.includes('depress') || condLower.includes('fatigue')) {
        exaggeration = Math.max(0.1, exaggeration - 0.1);
        temperature = Math.max(0.4, temperature - 0.2); // Monotone
        top_p = 0.8; // Very predictable
    }

    // Confusion / Delirium
    else if (condLower.includes('confus') || condLower.includes('dizzy') || condLower.includes('deliri')) {
        exaggeration = Math.max(0.2, exaggeration + 0.05); // Slightly weird
        temperature = Math.min(1.1, temperature + 0.3); // High variability for incoherent feel
        top_p = 0.99; // Highly random
        repetition_penalty = 1.05; // Likely to repeat words
    }

    // Respiratory Distress (Dyspnea)
    // Note: Breathiness is mostly handled by [breath] tags, but parameters help
    else if (condLower.includes('breath') || condLower.includes('dyspnea') || condLower.includes('asthma')) {
        exaggeration = Math.min(0.4, exaggeration + 0.1);
        temperature = Math.min(0.85, temperature + 0.1);
    }

    return { exaggeration, temperature, cfg, top_p, min_p, repetition_penalty, top_k };
}

/**
 * Master mapping function to get all voice params from case data
 */
export function mapCaseToVoiceParams(
    profile: PatientProfile,
    condition: string = 'neutral',
    emotionalState: string = 'neutral'
) {
    const voice = selectVoiceForPatient(profile, { condition, emotionalState });
    const params = getAdjustedParameters(voice, condition, emotionalState);

    return {
        voiceId: voice.voiceId,
        voiceName: voice.name,
        ...params
    };
}

// Export for easy access
export const ENGLISH_FEMALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'female' && v.language === 'english'
);

export const ENGLISH_MALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'male' && v.language === 'english'
);

export const ADULT_FEMALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'female' && v.ageGroup === 'adult' && v.language === 'english'
);

export const ADULT_MALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'male' && v.ageGroup === 'adult' && v.language === 'english'
);

export const YOUNG_FEMALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'female' && v.ageGroup === 'young' && v.language === 'english'
);

export const YOUNG_MALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'male' && v.ageGroup === 'young' && v.language === 'english'
);

export const ELDERLY_FEMALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'female' && v.ageGroup === 'elderly' && v.language === 'english'
);

export const ELDERLY_MALE_VOICES = Object.values(DEEPINFRA_VOICES).filter(
    v => v.sex === 'male' && v.ageGroup === 'elderly' && v.language === 'english'
);
