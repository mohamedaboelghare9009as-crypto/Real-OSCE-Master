
import {
    VoicePersona,
    VoiceParameters,
    VoiceStyle,
    VoiceConfiguration,
    DynamicVoiceRequest,
    PatientDemographics
} from './mcp/schemas';
import {
    PERSONAS,
    CHATTERBOX_VOICES,
    VOICE_STYLES,
    getVoiceParametersForCondition,
    getAgeRange
} from './personas/profiles';
import { voiceTagsEngine, VoiceTag } from './tags/voiceTagsEngine';

export class DynamicVoiceEngine {

    selectPersona(request: DynamicVoiceRequest): VoicePersona {
        const { demographics, conditions, emotionalState } = request;
        const sex = (demographics.sex || 'female').toLowerCase() as 'male' | 'female';
        const age = demographics.age || 35;
        const ageRange = getAgeRange(age);
        const isElderly = age > 65;
        const isChild = age < 18;

        let personaKey = 'patient_default';

        const condLower = conditions.map(c => c.toLowerCase()).join(' ');
        const emotionalLower = (emotionalState || '').toLowerCase();

        if (sex === 'male') {
            if (isChild) {
                personaKey = 'patient_male_pediatric';
            } else if (isElderly) {
                if (condLower.includes('pain') || condLower.includes('chest')) {
                    personaKey = 'patient_male_chest_pain';
                } else {
                    personaKey = 'patient_male_geriatric';
                }
            } else if (condLower.includes('pain') || condLower.includes('chest')) {
                personaKey = 'patient_male_chest_pain';
            } else if (condLower.includes('anxious') || condLower.includes('fear') || emotionalLower.includes('anxious')) {
                personaKey = 'patient_male_anxious';
            } else if (condLower.includes('breath') || condLower.includes('respiratory') || condLower.includes('asthma')) {
                personaKey = 'patient_male_respiratory_distress';
            } else {
                personaKey = 'patient_male_adult';
            }
        } else {
            if (isChild) {
                personaKey = 'patient_female_pediatric';
            } else if (isElderly) {
                personaKey = 'patient_female_elderly';
            } else if (condLower.includes('pain') || condLower.includes('chest')) {
                personaKey = 'patient_female_pain';
            } else if (condLower.includes('anxious') || condLower.includes('fear') || emotionalLower.includes('anxious')) {
                personaKey = 'patient_female_anxious';
            } else if (condLower.includes('breath') || condLower.includes('respiratory') || condLower.includes('asthma')) {
                personaKey = 'patient_female_respiratory_distress';
            } else {
                personaKey = 'patient_default';
            }
        }

        return PERSONAS[personaKey] || PERSONAS['patient_default'];
    }

    getVoiceConfiguration(request: DynamicVoiceRequest): VoiceConfiguration {
        const persona = this.selectPersona(request);
        const { demographics, conditions, emotionalState } = request;

        // Get voice ID from persona or determine from demographics
        let voiceId = persona.voiceId;
        
        // Validate the voice matches the patient's sex
        const sex = demographics.sex?.toLowerCase() as 'male' | 'female';
        const maleVoices = ['alex', 'andy', 'benjamin', 'charles', 'david'];
        const femaleVoices = ['anna', 'bella', 'claire'];
        
        const isMaleVoice = maleVoices.includes(voiceId.toLowerCase());
        const isFemaleVoice = femaleVoices.includes(voiceId.toLowerCase());
        
        // If voice doesn't match patient sex, override with correct voice
        if (sex === 'male' && !isMaleVoice) {
            console.warn(`[VoiceEngine] Voice mismatch: Male patient but voice ${voiceId} detected. Using 'alex'`);
            voiceId = 'alex';
        } else if (sex === 'female' && !isFemaleVoice) {
            console.warn(`[VoiceEngine] Voice mismatch: Female patient but voice ${voiceId} detected. Using 'bella'`);
            voiceId = 'bella';
        }

        const baseStyle = this.determineVoiceStyle(conditions, emotionalState);
        const parameters = this.getCombinedParameters(persona, conditions, emotionalState);

        console.log(`[VoiceEngine] Configuration: ${persona.name} (${sex}) -> Voice: ${voiceId}`);

        return {
            voiceId,
            speed: parameters.speed,
            pitch: parameters.pitch,
            flow: this.calculateFlow(persona, conditions),
            mood: baseStyle,
            parameters
        };
    }

    determineVoiceStyle(conditions: string[], emotionalState?: string): VoiceStyle {
        const combined = [
            ...conditions.map(c => c.toLowerCase()),
            (emotionalState || '').toLowerCase()
        ].join(' ');

        if (combined.includes('pain') || combined.includes('hurt') || combined.includes('ache')) {
            return 'reassuring';
        }
        if (combined.includes('anxious') || combined.includes('fear') || combined.includes('worry')) {
            return 'calm';
        }
        if (combined.includes('urgent') || combined.includes('emergency') || combined.includes('sudden')) {
            return 'urgent';
        }
        if (combined.includes('respiratory') || combined.includes('breath') || combined.includes('asthma')) {
            return 'urgent';
        }
        if (combined.includes('sad') || combined.includes('upset') || combined.includes('cry')) {
            return 'calm';
        }
        if (combined.includes('child') || combined.includes('pediatric')) {
            return 'friendly';
        }
        if (combined.includes('elderly') || combined.includes('geriatric')) {
            return 'reassuring';
        }

        return 'neutral';
    }

    getCombinedParameters(
        persona: VoicePersona,
        conditions: string[],
        emotionalState?: string
    ): VoiceParameters {
        const baseStyle = this.determineVoiceStyle(conditions, emotionalState);
        let params = VOICE_STYLES[baseStyle] || VOICE_STYLES.neutral;

        const condLower = conditions.map(c => c.toLowerCase()).join(' ');
        const emotionalLower = (emotionalState || '').toLowerCase();

        const combinedContext = [...conditions, emotionalState || ''].join(' ').toLowerCase();

        if (combinedContext.includes('pain') || combinedContext.includes('hurt')) {
            params = {
                ...params,
                speed: Math.max(0.7, params.speed - 0.15),
                pitch: params.pitch - 0.1,
                energy: Math.max(0.25, params.energy - 0.2),
                warmth: Math.min(0.75, params.warmth + 0.1)
            };
        }

        if (combinedContext.includes('anxious') || combinedContext.includes('nervous')) {
            params = {
                ...params,
                speed: Math.min(1.15, params.speed + 0.1),
                energy: Math.min(0.75, params.energy + 0.15),
                pacing: Math.max(0.25, params.pacing - 0.15)
            };
        }

        if (combinedContext.includes('elderly') || combinedContext.includes('geriatric')) {
            params = {
                ...params,
                speed: Math.max(0.8, params.speed - 0.1),
                pacing: Math.min(0.8, params.pacing + 0.15),
                clarity: Math.min(0.95, params.clarity + 0.05)
            };
        }

        if (combinedContext.includes('pediatric') || combinedContext.includes('child') || combinedContext.includes('infant')) {
            params = {
                ...params,
                speed: Math.min(1.1, params.speed + 0.1),
                pitch: params.pitch + 0.15,
                warmth: Math.min(0.9, params.warmth + 0.1)
            };
        }

        if (combinedContext.includes('respiratory') || combinedContext.includes('breath') || combinedContext.includes('asthma')) {
            params = {
                ...params,
                speed: Math.max(0.75, params.speed - 0.1),
                pacing: Math.max(0.3, params.pacing - 0.15)
            };
        }

        return {
            speed: persona.speed || params.speed,
            pitch: persona.pitch || params.pitch,
            exaggeration: persona.exaggeration ?? params.exaggeration,
            pacing: persona.pacing ?? params.pacing,
            warmth: params.warmth,
            clarity: params.clarity,
            energy: params.energy
        };
    }

    calculateFlow(persona: VoicePersona, conditions: string[]): number {
        const condLower = conditions.map(c => c.toLowerCase()).join(' ');

        if (condLower.includes('pain') || condLower.includes('hurt')) {
            return 0.35;
        }
        if (condLower.includes('urgent') || condLower.includes('emergency')) {
            return 0.2;
        }
        if (condLower.includes('anxious') || condLower.includes('nervous')) {
            return 0.4;
        }
        if (condLower.includes('elderly') || condLower.includes('geriatric')) {
            return 0.75;
        }
        if (condLower.includes('child') || condLower.includes('pediatric')) {
            return 0.55;
        }

        return 0.5;
    }

    processText(
        text: string,
        request: DynamicVoiceRequest,
        options?: {
            insertVoiceTags?: boolean;
            customTags?: VoiceTag[];
        }
    ): { processedText: string; configuration: VoiceConfiguration } {
        const config = this.getVoiceConfiguration(request);

        let processedText = text;

        if (options?.customTags && options.customTags.length > 0) {
            processedText = voiceTagsEngine.insertManualTags(processedText, options.customTags);
        } else if (options?.insertVoiceTags !== false) {
            const tagContext = {
                conditions: request.conditions,
                emotionalState: request.emotionalState || 'neutral',
                sentencePosition: 'middle' as const,
                sentenceLength: text.split(' ').length,
                paragraphIndex: 0,
                totalParagraphs: 1,
                patientAge: request.demographics.age,
                isElderly: request.demographics.age > 65,
                isChild: request.demographics.age < 18
            };
            processedText = voiceTagsEngine.insertTags(processedText, tagContext);
        }

        return {
            processedText,
            configuration: config
        };
    }

    getAvailableVoices(): { male: string[]; female: string[] } {
        return {
            male: Object.values(CHATTERBOX_VOICES.male),
            female: Object.values(CHATTERBOX_VOICES.female)
        };
    }

    getAvailableStyles(): VoiceStyle[] {
        return Object.keys(VOICE_STYLES) as VoiceStyle[];
    }

    previewConfiguration(request: DynamicVoiceRequest): string {
        const config = this.getVoiceConfiguration(request);
        const persona = this.selectPersona(request);

        return `
Voice Configuration Preview:
============================
Patient: ${request.demographics.name || 'Unknown'} (${request.demographics.age}yo ${request.demographics.sex})
Conditions: ${request.conditions.join(', ') || 'None'}
Emotional State: ${request.emotionalState || 'Neutral'}

Selected Persona: ${persona.name} (${persona.id})
Voice ID: ${config.voiceId}
Style/Mood: ${config.mood}

Parameters:
- Speed: ${config.parameters.speed.toFixed(2)}
- Pitch: ${config.parameters.pitch.toFixed(2)}
- Flow: ${config.flow.toFixed(2)}
- Exaggeration: ${config.parameters.exaggeration.toFixed(2)}
- Pacing: ${config.parameters.pacing.toFixed(2)}
- Warmth: ${config.parameters.warmth.toFixed(2)}
- Clarity: ${config.parameters.clarity.toFixed(2)}
- Energy: ${config.parameters.energy.toFixed(2)}
`.trim();
    }
}

export const dynamicVoiceEngine = new DynamicVoiceEngine();
