
import { VoiceInput, VoiceActionResponse, VoicePersona } from './schemas';
import { PERSONAS } from '../personas/profiles';
import { asrService } from '../asr/asrService';
import { ttsService } from '../../services/ttsService';
import { TTSPromptBuilder } from '../promptBuilder';
import { mcpLayer } from '../../mcp'; // Leverage base MCP for heavy lifting
import { sessionService } from '../../services/sessionService';
import { Session } from '../../models/Session'; // To track actions

export class VoiceMCP {

    /**
     * Main Pipeline: Audio/Text -> ASR -> MCP -> AI -> MCP -> TTS (with Master Prompt)
     */
    async processVoiceInteraction(input: VoiceInput): Promise<{ audioUrl: string | null, transcript: string, data: VoiceActionResponse }> {

        // 1. ASR
        let transcript = input.text;
        if (!transcript && input.audioBase64) {
            transcript = await asrService.transcribe(input.audioBase64);
        }
        if (!transcript) {
            throw new Error("No input provided (audio or text)");
        }

        // 2. Fetch Session to get Case ID and Context
        const session = await sessionService.getSession(input.sessionId);
        if (!session) {
            console.error(`[VoiceMCP] Session not found for ID: ${input.sessionId}`);
            throw new Error("Session invalid");
        }

        // 3. Base MCP Processing
        const mcpResponse = await mcpLayer.processUserRequest(
            session.userId,
            session.caseId,
            transcript,
            input.sessionId
        );

        // 4. Extract AI Response & Select Persona
        const persona: VoicePersona = PERSONAS[(session as any).personaId] || PERSONAS['patient_default'];

        // If MCP denied request
        let finalText = mcpResponse.content || "I didn't catch that.";
        let allowed = true;

        if (mcpResponse.tool_calls?.some(t => t.name === 'deny_request')) {
            allowed = false;
            finalText = "I can't answer that right now.";
        }

        // 5. Build Master Prompt for TTS Context
        const masterPrompt = TTSPromptBuilder.buildMasterPrompt(persona, (session as any).caseData);
        const voiceInstructions = TTSPromptBuilder.buildVoiceInstructions(persona);

        console.log(`[VoiceMCP] Using persona: ${TTSPromptBuilder.getPersonaSummary(persona)}`);
        console.log(`[VoiceMCP] Voice instructions: ${voiceInstructions}`);

        // 6. Construct SSML (Skipped for DeepInfra, using raw text with style parameters)
        // const ssml = `<speak><prosody rate="${persona.speed}" pitch="${persona.pitch}st">${finalText}</prosody></speak>`;

        // 7. TTS Generation with Persona
        // Note: The Master Prompt template is informational for documentation
        // The actual voice control comes from persona parameters (speed, pitch, voiceId)
        const audioUrl = await ttsService.synthesize(
            finalText, // Use raw text, not SSML, as DeepInfra handles it better
            persona.voiceId,
            0.5, // exaggeration default
            0.8, // temperature default
            0.5, // cfg default
            'mp3' // responseFormat
        );

        // 8. Structure Response for Frontend
        const response: VoiceActionResponse = {
            speaker: persona.role,
            text: finalText,
            action: mcpResponse.tool_calls?.[0]?.name,
            allowed: allowed
        };

        return {
            audioUrl,
            transcript,
            data: response
        };
    }

    /**
     * Get persona prompt based on role and tone
     * Now enhanced with Master Prompt template
     */
    getPersonaPromptForRole(role: 'patient' | 'nurse', tone: string, caseData?: any): string {
        const personaId = role === 'nurse' ? 'nurse_professional' : 'patient_default';
        const persona = PERSONAS[personaId];

        return TTSPromptBuilder.buildMasterPrompt(persona, caseData);
    }
}

export const voiceMcp = new VoiceMCP();
