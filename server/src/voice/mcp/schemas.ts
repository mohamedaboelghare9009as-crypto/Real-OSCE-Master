
export interface VoiceInput {
    audioBase64?: string;
    text?: string;
    sessionId: string;
    speaker: 'student';
}

export interface VoiceActionResponse {
    speaker: 'patient' | 'nurse' | 'examiner';
    text: string;
    action?: string;
    allowed: boolean;
    confidence?: number;
}

export interface ASRResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export type VoiceStyle =
    | 'neutral'
    | 'anxious'
    | 'pain'
    | 'professional'
    | 'reassuring'
    | 'urgent'
    | 'calm'
    | 'friendly';

export interface PatientDemographics {
    age: number;
    sex: 'male' | 'female' | 'other';
    name?: string;
}

export interface VoiceParameters {
    speed: number;
    pitch: number;
    exaggeration: number;
    pacing: number;
    warmth: number;
    clarity: number;
    energy: number;
}

export interface VoicePersona {
    id: string;
    name: string;
    role: 'patient' | 'nurse';
    voiceId: string;
    tone: 'neutral' | 'pain' | 'anxious' | 'professional';
    speed: number;
    pitch: number;
    exaggeration?: number;
    pacing?: number;
    style?: VoiceStyle;
}

export interface VoiceConfiguration {
    voiceId: string;
    speed: number;
    pitch: number;
    flow: number;
    mood: VoiceStyle;
    parameters: VoiceParameters;
}

export interface DynamicVoiceRequest {
    demographics: PatientDemographics;
    conditions: string[];
    emotionalState?: string;
    context?: string;
}
