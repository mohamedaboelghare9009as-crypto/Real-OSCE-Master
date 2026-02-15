
import WebSocket from 'ws';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { OsceCaseV2 } from '../schemas/caseSchema';

// Configuration
const PROJECT_ID = 'osce-ai-sim';
const LOCATION = 'us-central1';
const MODEL_ID = 'gemini-live-2.5-flash-native-audio';
const KEY_PATH = path.join(process.cwd(), 'osce-ai-sim-d5b457979ae1.json');

export interface LiveSessionOptions {
    caseData: OsceCaseV2;
    onAudioChunk: (data: string) => void;
    onTextChunk: (text: string) => void;
    onInterruption: () => void;
    onSetupComplete: () => void;
}

export class GeminiLiveService {
    private auth: GoogleAuth;

    constructor() {
        this.auth = new GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
    }

    private async getAccessToken() {
        const client = await this.auth.getClient();
        const token = await client.getAccessToken();
        return token.token;
    }

    /**
     * Creates a Bidirectional WebSocket connection to Gemini Live
     */
    async createLiveSession(options: LiveSessionOptions): Promise<WebSocket> {
        const token = await this.getAccessToken();
        if (!token) throw new Error("Failed to get access token for Gemini Live");

        const url = `wss://${LOCATION}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`;

        console.log(`[GeminiLive] Connecting to Bidi Endpoint...`);

        const ws = new WebSocket(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        ws.on('open', () => {
            console.log("[GeminiLive] WebSocket Connected.");
            this.sendSetupMessage(ws, options.caseData);
        });

        ws.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());

                if (response.setupComplete) {
                    console.log("[GeminiLive] Setup Complete.");
                    options.onSetupComplete();
                }

                if (response.serverContent) {
                    const serverContent = response.serverContent;

                    if (serverContent.interrupted) {
                        console.log("[GeminiLive] Interruption detected.");
                        options.onInterruption();
                    }

                    if (serverContent.modelDraft) {
                        serverContent.modelDraft.parts?.forEach((part: any) => {
                            if (part.inlineData) {
                                options.onAudioChunk(part.inlineData.data); // Base64 Audio
                            }
                            if (part.text) {
                                options.onTextChunk(part.text);
                            }
                        });
                    }
                }

                if (response.toolCall) {
                    this.handleToolCall(ws, response.toolCall, options.caseData);
                }

            } catch (e) {
                console.error("[GeminiLive] Message Parse Error:", e);
            }
        });

        ws.on('error', (err) => console.error("[GeminiLive] WebSocket Error:", err.message));
        ws.on('close', (code, reason) => console.log(`[GeminiLive] Connection Closed: ${code}`));

        return ws;
    }

    private generateActorScript(caseData: OsceCaseV2): string {
        const { demographics, emotional_state, history } = caseData.truth;

        // Logic-based style modifiers
        const historyData = history as any;
        const painLevel = (historyData.chief_complaint_severity || parseInt(historyData.severity) || 0) > 7 ? "Severe" : "Mild";
        const anxietyLevel = emotional_state === 'Anxious' ? "High" : "Low";

        return `
        [IDENTITY]
        Name: ${(demographics as any).name || 'Unknown'}. You are a ${demographics.age}-year-old ${demographics.sex}.
        
        [ACTING DIRECTIONS]
        - CLARITY OVERRIDE: Your primary goal is to provide accurate information to the doctor. DO NOT let your shortness of breath or pain stopped you from finishing a sentence.
        - VOICE TONE: ${painLevel === 'Severe' ? 'Breathless and strained, but CLEAR and INTELLIGIBLE.' : 'Tired and quiet.'}
        - MANNERISMS: ${anxietyLevel === 'High' ? 'Nervous but articulate.' : 'Direct but slow.'}
        - PAUSES: Use short pauses for breath, but NEVER trail off into silence if you haven't finished your thought.
        - REACTION: If the doctor uses medical jargon, say: "I don't understand those big words, doctor."
        
        [SOURCE OF TRUTH]
        History: ${JSON.stringify(history)}
        `.trim();
    }

    private selectVoice(caseData: OsceCaseV2): string {
        const { demographics } = caseData.truth;
        const isMale = demographics.sex.toLowerCase() === 'male';
        const age = demographics.age;

        if (isMale) {
            return age > 50 ? 'Charon' : 'Puck';
        } else {
            return age > 50 ? 'Vindemiatrix' : 'Leda';
        }
    }

    private sendSetupMessage(ws: WebSocket, caseData: OsceCaseV2) {
        const voiceName = this.selectVoice(caseData);

        const setupMessage = {
            setup: {
                model: `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}`,
                system_instruction: {
                    parts: [{ text: this.generateActorScript(caseData) }]
                },
                tools: [
                    {
                        function_declarations: [
                            {
                                name: "get_patient_details",
                                description: "Get specific patient medical history or social details from the case file",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        query: { type: "string", description: "The specific detail needed (e.g. allergies, family history)" }
                                    },
                                    required: ["query"]
                                }
                            }
                        ]
                    }
                ],
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: { prebuilt_voice_config: { voice_name: voiceName } }
                    }
                }
            }
        };

        console.log(`[GeminiLive] Handshake: Voice=${voiceName}, Model=${MODEL_ID}`);
        ws.send(JSON.stringify(setupMessage));
    }

    private handleToolCall(ws: WebSocket, toolCall: any, caseData: OsceCaseV2) {
        console.log("[GeminiLive] Handling Tool Call:", toolCall.functionCalls?.[0]?.name);

        // Simple synchronous lookup in caseData.truth
        const responses = toolCall.functionCalls.map((call: any) => {
            const query = (call.args.query || '').toLowerCase();
            let result = "Details not found in file.";

            if (query.includes('allerg')) result = caseData.truth.allergies || "No known allergies.";
            if (query.includes('family')) result = caseData.truth.family_history || "Nothing significant.";
            if (query.includes('past')) result = caseData.truth.past_medical_history || "No significant past history.";
            if (query.includes('social')) result = JSON.stringify(caseData.truth.social_history || {});

            return {
                name: call.name,
                response: { content: result }
            };
        });

        const responseMessage = {
            toolResponse: {
                functionResponses: responses
            }
        };

        ws.send(JSON.stringify(responseMessage));
    }

    /**
     * Sends user audio or text to the live session
     */
    sendContent(ws: WebSocket, text?: string, audioBase64?: string) {
        if (ws.readyState !== WebSocket.OPEN) return;

        const message: any = { clientContent: { turns: [] } };

        if (text) {
            message.clientContent.turns.push({
                role: 'user',
                parts: [{ text }]
            });
            message.clientContent.turnComplete = true;
        }

        if (audioBase64) {
            // Native Multimodal Live also supports direct audio input
            // But for this project, we might still use our existing STT or switch
            message.clientContent.turns.push({
                role: 'user',
                parts: [{ inlineData: { mimeType: 'audio/pcm;rate=16000', data: audioBase64 } }]
            });
        }

        ws.send(JSON.stringify(message));
    }
}

export const geminiLiveService = new GeminiLiveService();
