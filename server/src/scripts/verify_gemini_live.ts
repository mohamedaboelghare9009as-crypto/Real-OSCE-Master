
import WebSocket from 'ws';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

// Configuration
const PROJECT_ID = 'osce-ai-sim';
const LOCATION = 'us-central1';
// Note: gemini-2.0-flash-exp is the current standard for Multimodal Live as of early 2025.
// However, I will use the user's specific string first.
const MODEL_ID = 'gemini-live-2.5-flash-native-audio';
const KEY_PATH = path.join(process.cwd(), 'osce-ai-sim-d5b457979ae1.json');

async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

async function verifyGeminiLive() {
    console.log("--- GEMINI LIVE WEBSOCKET VERIFICATION ---");

    try {
        const token = await getAccessToken();
        if (!token) throw new Error("Failed to get access token");

        const url = `wss://${LOCATION}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`;

        console.log(`Connecting to: ${url}`);

        const ws = new WebSocket(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        ws.on('open', () => {
            console.log("✅ WebSocket connection opened!");

            // Setup Message with Tools for Grounding
            const setupMessage = {
                setup: {
                    model: `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}`,
                    system_instruction: {
                        parts: [{ text: "You are Alex, a 55-year-old accountant with chest pain. Be realistic, use sighs and gasps. Respond as the patient." }]
                    },
                    tools: [
                        {
                            function_declarations: [
                                {
                                    name: "get_medical_history",
                                    description: "Get the patient's medical history details from the database",
                                    parameters: {
                                        type: "object",
                                        properties: {
                                            topic: { type: "string", description: "The specific history topic (e.g. onset, allergies)" }
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    generation_config: {
                        response_modalities: ["audio"],
                        speech_config: {
                            voice_config: { prebuilt_voice_config: { voice_name: "Puck" } }
                        }
                    }
                }
            };

            console.log("Sending Setup Message...");
            ws.send(JSON.stringify(setupMessage));
        });

        ws.on('message', (data) => {
            const response = JSON.parse(data.toString());
            // console.log("\n[RAW RECEIVED]:", JSON.stringify(response, null, 2));

            if (response.setupComplete) {
                console.log("🚀 Setup Complete received! READY.");

                const testTurn = {
                    clientContent: {
                        turns: [{
                            role: 'user',
                            parts: [{ text: "Hello Alex, tell me about your chest pain." }]
                        }],
                        turnComplete: true
                    }
                };
                console.log("Sending Test Turn...");
                ws.send(JSON.stringify(testTurn));
            }

            if (response.serverContent) {
                const draft = response.serverContent.modelDraft;
                if (draft) {
                    console.log("✅ Received Model Draft Content");
                    draft.parts?.forEach((part: any, i: number) => {
                        if (part.text) console.log(` [TEXT] ${part.text}`);
                        if (part.inlineData) console.log(` [AUDIO] Chunk of ${part.inlineData.data.length} bytes`);
                        if (part.call) console.log(` [TOOL CALL] ${part.call.name}(${JSON.stringify(part.call.args)})`);
                    });
                }

                if (response.serverContent.turnComplete) {
                    console.log("🏁 Turn Complete. SUCCESS.");
                    setTimeout(() => ws.close(), 2000);
                }

                if (response.serverContent.interrupted) {
                    console.log("⚠️ INTERRUPTION detected!");
                }
            }

            if (response.toolCall) {
                console.log("🔧 Received TOOL CALL:", response.toolCall);
                // Simulate tool response
                const toolResponse = {
                    toolResponse: {
                        functionResponses: [
                            {
                                name: "get_medical_history",
                                response: { content: "Pain started 2 hours ago while gardening. It is crushing and radiates to the arm." }
                            }
                        ]
                    }
                };
                console.log("Sending simulated Tool Response...");
                ws.send(JSON.stringify(toolResponse));
            }
        });

        ws.on('error', (err) => {
            console.error("❌ WebSocket Error:", err.message);
        });

        ws.on('close', (code, reason) => {
            console.log(`WebSocket closed: Code ${code}, Reason: ${reason}`);
        });

    } catch (e: any) {
        console.error("❌ VERIFICATION FAILED:", e.message);
    }
}

verifyGeminiLive();
