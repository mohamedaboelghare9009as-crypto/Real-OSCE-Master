
export interface VoiceInput {
    audioBase64?: string; // If handling raw audio
    text?: string;        // If ASR is done client-side or mocked
    sessionId: string;
    speaker: 'student';
}

export interface VoiceActionResponse {
    speaker: 'patient' | 'nurse' | 'examiner';
    text: string;           // The text to be spoken
    action?: string;        // The underlying action (e.g., "reveal_symptom")
    allowed: boolean;
    confidence?: number;
}

export interface ASRResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export interface VoicePersona {
    id: string;
    name: string;
    role: 'patient' | 'nurse';
    voiceId: string; // e.g., Google TTS voice name
    tone: 'neutral' | 'pain' | 'anxious' | 'professional';
    speed: number;
    pitch: number;
}
