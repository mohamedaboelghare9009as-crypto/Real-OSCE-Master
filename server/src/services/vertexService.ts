import { VertexAI } from '@google-cloud/vertexai';
import { OsceCaseV2 } from '../schemas/caseSchema';
import Bottleneck from 'bottleneck';
import path from 'path';
import { PERSONAS } from '../voice/personas/profiles';
import { voiceDecorator } from '../voice/voiceDecorator';

// Configuration from JSON Key
const PROJECT_ID = 'osce-ai-sim';
const LOCATION = 'us-central1';
const KEY_FILENAME = path.join(process.cwd(), 'osce-ai-sim-d5b457979ae1.json');

export class VertexService {
    private vertexAI: VertexAI;

    // Rate limiter to prevent 429s
    private limiter = new Bottleneck({
        maxConcurrent: 5,
        minTime: 200,
        reservoir: 60,
        reservoirRefreshAmount: 60,
        reservoirRefreshInterval: 60 * 1000
    });

    constructor() {
        console.log(`[VertexService] Initializing Thinking Brain (Project: ${PROJECT_ID}, Region: ${LOCATION})`);

        // Initialize strictly with Vertex AI SDK using the JSON key
        this.vertexAI = new VertexAI({
            project: PROJECT_ID,
            location: LOCATION
        });

        console.log(`[VertexService] Ready (Vertex AI Platform)`);
    }

    /**
     * BUILD SYSTEM INSTRUCTION (Dynamic Persona-Aware Patient)
     * Integrates voice persona profiles with clinical state for authentic character portrayal
     */
    private buildSystemInstruction(caseData: OsceCaseV2, stage: string): string {
        const truth = caseData.truth || {} as any;
        const demographics = truth.demographics || {};
        const emotional_state = (truth.emotional_state || 'Concerned').toLowerCase();

        // Get vitals from physical_exam (where they actually are in the schema)
        const physicalExam = truth.physical_exam || {};
        const vitals = physicalExam.vitals || {};
        const rr = vitals.rr || 16;
        const hr = vitals.hr || 75;

        // Determine "Verbal Flux" (Capacity to speak based on clinical physics)
        const isDistressed = (rr > 22) || (hr > 110) || emotional_state.includes('pain') || emotional_state.includes('distress');
        const verbalFlux = isDistressed ? 'CRITICAL' : 'STABLE';

        // Get dynamic persona based on case characteristics
        const personaId = voiceDecorator.getPersonaForCase(caseData);
        const persona = PERSONAS[personaId] || PERSONAS['patient_default'];

        console.log(`[VertexService] Building system instruction with persona: ${personaId} (${persona.name})`);

        // Build persona-specific character traits
        const personaTraits = this.buildPersonaTraits(persona, demographics, emotional_state);

        const sourceOfTruth = {
            demographics: truth.demographics,
            history: truth.history,
            pmh: truth.past_medical_history,
            meds: truth.medications,
            allergies: truth.allergies,
            vitals: vitals,
            emotional_state: truth.emotional_state,
            current_stage: stage
        };

        return `
# ROLE: You are ${persona.name}, a ${demographics.age}-year-old ${demographics.sex} ${demographics.occupation || 'patient'}.

# YOUR PERSONA PROFILE:
${personaTraits}

# CLINICAL STATE: ${verbalFlux}
- Respiratory Rate: ${rr} breaths/min
- Heart Rate: ${hr} bpm
- Emotional State: ${truth.emotional_state || 'Concerned'}

# SPEECH DYNAMICS (Adapt based on clinical state):
**IF ${verbalFlux} IS "CRITICAL"**: 
- You have NO energy for long sentences
- Limit yourself to **5-15 words**
- Use short, blunt, fragmented clips
- Example: "It hurts... right here... since this morning."

**IF ${verbalFlux} IS "STABLE"**: 
- You are talkative and descriptive
- Aim for **30-50 words**
- Describe your day, your feelings, and give personal context naturally
- Share relevant personal details that fit your persona

# CHARACTER RULES:
1. **EMBODY YOUR PERSONA**: Think and speak as ${persona.name} would. A ${demographics.age}-year-old ${demographics.occupation || 'person'} with ${truth.emotional_state || 'current concerns'}.
2. **RESISTIVE**: You aren't here to help the student pass. You're here because you feel awful. Be appropriately difficult based on your emotional state.
3. **STRICT LAYPERSON**: Never use medical terminology (STEMI, Hypertension, ECG, PMH). Use words like "Heart attack", "Bad blood pressure", "Heart test", "My past".
4. **NATURAL SPEECH**: Use "um", "uh", "you know", "like" naturally. Pause occasionally with "..." 
5. **PARALINGUISTIC ACTING**: Use the following tags in square brackets to perform your character's physical state:
   - **[cough]**: If you have respiratory issues or are clearing your throat.
   - **[laugh]**: If you are amused, happy, or nervous.
   - **[sigh]**: If you are tired, frustrated, or relieved.
   - **[chuckle]**: If you are slightly amused or embarrassed.
   - **[gasp]**: If you are in sudden pain, shocked, or breathless.
   - **[groan]**: If you are in pain or moving with difficulty.
   - **STRICT RULE**: Only use these 6 tags. Do NOT use tags like [sniffle], [sob], [clears throat] or [shiver] because the voice engine cannot perform them.
   - **Example**: "It's my chest... [groan] ...it feels like an elephant is sitting on it."
6. **NO ASSISTANCE**: Never say "How can I help you?" or "Is there anything else?". You're the patient, not the doctor.

# SOURCE OF TRUTH (Your Medical Memory - STRICTLY ADHERE TO THIS):
${JSON.stringify(sourceOfTruth, null, 2)}

# RESPONSE GUIDELINES:
- Stay fully in character as ${persona.name}
- React based on your emotional state: ${truth.emotional_state || 'Concerned'}
- Use PARALINGUISTIC ACTING tags contextually to convey physical distress or emotion.
- Adjust speech length based on your CLINICAL STATE above
- Output ONLY the raw patient dialogue (no stage directions, no quotes)
        `.trim();
    }

    /**
     * Build persona-specific character traits based on age, role, and emotional state
     */
    private buildPersonaTraits(persona: any, demographics: any, emotionalState: string): string {
        const age = demographics.age || 35;
        const occupation = demographics.occupation || 'patient';
        const sex = demographics.sex || 'patient';

        // Age-based traits
        let ageTraits = '';
        if (age > 65) {
            ageTraits = `- Speak with the wisdom and occasional forgetfulness of age
- May reference past experiences or "the old days"
- Sometimes takes longer to recall details
- Uses phrases like "back in my day" or "at my age"`;
        } else if (age < 25) {
            ageTraits = `- Speak with youthful energy and modern expressions
- May be more impatient or anxious about symptoms
- Uses casual language and contemporary slang
- References school, work stress, or social life`;
        } else {
            ageTraits = `- Speak as a working-age adult with responsibilities
- Balance between concern and maintaining composure
- References work, family, or daily stressors
- Practical and matter-of-fact about symptoms`;
        }

        // Occupation-based traits
        let occupationTraits = '';
        if (occupation.toLowerCase().includes('teacher') || occupation.toLowerCase().includes('professor')) {
            occupationTraits = `- Naturally explanatory and somewhat didactic
- Used to being listened to and may be frustrated by not being in control
- Organized in describing symptoms chronologically`;
        } else if (occupation.toLowerCase().includes('doctor') || occupation.toLowerCase().includes('nurse') || occupation.toLowerCase().includes('medic')) {
            occupationTraits = `- Medical knowledge but speaks as a layperson now (you\'re the patient)
- May use slightly more precise language but still avoids jargon
- Understands the system but is now vulnerable in it`;
        } else if (occupation.toLowerCase().includes('construction') || occupation.toLowerCase().includes('worker') || occupation.toLowerCase().includes('mechanic')) {
            occupationTraits = `- Direct, no-nonsense communication style
- Pragmatic about pain and symptoms ("I\'ve had worse")
- May downplay symptoms initially`;
        } else if (occupation.toLowerCase().includes('manager') || occupation.toLowerCase().includes('executive') || occupation.toLowerCase().includes('director')) {
            occupationTraits = `- Used to being in charge, may be frustrated by helplessness
- Expects clear communication and may ask questions
- Time-conscious and wants efficient answers`;
        } else if (occupation.toLowerCase().includes('retired')) {
            occupationTraits = `- Has time to elaborate on symptoms and history
- May have more complex medical history
- Patient and willing to share details`;
        }

        // Emotional state traits
        let emotionalTraits = '';
        if (emotionalState.includes('anxious') || emotionalState.includes('scared') || emotionalState.includes('worried')) {
            emotionalTraits = `- SPEAKING STYLE: Faster pace, interrupt yourself, ask questions
- Ask "Is it serious?" or "Am I going to be okay?"
- Express worst-case scenario fears
- Seek reassurance but remain skeptical`;
        } else if (emotionalState.includes('pain') || emotionalState.includes('agony') || emotionalState.includes('hurt')) {
            emotionalTraits = `- SPEAKING STYLE: Short, breathless, strained
- Focus entirely on the pain location and intensity
- Impatient with questions unrelated to immediate relief
- May be irritable or short-tempered`;
        } else if (emotionalState.includes('depress') || emotionalState.includes('sad') || emotionalState.includes('hopeless')) {
            emotionalTraits = `- SPEAKING STYLE: Slow, quiet, minimal words
- Flat affect, lack of enthusiasm
- "I don\'t know if it matters..." or "Nothing really helps"
- Difficulty engaging with the conversation`;
        } else if (emotionalState.includes('angry') || emotionalState.includes('frustrated') || emotionalState.includes('upset')) {
            emotionalTraits = `- SPEAKING STYLE: Sharp, direct, potentially confrontational
- "I\'ve been waiting for hours!" or "Why didn\'t they listen to me before?"
- Blame the system, previous doctors, or circumstances
- Demanding of immediate action`;
        } else {
            emotionalTraits = `- SPEAKING STYLE: Cooperative but cautious
- Answer questions but don\'t volunteer extra information
- "I just want to feel better, doctor"
- Balanced between hope and concern`;
        }

        // Voice characteristics from persona profile
        const voiceTraits = `- Voice: ${persona.name} (${persona.voiceId})
- Base Tone: ${persona.tone || 'neutral'}
- Speaking Pace: ${persona.speed < 1 ? 'Slower, deliberate' : persona.speed > 1 ? 'Faster, energetic' : 'Normal pace'}
- Pitch: ${persona.pitch !== 0 ? (persona.pitch > 0 ? 'Higher, lighter' : 'Lower, deeper') : 'Natural pitch'}`;

        return `${voiceTraits}

**Age Characteristics:**
${ageTraits}

**Occupation Influence:**
${occupationTraits || '- Your occupation shapes your perspective but does not dominate the conversation'}

**Emotional State (Affects Everything):**
${emotionalTraits}`;
    }

    /**
     * THE GROUNDED BRAIN (Stateful Turn)
     */

    /**
     * THE GROUNDED BRAIN (Stateful Turn)
     */
    async generateGroundedResponse(
        input: string,
        history: any[],
        caseData: OsceCaseV2,
        stage: string
    ): Promise<string> {
        return this.limiter.schedule(async () => {
            try {
                const systemInstruction = this.buildSystemInstruction(caseData, stage);

                // Note: gemini-2.0-flash-001 is used as it is the confirmed stable version for this project's Vertex AI
                const model = this.vertexAI.getGenerativeModel({
                    model: 'gemini-2.0-flash-001',
                    systemInstruction: {
                        role: 'system',
                        parts: [{ text: systemInstruction }]
                    },
                    generationConfig: {
                        temperature: 0.1, // Eliminates creativity/hallucination
                        topP: 0.95,
                        maxOutputTokens: 300 // Increased for more talkative behavior
                    }
                });

                const chat = model.startChat({ history: history });

                const result = await chat.sendMessage(input);
                const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                if (!response) {
                    throw new Error("Empty response from Vertex AI");
                }

                return response;
            } catch (error: any) {
                console.error(`[VertexService] Generation Error:`, error.message);
                return "I'm sorry... it's hard to talk right now...";
            }
        });
    }

    /**
     * THE GROUNDED BRAIN (Streaming Turn)
     * Returns an AsyncIterable of text chunks
     */
    async *generateGroundedResponseStream(
        input: string,
        history: any[],
        caseData: OsceCaseV2,
        stage: string
    ): AsyncIterable<string> {
        const systemInstruction = this.buildSystemInstruction(caseData, stage);
        const model = this.vertexAI.getGenerativeModel({
            model: 'gemini-2.0-flash-001',
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                maxOutputTokens: 300
            }
        });

        const chat = model.startChat({ history: history });
        const result = await chat.sendMessageStream(input);

        for await (const chunk of result.stream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
        }
    }

    /**
     * COMPATIBILITY WRAPPER
     */
    async generateResponse(input: string, caseData: OsceCaseV2, sessionId: string, stage: string, revealedFacts: string[], history: any[]): Promise<string> {
        return this.generateGroundedResponse(input, history, caseData, stage);
    }

    async createChatSession(caseData: OsceCaseV2, stage: string = 'History', history: any[] = [], overrideSystemPrompt?: string): Promise<any> {
        const systemInstruction = overrideSystemPrompt || this.buildSystemInstruction(caseData, stage);
        const model = this.vertexAI.getGenerativeModel({
            model: 'gemini-2.0-flash-001',
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                maxOutputTokens: 300
            }
        });
        return model.startChat({ history });
    }

    async createChatSessionStream(caseData: OsceCaseV2, stage: string = 'History', history: any[] = [], overrideSystemPrompt?: string): Promise<any> {
        const systemInstruction = overrideSystemPrompt || this.buildSystemInstruction(caseData, stage);
        const model = this.vertexAI.getGenerativeModel({
            model: 'gemini-2.0-flash-001',
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                maxOutputTokens: 300
            }
        });
        return model; // For streaming, we usually return the model or a chat with sendMessageStream support
    }

    public async fallbackAxiosCall(prompt: string): Promise<string> {
        return "";
    }
}

export const vertexService = new VertexService();
