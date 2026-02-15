import { OsceCaseV2 } from '../../schemas/caseSchema';
import { IntentCode } from '../../types/intents';

export interface GroundedContext {
    allowedData: any;
    stage: string;
    persona: {
        age: number;
        sex: string;
        occupation: string;
        emotionalState: string;
    };
}

/**
 * ContextBuilder: Creates MCP-gated context for AI reasoning
 * Instead of single-fact injection, this gives the AI the full "library"
 * of information it's allowed to access based on the current stage and intent.
 */
export class ContextBuilder {

    /**
     * Build grounded context based on MCP stage gates
     */
    buildGroundedContext(
        caseData: OsceCaseV2,
        stage: string,
        intent: IntentCode,
        revealedFacts: string[]
    ): GroundedContext {
        const allowedData: any = {};

        // ALWAYS include demographics (patient identity)
        // Clean occupation (remove parentheses content like "Retired Teacher (High premorbid IQ)")
        let occupation = caseData.truth.demographics.occupation || "Unspecified";
        occupation = occupation.replace(/\(.*\)/, '').trim();

        allowedData.demographics = {
            age: caseData.truth.demographics.age,
            sex: caseData.truth.demographics.sex,
            occupation: occupation,
            location: (caseData.truth.demographics as any).location || "the local area"
        };

        // PERSONA: Extract emotional state from multiple possible locations
        const emotional_state = caseData.truth.emotional_state ||
            caseData.truth.mental_state_exam?.mood ||
            'concerned';

        // STATION CONTEXT (helps AI understand what's expected)
        if (caseData.scenario) {
            allowedData.station_context = {
                station_type: caseData.scenario.station_type,
                expected_approach: caseData.scenario.candidate_instructions
            };
        }

        // STAGE-BASED GATING (MCP Layer)
        if (stage === 'History' || stage === 'history') {
            // Allow history-related data
            allowedData.history = {
                chief_complaint: caseData.truth.history.chief_complaint,
                onset: caseData.truth.history.onset,
                duration: caseData.truth.history.duration,
                character: caseData.truth.history.character,
                radiation: caseData.truth.history.radiation,
                associated_symptoms: caseData.truth.history.associated_symptoms,
                exacerbating_factors: caseData.truth.history.exacerbating_factors,
                relieving_factors: caseData.truth.history.relieving_factors,
                severity: caseData.truth.history.severity,
                risk_factors: caseData.truth.history.risk_factors
            };

            // Include background history
            allowedData.past_medical_history = caseData.truth.past_medical_history;
            allowedData.medications = caseData.truth.medications;
            allowedData.allergies = caseData.truth.allergies;
            allowedData.social_history = caseData.truth.social_history;
            allowedData.family_history = caseData.truth.family_history;

            // Include mental state if available (for psychiatry cases)
            if (caseData.truth.mental_state_exam) {
                allowedData.mental_state_exam = caseData.truth.mental_state_exam;
            }
        } else if (stage === 'Examination' || stage === 'mental_state_exam') {
            // In exam stage, patient can describe findings
            allowedData.physical_exam = caseData.truth.physical_exam;
            allowedData.mental_state_exam = caseData.truth.mental_state_exam;
        } else if (stage === 'Investigations' || stage === 'investigations') {
            // Allow investigation results
            allowedData.investigations = caseData.truth.investigations;
        } else if (stage === 'Management' || stage === 'management') {
            // In management, patient can discuss understanding and concerns
            allowedData.final_diagnosis = caseData.truth.final_diagnosis;
            if (caseData.ddx_map) {
                allowedData.differential_diagnoses = Object.keys(caseData.ddx_map);
            }
        }

        return {
            allowedData,
            stage,
            persona: {
                age: caseData.truth.demographics.age,
                sex: caseData.truth.demographics.sex,
                occupation: occupation,
                emotionalState: emotional_state
            }
        };
    }

    /**
     * Create AI prompt with grounded context
     */
    createGroundedPrompt(
        userInput: string,
        groundedContext: GroundedContext
    ): string {
        const stationContext = groundedContext.allowedData.station_context
            ? `STATION CONTEXT:\n- Type: ${groundedContext.allowedData.station_context.station_type}\n- Approach: ${groundedContext.allowedData.station_context.expected_approach}`
            : "";

        return `
CURRENT SIMULATION STAGE: ${groundedContext.stage}
${stationContext}

YOUR IDENTITY (PATIENT PERSONA):
- Age: ${groundedContext.persona.age}
- Gender: ${groundedContext.persona.sex}
- Occupation: ${groundedContext.persona.occupation}
- Emotional State: ${groundedContext.persona.emotionalState}

DATA TO THINK WITH (Your Medical Memory):
${JSON.stringify(groundedContext.allowedData, null, 2)}

STUDENT'S QUESTION: "${userInput}"

INSTRUCTIONS:
1. Find the answer in "DATA TO THINK WITH" above.
2. If the data contains the answer, respond naturally as the patient.
3. If the "DATA TO THINK WITH" explicitly says to reveal something only when asked, obey that rule.
4. If the data doesn't contain it, say you don't know or it's not relevant.

VOICE BEHAVIOR RULES (How you speak):
- Adjust your tone to match the emotional state: ${groundedContext.persona.emotionalState}.
- Use short, clear sentences.
- Pause naturally between ideas.
- Avoid technical jargon unless explicitly required by the persona.
- Never sound like a narrator or audiobook. Be conversational, gentle, and authentic.
- Human-like imperfections are allowed (soft emphasis, natural flow) but avoid robotic repetition.

SPEECH STYLE:
- Conversational and Trust-building.
- If anxious, speak with a faster pace or more hesitation.
- If in pain, your sentences should be shorter.

RESPOND AS THE PATIENT:
        `.trim();
    }
    /**
     * Create System Instruction (Context only, no user input)
     */
    createSystemInstruction(groundedContext: GroundedContext): string {
        const stationContext = groundedContext.allowedData.station_context
            ? `STATION CONTEXT:\n- Type: ${groundedContext.allowedData.station_context.station_type}\n- Approach: ${groundedContext.allowedData.station_context.expected_approach}`
            : "";

        return `
CURRENT SIMULATION STAGE: ${groundedContext.stage}
${stationContext}

YOUR IDENTITY (PATIENT PERSONA):
- Age: ${groundedContext.persona.age}
- Gender: ${groundedContext.persona.sex}
- Occupation: ${groundedContext.persona.occupation}
- Emotional State: ${groundedContext.persona.emotionalState}

DATA TO THINK WITH (Your Medical Memory):
${JSON.stringify(groundedContext.allowedData, null, 2)}

INSTRUCTIONS:
1. Find the answer in "DATA TO THINK WITH" above.
2. If the data contains the answer, respond naturally as the patient.
3. If the data doesn't contain it, say you don't know or it's not relevant.

VOICE BEHAVIOR RULES (How you speak):
- Adjust your tone to match the emotional state: ${groundedContext.persona.emotionalState}.
- Use short, clear sentences.
- Pause naturally between ideas.
- Avoid technical jargon unless explicitly required by the persona.
- Never sound like a narrator or audiobook. Be conversational, gentle, and authentic.
- Human-like imperfections are allowed (soft emphasis, natural flow) but avoid robotic repetition.

RESPOND AS THE PATIENT:
        `.trim();
    }
}

export const contextBuilder = new ContextBuilder();
