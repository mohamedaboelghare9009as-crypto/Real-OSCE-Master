
import { VoiceInput, VoiceActionResponse, VoicePersona } from './schemas';
import { PERSONAS } from '../personas/profiles';
import { asrService } from '../asr/asrService';
import { ttsService } from '../tts/ttsService';
import { mcpLayer } from '../../mcp'; // Leverage base MCP for heavy lifting
import { sessionService } from '../../services/sessionService';
import { Session } from '../../models/Session'; // To track actions

export class VoiceMCP {

    /**
     * Main Pipeline: Audio/Text -> ASR -> MCP -> AI -> MCP -> TTS
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
            session.userId, // Use real user ID
            session.caseId, // Use real case ID
            transcript,
            input.sessionId
        );

        // 4. Extract AI Response & Select Persona
        // TODO: Implement dynamic persona selection based on case metadata
        // For now, assuming persona mapping
        const persona: VoicePersona = PERSONAS[(session as any).personaId] || PERSONAS['patient_default'];

        // If MCP denied request
        let finalText = mcpResponse.content || "I didn't catch that.";
        let allowed = true;

        if (mcpResponse.tool_calls?.some(t => t.name === 'deny_request')) {
            allowed = false;
            finalText = "I can't answer that right now.";
        }

        // Construct SSML with persona style
        // e.g. <speak><prosody rate="..."><google:speak-style name="...">text</google:speak-style></prosody></speak>
        // Note: 'google:speak-style' is specific to certain standard voices, usually not Journey.
        // Journey voices are "Generative" and don't always respect SSML tags nicely, but let's try standard prosody first.
        // Or if using standard voices (en-US-Standard-C), we can use style.

        // Let's use basic SSML for pause/speed/pitch - no extra whitespace
        const ssml = `<speak><prosody rate="${persona.speed}" pitch="${persona.pitch}st">${finalText}</prosody></speak>`;

        // 5. TTS Generation with Persona (SSML)
        const audioUrl = await ttsService.synthesize(
            ssml,
            persona.voiceId,
            1.0, // speed handled in SSML
            0.0, // pitch handled in SSML
            true // isSsml
        );

        // 6. Structure Response for Frontend
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
     */
    private getPersonaPromptForRole(role: 'patient' | 'nurse', tone: string): string {
        // ... (Keep existing prompt logic)
        return `You are a ${role}. Tone: ${tone}.`;
    }
}

export const voiceMcp = new VoiceMCP();
