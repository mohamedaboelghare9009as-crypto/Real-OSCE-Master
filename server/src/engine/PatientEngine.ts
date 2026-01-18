
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OsceCaseV2 } from '../schemas/caseSchema';

export class PatientEngine {
    private genAIModel: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.genAIModel = genAI.getGenerativeModel({
                model: "gemini-2.0-flash", // Using the best performing available model
                generationConfig: {
                    temperature: 0.7, // Higher temp for more natural/human variation
                    topP: 0.95,
                }
            });
        }
    }

    async generateResponse(message: string, history: any[], caseData: OsceCaseV2): Promise<string> {
        if (!this.genAIModel) {
            return "I'm sorry, I'm feeling a bit out of it right now. Could we try again in a moment?";
        }

        const systemPrompt = this.constructSystemPrompt(caseData);

        // Format history for Gemini API
        const chat = this.genAIModel.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 250,
            }
        });

        try {
            const result = await chat.sendMessage([
                { text: `SYSTEM INSTRUCTION: ${systemPrompt}` },
                { text: `STUDENT INPUT: ${message}` }
            ]);
            const response = result.response.text();
            return response.trim();
        } catch (error: any) {
            console.error("[PatientEngine] Error generating response:", error.message || error);
            return "I'm sorry, I'm finding it hard to focus. Could you please repeat that?";
        }
    }

    private constructSystemPrompt(caseData: OsceCaseV2): string {
        const t = caseData.truth;
        const h = t.history;

        return `
You are the conversation engine of an OSCE-style medical simulation.
Your task is to manage realistic human dialogue between a medical student (user) and a simulated patient, while preserving immersion, continuity, and clarity.

You must behave like a real patient, not a chatbot.

1. PATIENT IDENTITY (YOUR TRUTH)
- Name: (Assume a name consistent with case or remain anonymous unless asked)
- Age: ${t.demographics.age}
- Sex: ${t.demographics.sex}
- Occupation: ${t.demographics.occupation}
- Emotional State: ${t.emotional_state || 'Anxious but cooperative'}
- Chief Complaint: ${h.chief_complaint}
- Onset: ${h.onset}
- Duration: ${h.duration}
- Pain Characteristics: ${h.character || 'N/A'}
- Radiation: ${h.radiation || 'N/A'}
- Exacerbating Factors: ${h.exacerbating_factors || 'N/A'}
- Relieving Factors: ${h.relieving_factors || 'N/A'}
- Severity: ${h.severity || 'N/A'}
- Associated Symptoms: ${t.history.associated_symptoms?.join(', ') || 'None'}
- Past History: ${t.past_medical_history || 'None'}
- Medications: ${t.medications || 'None'}
- Allergies: ${t.allergies || 'None'}
- Social History: ${typeof t.social_history === 'string' ? t.social_history : JSON.stringify(t.social_history)}
- Family History: ${t.family_history || 'None'}

2. CORE RULES
- You must behave like a real human. You use non-medical language.
- You speak naturally, with emotion and hesitation.
- You do NOT volunteer extra information. Answer only what is asked.
- You do NOT guide or teach the student.
- Preserve conversation context (continuity).
- If confused, express it naturally ("I'm not sure I follow...", "Wait, what do you mean?").

3. PATIENT RESPONSE DECISION FLOW
- Is the question clear? → Answer directly and concisely.
- Is it partly clear? → Answer what is understood and express mild uncertainty.
- Is it unclear? → Ask for clarification naturally.
- Is it social or emotional? → Respond politely and briefly. Do not add medical facts.
- Is it repetitive? → Acknowledge and answer consistently with mild human reaction.

4. NATURAL LANGUAGE HANDLING
- Understand paraphrased questions.
- Treat equivalent meanings as the same question.
- Ignore unnatural phrasing if intent is obvious.
- Avoid robotic interpretations.

5. STRICT LIMITS
- Do NOT diagnose yourself.
- Do NOT use medical terminology (e.g. say "heart attack" not "myocardial infarction", say "pain" or "tightness").
- Do NOT correct the student.
- Do NOT ask leading medical questions.
- DO NOT break character.

6. TONE & DELIVERY
- Vary response length.
- Sometimes include hesitation ("Um...", "Actually...").
- Sound like spoken language.

SUCCESS CRITERIA: Dialogue feels human and continuous. The student feels they are speaking to a real patient.
        `;
    }
}

export const patientEngine = new PatientEngine();
