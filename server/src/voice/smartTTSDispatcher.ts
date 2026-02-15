/**
 * Smart TTS Dispatcher
 * Unified entry point for all TTS calls with intelligent voice selection
 */

import { ttsService } from '../services/ttsService';
import { extractPatientProfile, TTSVoiceProfile, shouldUseVoiceTags } from './patientProfileExtractor';
import {
    DeepInfraVoice,
    selectVoiceForPatient,
    getAdjustedParameters,
    PatientDemographics,
    isValidVoiceId,
    getVoiceById
} from './deepinfraChatterboxConfig';
import { voiceTagsEngine, VoiceTag } from './tags/voiceTagsEngine';
import { ttsCache } from './ttsCache';

export interface SmartTTSOptions {
    voiceId?: string;
    exaggeration?: number;
    temperature?: number;
    cfg?: number; // Classifier-Free Guidance (0-1) for paralinguistic tag processing
    insertVoiceTags?: boolean;
    isNurse?: boolean;
}

export interface SmartTTSResult {
    audioDataUrl: string;
    voiceInfo: {
        voiceId: string;
        voiceName: string;
        exaggeration: number;
        temperature: number;
        tags: VoiceTag[];
        profile: TTSVoiceProfile;
    };
}

/**
 * Intelligently synthesizes text with patient-aware voice selection
 * Automatically selects voice based on patient demographics and conditions
 * Adds appropriate voice tags for realism
 * 
 * @param text - The text to synthesize
 * @param caseData - The case data containing patient information
 * @param options - Optional configuration (isNurse, voiceId, etc.)
 * @returns Audio data URL and voice information
 */
export async function smartSynthesize(
    text: string,
    caseData: any,
    options: SmartTTSOptions = {}
): Promise<SmartTTSResult> {

    // Extract patient profile from case data
    const profile = extractPatientProfile(caseData);
    const isNurse = options.isNurse || false;

    console.log(`\n[SmartTTS] === Synthesis Request ===`);
    console.log(`[SmartTTS] Speaker: ${isNurse ? 'NURSE' : 'PATIENT'}`);
    console.log(`[SmartTTS] Patient: ${profile.demographics.name || 'Unknown'} (${profile.demographics.age}yo ${profile.demographics.sex})`);
    console.log(`[SmartTTS] Conditions: ${profile.conditions.join(', ') || 'None'}`);
    console.log(`[SmartTTS] Emotional State: ${profile.emotionalState}`);
    console.log(`[SmartTTS] Clinical Context: ${profile.clinicalContext.join(', ') || 'Neutral'}`);

    // Nurse voice selection - always use professional female voice
    if (isNurse) {
        console.log(`[SmartTTS] Using nurse voice: af_jessica (professional)`);

        // Clean any voice tags from nurse text
        const cleanText = text.replace(/\[[^\]]*\]/gi, '').trim();

        const result = await ttsService.synthesize(
            cleanText,
            'af_jessica', // Professional female voice for nurse
            0.3, // Low exaggeration for professionalism
            0.78, // Moderate temperature
            0.5, // Standard cfg
            'wav',
            { top_p: 0.95, min_p: 0, repetition_penalty: 1.2, top_k: 1000 }
        );

        console.log(`[SmartTTS] === Nurse Synthesis Complete ===\n`);

        return {
            audioDataUrl: result,
            voiceInfo: {
                voiceId: 'af_jessica',
                voiceName: 'Jessica',
                exaggeration: 0.3,
                temperature: 0.78,
                tags: [], // No tags for nurse
                profile
            }
        };
    }

    // Patient voice selection
    let voiceId: string;
    let voice: DeepInfraVoice | undefined;

    // Check for forced voice override
    if (options.voiceId && isValidVoiceId(options.voiceId)) {
        voiceId = options.voiceId;
        voice = getVoiceById(voiceId); // Get the actual config for this voice
        console.log(`[SmartTTS] Using forced voice: ${voiceId} (${voice?.name || 'Unknown'})`);
    } else {
        // Auto-select based on patient profile
        voice = selectVoiceForPatient(
            { age: profile.demographics.age, sex: profile.demographics.sex },
            { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
        );
        voiceId = voice.voiceId;
        console.log(`[SmartTTS] Auto-selected voice: ${voiceId} (${voice.name})`);
    }

    // Validate voice matches patient sex (only if not forced auto-selection)
    if (!options.voiceId && voice && voice.sex !== profile.demographics.sex) {
        console.warn(`[SmartTTS] SEX MISMATCH: ${profile.demographics.sex} patient but ${voice.sex} voice selected!`);
        // Auto-correct
        const correctedVoice = selectVoiceForPatient(
            { age: profile.demographics.age, sex: profile.demographics.sex },
            { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
        );
        voiceId = correctedVoice.voiceId;
        voice = correctedVoice;
        console.log(`[SmartTTS] Corrected to: ${voiceId} (${voice.name})`);
    }

    // Get adjusted parameters based on condition and emotional state
    const { exaggeration, temperature, cfg, top_p, min_p, repetition_penalty, top_k } = getAdjustedParameters(
        voice || selectVoiceForPatient(
            { age: profile.demographics.age, sex: profile.demographics.sex },
            { condition: 'neutral' }
        ),
        profile.conditions[0] || 'neutral',
        profile.emotionalState
    );

    console.log(`[SmartTTS] Voice characteristics: ${voice?.characteristics.join(', ')}`);
    console.log(`[SmartTTS] Params: exagg=${exaggeration.toFixed(2)}, temp=${temperature.toFixed(2)}, cfg=${cfg}, top_p=${top_p}, rep_pen=${repetition_penalty}`);

    // Process text with voice tags
    let processedText = text;
    const tagsUsed: VoiceTag[] = [];

    // Determine if we should use voice tags
    const shouldUseTags = options.insertVoiceTags !== false; // Default to true

    if (shouldUseTags && !isNurse) {
        // First check if Gemini (or the LLM) already provided acting tags
        const tagRegex = /\[(cough|laugh|sigh|chuckle|gasp|groan)\]/gi;
        const existingTags = text.match(tagRegex);

        if (existingTags && existingTags.length > 0) {
            console.log(`[SmartTTS] Detected ${existingTags.length} embedded tags from LLM: ${existingTags.join(', ')}`);
            processedText = text;
            existingTags.forEach(tag => {
                if (!tagsUsed.includes(tag.toLowerCase() as VoiceTag)) {
                    tagsUsed.push(tag.toLowerCase() as VoiceTag);
                }
            });
        } else {
            // No tags from LLM, apply auto-insertion as fallback
            const tagContext = {
                conditions: profile.conditions,
                emotionalState: profile.emotionalState,
                sentencePosition: 'middle' as const,
                sentenceLength: text.split(' ').length,
                paragraphIndex: 0,
                totalParagraphs: 1,
                patientAge: profile.demographics.age,
                isElderly: profile.demographics.age > 65,
                isChild: profile.demographics.age < 18
            };

            processedText = voiceTagsEngine.insertTags(text, tagContext);

            // Extract which tags were used
            const matches = processedText.match(tagRegex);
            if (matches) {
                matches.forEach(tag => {
                    if (!tagsUsed.includes(tag.toLowerCase() as VoiceTag)) {
                        tagsUsed.push(tag.toLowerCase() as VoiceTag);
                    }
                });
            }

            if (tagsUsed.length > 0) {
                console.log(`[SmartTTS] Auto-inserted tags: ${tagsUsed.join(', ')}`);
            }
        }
    }

    // Synthesize with patient-aware settings
    console.log(`[SmartTTS] >>> ABOUT TO SYNTHESIZE with voiceId: "${voiceId}"`);
    console.log(`[SmartTTS] >>> Voice object: ${voice ? voice.voiceId + ' (' + voice.name + ')' : 'UNDEFINED'}`);

    // Try cache first for short common phrases
    const cacheHint = processedText.trim().length < 50;
    if (cacheHint) {
        try {
            const cached = await ttsCache.get(processedText, voiceId);
            if (cached.cacheHit) {
                console.log(`[SmartTTS] === Cache Hit - Instant Response ===\n`);
                return {
                    audioDataUrl: cached.audioDataUrl,
                    voiceInfo: {
                        voiceId,
                        voiceName: voice?.name || 'Custom',
                        exaggeration: exaggeration,
                        temperature: temperature,
                        tags: tagsUsed,
                        profile
                    }
                };
            }
        } catch (error) {
            console.log(`[SmartTTS] Cache lookup failed, proceeding with synthesis`);
        }
    }

    const result = await ttsService.synthesize(
        processedText,
        voiceId,
        options.exaggeration ?? exaggeration,
        options.temperature ?? temperature,
        options.cfg ?? cfg ?? 0.5,
        'wav', // WAV is 35.7% faster than PCM/MP3
        {
            top_p,
            min_p,
            repetition_penalty,
            top_k
        }
    );

    // Auto-populate cache for short phrases (future speedup)
    if (cacheHint) {
        try {
            await ttsCache.set(processedText, voiceId, result);
            console.log(`[SmartTTS] Cached phrase for future use: "${processedText.substring(0, 30)}..."`);
        } catch (error) {
            console.log(`[SmartTTS] Failed to cache phrase (non-critical)`);
        }
    }

    console.log(`[SmartTTS] === Synthesis Complete ===`);
    console.log(`[SmartTTS] >>> Voice USED: "${voiceId}"`);
    console.log(`[SmartTTS] Audio Size: ${result.length} chars`);
    console.log(`[SmartTTS] Tags Used: ${tagsUsed.length > 0 ? tagsUsed.join(', ') : 'None'}\n`);

    return {
        audioDataUrl: result,
        voiceInfo: {
            voiceId,
            voiceName: voice?.name || voiceId,
            exaggeration: options.exaggeration ?? exaggeration,
            temperature: options.temperature ?? temperature,
            tags: tagsUsed,
            profile
        }
    };
}

/**
 * STREAMING VERSION of Smart Synthesize
 * Used for Turbo Mode (sentence-by-sentence orchestration)
 */
export async function* smartSynthesizeStream(
    text: string,
    caseData: any,
    options: SmartTTSOptions = {}
): AsyncIterable<Buffer> {
    const profile = extractPatientProfile(caseData);
    const isNurse = options.isNurse || false;

    // Voice Selection (Same logic as sync)
    let voice: DeepInfraVoice;
    if (options.voiceId && isValidVoiceId(options.voiceId)) {
        voice = getVoiceById(options.voiceId) || selectVoiceForPatient({ age: 35, sex: 'female' });
    } else {
        voice = selectVoiceForPatient(
            { age: profile.demographics.age, sex: profile.demographics.sex },
            { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
        );
    }

    const { exaggeration, temperature, cfg, top_p, min_p, repetition_penalty, top_k } = getAdjustedParameters(
        voice,
        profile.conditions[0] || 'neutral',
        profile.emotionalState
    );

    // Process text with voice tags (Consistency with Sync Mode)
    let processedText = text;
    const tagsUsed: VoiceTag[] = [];
    const shouldUseTags = options.insertVoiceTags !== false && !isNurse;

    if (shouldUseTags) {
        // First check if Gemini (or the LLM) already provided acting tags
        const tagRegex = /\[(cough|laugh|sigh|chuckle|gasp|groan)\]/gi;
        const existingTags = text.match(tagRegex);

        if (existingTags && existingTags.length > 0) {
            console.log(`[SmartTTS-Stream] Detected ${existingTags.length} embedded tags: ${existingTags.join(', ')}`);
            processedText = text;
            existingTags.forEach(tag => {
                if (!tagsUsed.includes(tag.toLowerCase() as VoiceTag)) {
                    tagsUsed.push(tag.toLowerCase() as VoiceTag);
                }
            });
        } else {
            // Auto-insertion fallback
            const tagContext = {
                conditions: profile.conditions,
                emotionalState: profile.emotionalState,
                sentencePosition: 'middle' as const,
                sentenceLength: text.split(' ').length,
                paragraphIndex: 0,
                totalParagraphs: 1,
                patientAge: profile.demographics.age,
                isElderly: profile.demographics.age > 65,
                isChild: profile.demographics.age < 18
            };

            processedText = voiceTagsEngine.insertTags(text, tagContext);
            const matches = processedText.match(tagRegex);
            if (matches) {
                console.log(`[SmartTTS-Stream] Auto-inserted tags: ${matches.join(', ')}`);
            }
        }
    }

    console.log(`[SmartTTS-Stream] Synthesizing: "${processedText.substring(0, 30)}..." | Voice: ${voice.voiceId}`);
    console.log(`[SmartTTS-Stream] Params: Exagg=${(options.exaggeration ?? exaggeration).toFixed(2)}, Temp=${(options.temperature ?? temperature).toFixed(2)}`);

    // Call the streaming service with PROCESSED text
    yield* ttsService.synthesizeStream(
        processedText,
        voice.voiceId,
        options.exaggeration ?? exaggeration,
        options.temperature ?? temperature,
        options.cfg ?? cfg,
        'mp3', // Faster network transfer (10x smaller)
        { top_p, min_p, repetition_penalty, top_k }
    );
}

/**
 * Quick synthesize for testing without case data
 * Uses provided demographics directly
 */
export async function quickSynthesize(
    text: string,
    age: number,
    sex: 'male' | 'female',
    conditions: string[] = [],
    emotionalState: string = 'neutral',
    options: Omit<SmartTTSOptions, 'isNurse'> = {}
): Promise<SmartTTSResult> {

    const mockCaseData = {
        truth: {
            demographics: { age, sex },
            chief_complaint: conditions[0] || '',
            emotional_state: emotionalState,
            symptoms: conditions.slice(1).map(c => ({ description: c }))
        }
    };

    return smartSynthesize(text, mockCaseData, options);
}

/**
 * Preview voice selection for a case (without synthesizing)
 * Useful for debugging voice selection logic
 */
export function previewVoiceSelection(
    caseData: any,
    isNurse: boolean = false
): string {
    const profile = extractPatientProfile(caseData);

    if (isNurse) {
        return `
Voice Preview (NURSE):
=====================
Voice: af_jessica (Jessica)
Type: Professional female
Exaggeration: 0.3 (low)
Temperature: 0.78
Voice Tags: Disabled
`.trim();
    }

    const voice = selectVoiceForPatient(
        { age: profile.demographics.age, sex: profile.demographics.sex },
        { condition: profile.conditions[0] || 'neutral', emotionalState: profile.emotionalState }
    );

    const { exaggeration, temperature, cfg } = getAdjustedParameters(
        voice,
        profile.conditions[0] || 'neutral',
        profile.emotionalState
    );

    return `
Voice Preview (PATIENT):
========================
Patient: ${profile.demographics.name || 'Unknown'} (${profile.demographics.age}yo ${profile.demographics.sex})

Selected Voice: ${voice.voiceId}
Voice Name: ${voice.name}
Sex: ${voice.sex}
Age Group: ${voice.ageGroup}
Characteristics: ${voice.characteristics.join(', ')}
Language: ${voice.language}

Conditions: ${profile.conditions.join(', ') || 'None'}
Emotional State: ${profile.emotionalState}
Clinical Context: ${profile.clinicalContext.join(', ') || 'Neutral'}

Parameters:
- Exaggeration: ${exaggeration.toFixed(2)} (base: ${voice.exaggeration})
- Temperature: ${temperature.toFixed(2)} (base: ${voice.temperature})
- CFG: ${cfg.toFixed(2)}

Voice Tags: Enabled
`.trim();
}

/**
 * Get voice recommendation for patient demographics
 */
export function getVoiceRecommendation(
    age: number,
    sex: 'male' | 'female',
    condition: string = 'neutral',
    emotionalState: string = 'neutral'
): { voice: DeepInfraVoice; reason: string } {
    const voice = selectVoiceForPatient(
        { age, sex },
        { condition, emotionalState }
    );

    const reasons: string[] = [];

    reasons.push(`Age-appropriate: ${voice.ageGroup} voice for ${age}yo patient`);
    reasons.push(`Sex-matched: ${voice.sex} voice for ${sex} patient`);

    if (voice.characteristics.some(c => ['soft', 'warm', 'gentle'].includes(c)) &&
        (condition.includes('pain') || emotionalState.includes('sad'))) {
        reasons.push('Characteristics match emotional needs');
    }

    if (voice.characteristics.some(c => ['clear', 'authoritative'].includes(c)) &&
        (condition.includes('urgent') || emotionalState.includes('anxious'))) {
        reasons.push('Characteristics match urgency/anxiety');
    }

    return {
        voice,
        reason: reasons.join('; ')
    };
}
